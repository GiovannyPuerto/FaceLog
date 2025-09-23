# excuses/serializers.py
from rest_framework import serializers
from .models import Excuse
from attendance.serializers import SimpleUserSerializer, AttendanceSessionSerializer

class ExcuseSerializer(serializers.ModelSerializer):
    """
    Serializador para la creación y visualización de excusas.
    """
    student = SimpleUserSerializer(read_only=True)
    session = AttendanceSessionSerializer(read_only=True)
    
    class Meta:
        model = Excuse
        fields = ['id', 'student', 'session', 'reason', 'document', 'status', 'reviewed_by', 'review_comment', 'created_at', 'reviewed_at']
        read_only_fields = ['id', 'status', 'reviewed_by', 'review_comment', 'created_at', 'reviewed_at']

    def create(self, validated_data):
        # Asigna el estudiante autenticado al crear la excusa
        validated_data['student'] = self.context['request'].user
        return super().create(validated_data)

class ExcuseCreateSerializer(serializers.ModelSerializer):
    """
    Serializador específico para que un estudiante cree una excusa.
    """
    class Meta:
        model = Excuse
        fields = ['session', 'reason', 'document']

class ExcuseReviewSerializer(serializers.ModelSerializer):
    """
    Serializador para que un instructor revise (apruebe/rechace) una excusa.
    """
    class Meta:
        model = Excuse
        fields = ['status', 'review_comment']
        extra_kwargs = {
            'status': {'required': True},
        }

    def validate_status(self, value):
        if value not in ['approved', 'rejected']:
            raise serializers.ValidationError("El estado solo puede ser 'approved' o 'rejected'.")
        return value