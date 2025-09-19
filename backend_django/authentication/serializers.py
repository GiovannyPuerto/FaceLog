# authentication/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from attendance.models import Ficha
from face_recognition_app.models import FaceEncoding
from face_recognition_app.services import get_face_encoding_from_image
import face_recognition

User = get_user_model()

class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer for password change endpoint.
    """
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    new_password2 = serializers.CharField(required=True)

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Your old password was entered incorrectly. Please enter it again.")
        return value

    def validate(self, data):
        if data['new_password'] != data['new_password2']:
            raise serializers.ValidationError({"new_password": "The two password fields didn't match."})
        
        try:
            validate_password(data['new_password'], self.context['request'].user)
        except ValidationError as e:
            raise serializers.ValidationError({'new_password': list(e.messages)})

        return data

    def save(self, **kwargs):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user

class UserSerializer(serializers.ModelSerializer):
    """
    Serializador para el modelo User.
    """
    fichas = serializers.PrimaryKeyRelatedField(many=True, read_only=True) # Add this line
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'student_id', 'is_active', 'fichas'] # Add 'fichas' to fields
        read_only_fields = ['id', 'role', 'fichas'] # Make fichas read-only

class InstructorSerializer(serializers.ModelSerializer):
    fichas = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Ficha.objects.all(),
        required=False,
        allow_empty=True
    )
    password = serializers.CharField(write_only=True, required=False, validators=[validate_password])

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'password', 'fichas', 'is_active']
        read_only_fields = ['id']

    def create(self, validated_data):
        fichas_data = validated_data.pop('fichas', [])
        password = validated_data.pop('password', None)
        
        # Ensure the role is set to 'instructor'
        validated_data['role'] = 'instructor'
        
        user = User.objects.create(**validated_data)
        if password:
            user.set_password(password)
            user.save()
        
        user.fichas.set(fichas_data) # Assign fichas
        return user

    def update(self, instance, validated_data):
        fichas_data = validated_data.pop('fichas', None)
        password = validated_data.pop('password', None)

        # Update user fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        if password:
            instance.set_password(password)
        
        instance.save()

        if fichas_data is not None:
            instance.fichas.set(fichas_data) # Update fichas
        
        return instance

class RegisterStudentSerializer(serializers.ModelSerializer):
    """
    Serializador específico para que un estudiante cree una excusa.
    """
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    ficha_numero = serializers.CharField(write_only=True, required=True, help_text="Número de la ficha a la que se inscribe el aprendiz")
    face_images = serializers.ListField(child=serializers.ImageField(), write_only=True, required=True, help_text="Múltiples imágenes del rostro para el registro")

    class Meta:
        model = User
        fields = ['username', 'password', 'password2', 'first_name', 'last_name', 'email', 'student_id', 'ficha_numero', 'face_images']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Las contraseñas no coinciden."})
        
        try:
            Ficha.objects.get(numero_ficha=attrs['ficha_numero'])
        except Ficha.DoesNotExist:
            raise serializers.ValidationError({"ficha_numero": "La ficha especificada no existe."})

        # Validar las imágenes faciales y almacenar las codificaciones en los atributos validados
        face_encodings = []
        for i, face_image in enumerate(attrs.get('face_images', [])):
            new_encoding = get_face_encoding_from_image(face_image)
            if new_encoding is None:
                raise serializers.ValidationError({
                    f"face_image_{i}": "No se pudo encontrar un rostro en la imagen o se detectó más de uno. Por favor, suba una imagen clara de su rostro."
                })
            face_encodings.append(new_encoding)
        
        if not face_encodings:
            raise serializers.ValidationError({"face_images": "Debe subir al menos una imagen facial."})

        # Verificar que los rostros no existan ya en la base de datos
        existing_encodings = FaceEncoding.objects.all()
        if existing_encodings.exists():
            known_encodings = [enc.get_encoding_array() for enc in existing_encodings if enc.get_encoding_array() is not None]
            for new_encoding in face_encodings:
                if known_encodings:
                    matches = face_recognition.compare_faces(known_encodings, new_encoding)
                    if True in matches:
                        raise serializers.ValidationError({
                            "face_images": "Al menos uno de los rostros ya ha sido registrado por otro aprendiz."
                        })

        attrs['face_encodings'] = face_encodings
        
        return attrs

    def create(self, validated_data):
        ficha_numero = validated_data.pop('ficha_numero')
        face_images = validated_data.pop('face_images') # Pop the list of images
        face_encodings = validated_data.pop('face_encodings') # Pop the list of encodings
        
        user = User.objects.create_user(
            username=validated_data['username'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            email=validated_data['email'],
            student_id=validated_data['student_id'],
            role='student'  # Rol asignado por defecto
        )
        user.set_password(validated_data['password'])
        user.save()

        # Inscribir al estudiante en la ficha
        ficha = Ficha.objects.get(numero_ficha=ficha_numero)
        ficha.students.add(user)

        # Guardar todas las codificaciones faciales
        if face_encodings:
            face_encoding_obj = FaceEncoding(user=user, profile_image=face_images[0])
            face_encoding_obj.set_encoding_array(face_encodings)
            face_encoding_obj.save()

        return user

class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)

class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.UUIDField(required=True)
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Las contraseñas no coinciden."})
        return attrs