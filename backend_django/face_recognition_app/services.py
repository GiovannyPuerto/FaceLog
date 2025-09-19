# face_recognition_app/services.py
import face_recognition
import numpy as np
from io import BytesIO
from PIL import Image
from django.utils import timezone
from datetime import datetime

from attendance.models import Attendance, Ficha
from .models import FaceEncoding, FaceVerificationLog, FaceRecognitionSettings # Added imports

def get_face_encoding_from_image(image_file):
    """
    Carga una imagen y devuelve la primera codificación facial encontrada.
    Devuelve None si no se encuentra ninguna cara o si hay más de una.
    """
    try:
        image = face_recognition.load_image_file(image_file)
        encodings = face_recognition.face_encodings(image)
        if len(encodings) == 1:
            return encodings[0]
        return None
    except Exception as e:
        print(f"Error processing image for encoding: {e}")
        return None

def recognize_faces_in_stream(image_file, session_id):
    """
    Servicio principal para el reconocimiento facial en tiempo real.
    Recibe una imagen y el ID de una sesión de asistencia activa.
    """
    log_entry = None # Initialize log_entry
    try:
        settings = FaceRecognitionSettings.get_settings() # Get global settings

        # 1. Cargar las codificaciones de los estudiantes inscritos en la sesión
        ficha = Ficha.objects.get(sessions__id=session_id)
        known_encodings = []
        known_student_ids = []

        students = ficha.students.all()
        for student in students:
            # Get all face encodings for the current student
            student_encoding = student.face_encoding_data # Correct way to access OneToOneField

            if student_encoding: # Check if a FaceEncoding object exists for the student
                encoding_array = student_encoding.get_encoding_array()
                if encoding_array is not None:
                    known_encodings.append(encoding_array)
                    known_student_ids.append(student.id) # Store student ID for each encoding
        
        if not known_encodings:
            if settings.enable_logging:
                FaceVerificationLog.objects.create(
                    session_id=session_id,
                    status='no_registered_face',
                    error_message="No hay rostros registrados para esta ficha." 
                )
            return {"error": "No hay rostros registrados para esta ficha."}

        # 2. Cargar la imagen del stream y encontrar todas las caras
        stream_image = face_recognition.load_image_file(image_file)
        stream_locations = face_recognition.face_locations(stream_image)
        stream_encodings = face_recognition.face_encodings(stream_image, stream_locations)

        if not stream_encodings:
            if settings.enable_logging:
                FaceVerificationLog.objects.create(
                    session_id=session_id,
                    status='no_face_detected',
                    error_message="No se detectó ningún rostro en la imagen."
                )
            return {"error": "No se detectó ningún rostro en la imagen."}

        recognized_students = []

        # 3. Comparar cada cara encontrada con las caras conocidas
        for stream_encoding in stream_encodings:
            matches = face_recognition.compare_faces(known_encodings, stream_encoding, tolerance=settings.confidence_threshold) # Use confidence_threshold
            
            matched_student_id = None
            if True in matches:
                first_match_index = matches.index(True)
                matched_student_id = known_student_ids[first_match_index]

            # Log the attempt for each detected face
            log_status = 'failed'
            log_student = None
            if matched_student_id:
                log_status = 'success'
                log_student = students.get(id=matched_student_id) # Get the actual student object

            if settings.enable_logging:
                log_entry = FaceVerificationLog.objects.create(
                    user=log_student, # Can be None if no match
                    session_id=session_id,
                    status=log_status,
                    confidence_score=np.min(face_recognition.face_distance(known_encodings, stream_encoding)) if known_encodings else None, # Closest distance as confidence
                    # ip_address and user_agent would need to be passed from the request, not available here
                )

            if matched_student_id:
                # 4. Actualizar el registro de asistencia
                try:
                    attendance_record = Attendance.objects.get(session_id=session_id, student_id=matched_student_id)
                    
                    # Solo actualizar si el estado es 'ausente' para no sobreescribir tardanzas o presentes
                    if attendance_record.status == 'absent':
                        session = attendance_record.session
                        now = timezone.now()
                        
                        # Calcular si es tardanza
                        session_start_datetime = datetime.combine(session.date, session.start_time, tzinfo=now.tzinfo)
                        grace_period_end = session_start_datetime + timezone.timedelta(minutes=session.permisividad)
                        
                        new_status = 'present'
                        if now > grace_period_end:
                            new_status = 'late'
                        
                        attendance_record.status = new_status
                        attendance_record.check_in_time = now
                        attendance_record.verified_by_face = True
                        attendance_record.save()
                        
                        recognized_students.append({
                            'id': attendance_record.student.id,
                            'full_name': attendance_record.student.get_full_name(),
                            'status': new_status
                        })

                except Attendance.DoesNotExist:
                    # This case means a recognized face is not part of this session's attendance records
                    # Log this as a failed attempt for the recognized user if logging is enabled
                    if settings.enable_logging and log_entry:
                        log_entry.status = 'failed'
                        log_entry.error_message = "Rostro reconocido pero no pertenece a la sesión."
                        log_entry.save()
                    continue 

        return {"recognized_students": recognized_students}

    except Ficha.DoesNotExist:
        if settings.enable_logging:
            FaceVerificationLog.objects.create(
                session_id=session_id,
                status='error',
                error_message="La ficha de la sesión no existe."
            )
        return {"error": "La sesión de asistencia no existe o no tiene una ficha asociada."}
    except Exception as e:
        error_msg = f"Ocurrió un error durante el reconocimiento: {e}"
        print(f"Error during face recognition: {e}")
        if settings.enable_logging:
            FaceVerificationLog.objects.create(
                session_id=session_id,
                status='error',
                error_message=error_msg
            )
        return {"error": error_msg}