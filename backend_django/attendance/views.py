import traceback
from rest_framework import viewsets, generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.contrib.auth import get_user_model
from .models import Ficha, AttendanceSession, Attendance
from .serializers import (
    FichaSerializer,
    AttendanceSessionSerializer,
    AttendanceLogSerializer,
    AttendanceLogUpdateSerializer,
    SimpleAttendanceSessionSerializer
)
from .permissions import IsAdminOrReadOnly, IsInstructorOfFicha, IsInstructor
from .filters import AttendanceFilter, FichaFilter, SessionFilter
from django.db.models import Count, Q
from excuses.models import Excuse
from django.utils import timezone
import datetime
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
from reportlab.lib.styles import getSampleStyleSheet
from django.http import HttpResponse

User = get_user_model()

# Helper function for global report data
def _get_global_report_data(view_instance):
    # Totales generales (no se filtran)
    total_fichas = Ficha.objects.count()
    total_instructors = User.objects.filter(role='instructor').count()
    total_students = User.objects.filter(role='student').count()
    total_sessions = AttendanceSession.objects.count()
    total_excuses = Excuse.objects.count()
    pending_excuses_count = Excuse.objects.filter(status='pending').count()

    # Filtrar el queryset de asistencia usando el filterset de la vista
    attendance_queryset = Attendance.objects.all()
    
    filtered_attendance = view_instance.filter_queryset(attendance_queryset)
    
    # Calcular estadísticas basadas en los datos filtrados
    attendance_stats = filtered_attendance.values('status').annotate(count=Count('status'))
    stats_dict = {stat['status']: stat['count'] for stat in attendance_stats}

    # Nuevas estadísticas
    fichas_con_mas_inasistencias = Ficha.objects.annotate(
        num_absences=Count('sessions__attendances', filter=Q(sessions__attendances__status='absent'))
    ).order_by('-num_absences')[:5]

    instructores_con_mas_sesiones = User.objects.filter(role='instructor').annotate(
        num_sessions=Count('fichas__sessions')
    ).order_by('-num_sessions')[:5]

    data = {
        'total_fichas': total_fichas,
        'total_instructors': total_instructors,
        'total_students': total_students,
        'total_sessions': total_sessions,
        'total_excuses': total_excuses,
        'pending_excuses_count': pending_excuses_count,
        'attendance_by_status': {
            'present': stats_dict.get('present', 0),
            'absent': stats_dict.get('absent', 0),
            'late': stats_dict.get('late', 0),
            'excused': stats_dict.get('excused', 0),
        },
        'fichas_con_mas_inasistencias': [
            f"{ficha.numero_ficha} - {ficha.programa_formacion}: {ficha.num_absences} inasistencias"
            for ficha in fichas_con_mas_inasistencias
        ],
        'instructores_con_mas_sesiones': [
            f"{instructor.get_full_name() or instructor.username}: {instructor.num_sessions} sesiones"
            for instructor in instructores_con_mas_sesiones
        ]
    }
    return data

class TodayAttendanceSessionListView(generics.ListAPIView):
    """
    Devuelve las sesiones de asistencia para el día actual
    asignadas al instructor autenticado.
    """
    serializer_class = AttendanceSessionSerializer
    permission_classes = [permissions.IsAuthenticated, IsInstructor]

    def get_queryset(self):
        user = self.request.user
        print(f"DEBUG: User in TodayAttendanceSessionListView: {user.username}, Role: {user.role}")

        if not user.is_authenticated or user.role != 'instructor':
            print("DEBUG: User is not authenticated or not an instructor. Returning empty queryset.")
            return AttendanceSession.objects.none()

        try:
            today = datetime.date.today()
            print(f"DEBUG: Today's date: {today}")

            # Filtra las sesiones por fecha y por las fichas del instructor
            queryset = AttendanceSession.objects.filter(
                ficha__instructors=user,
                date=today
            ).select_related('ficha').order_by('date', 'start_time') # Optimiza la consulta y ordena

            print(f"DEBUG: Queryset for TodayAttendanceSessionListView: {queryset.query}")
            print(f"DEBUG: Number of sessions found: {queryset.count()}")
            
            return queryset
        except Exception as e:
            print(f"ERROR: Exception in TodayAttendanceSessionListView get_queryset: {e}")
            traceback.print_exc()
            return AttendanceSession.objects.none() # Return empty queryset on error

class FichaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para que los Administradores gestionen Fichas (CRUD completo).
    Otros roles solo pueden leer.
    """
    queryset = Ficha.objects.all().prefetch_related('instructors').prefetch_related('students')
    serializer_class = FichaSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]
    filterset_class = FichaFilter # Add filterset_class here

    def get_queryset(self):
        try:
            # Apply default queryset filtering based on role if needed, then apply filters
            queryset = super().get_queryset()
            return queryset
        except Exception as e:
            print(f"Error in FichaViewSet get_queryset: {e}")
            traceback.print_exc()
            raise e

class InstructorFichaListView(generics.ListAPIView):
    """
    Endpoint para que un instructor autenticado vea solo sus fichas asignadas.
    """
    serializer_class = FichaSerializer
    permission_classes = [permissions.IsAuthenticated, IsInstructor]
    filterset_class = FichaFilter # Add filterset_class here

    def get_queryset(self):
        try:
            queryset = Ficha.objects.filter(instructors=self.request.user).prefetch_related('instructors').prefetch_related('students')
            # Apply filters from the filterset
            return self.filter_queryset(queryset)
        except Exception as e:
            # Log the exception for debugging purposes
            print(f"Error in InstructorFichaListView get_queryset: {e}")
            traceback.print_exc() # Print full traceback
            raise e # Re-raise the exception after logging

class InstructorDailySessionsView(generics.ListAPIView):
    """
    Endpoint para que un instructor vea las sesiones programadas para el día actual
    en sus fichas asignadas.
    """
    serializer_class = AttendanceSessionSerializer
    permission_classes = [permissions.IsAuthenticated, IsInstructor]

    def get_queryset(self):
        user = self.request.user
        if user.role != 'instructor':
            return AttendanceSession.objects.none()

        today = timezone.now().date()
        # Get fichas assigned to the instructor
        assigned_fichas = user.fichas.all()
        
        queryset = AttendanceSession.objects.filter(
            ficha__in=assigned_fichas,
            date=today
        ).order_by('start_time')
        
        return queryset


class ListAbsencesView(generics.ListAPIView):
    """
    Endpoint para que un estudiante autenticado vea sus inasistencias.
    """
    serializer_class = AttendanceLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role != 'student':
            return Attendance.objects.none()
        return Attendance.objects.filter(student=user, status='absent').select_related('session', 'session__ficha')

class SessionViewSet(viewsets.ModelViewSet):
    queryset = AttendanceSession.objects.all()
    """
    ViewSet para que un Instructor gestione las sesiones de sus fichas.
    """
    serializer_class = AttendanceSessionSerializer
    permission_classes = [permissions.IsAuthenticated, IsInstructorOfFicha]
    filterset_class = SessionFilter # Add filterset_class here

    def get_queryset(self):
        """Un instructor solo puede ver/gestionar sesiones de sus propias fichas."""
        try:
            queryset = super().get_queryset()
            if self.request.user.role == 'instructor':
                queryset = queryset.filter(ficha__instructors=self.request.user)
            return queryset
        except Exception as e:
            print(f"Error in SessionViewSet get_queryset: {e}")
            traceback.print_exc()
            raise e

    def perform_create(self, serializer):
        ficha = serializer.validated_data.get('ficha')
        # La validación de permisos ya se hace en IsInstructorOfFicha, pero una doble verificación no hace daño.
        if not ficha.instructors.filter(id=self.request.user.id).exists():
            raise permissions.PermissionDenied("No puede crear sesiones para una ficha que no tiene asignada.")
        
        # Al crear la sesión, se generan los registros de asistencia para cada estudiante.
        session = serializer.save()
        students_in_ficha = session.ficha.students.all()
        attendance_records = [Attendance(session=session, student=student) for student in students_in_ficha]
        Attendance.objects.bulk_create(attendance_records)

    @action(detail=True, methods=['get'], url_path='toggle-activation')
    def toggle_activation(self, request, pk=None):
        """
        Activa o desactiva el reconocimiento facial para una sesión.
        """
        session = self.get_object()
        session.is_active = not session.is_active
        session.save()
        return Response({'status': 'success', 'is_active': session.is_active})

    @action(detail=True, methods=['get'], url_path='attendance-log')
    def attendance_log(self, request, pk=None):
        session = self.get_object()  # Get the specific session
        attendance_logs = Attendance.objects.filter(session=session)
        serializer = AttendanceLogSerializer(attendance_logs, many=True)
        return Response(serializer.data)

class ManualAttendanceUpdateView(generics.UpdateAPIView):
    """
    Vista para que un instructor actualice manualmente el estado de una asistencia.
    """
    queryset = Attendance.objects.all()
    serializer_class = AttendanceLogUpdateSerializer
    permission_classes = [permissions.IsAuthenticated, IsInstructorOfFicha]

    

class AttendanceLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para que los usuarios vean sus registros de asistencia.
    - Estudiantes: Ven solo sus propios registros.
    - Instructores: Ven los registros de todas sus fichas.
    - Admins: Ven todos los registros.
    """
    serializer_class = AttendanceLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_class = AttendanceFilter # Add filterset_class here

    def get_queryset(self):
        user = self.request.user
        queryset = super().get_queryset()
        try:
            if user.role == 'student':
                queryset = queryset.filter(student=user)
            elif user.role == 'instructor':
                queryset = queryset.filter(session__ficha__instructors=user)
            # Admins see all, no additional filter needed for them
            return queryset
        except Exception as e:
            print(f"Error in AttendanceLogViewSet get_queryset: {e}")
            traceback.print_exc()
            raise e

class GlobalReportView(generics.GenericAPIView):
    """
    Vista para que un Administrador obtenga un reporte global de estadísticas.
    Ahora soporta filtros por fecha y ficha.
    """
    permission_classes = [permissions.IsAdminUser]
    filterset_class = AttendanceFilter

    def get(self, request, *args, **kwargs):
        try:
            data = _get_global_report_data(self)
            return Response(data)
        except Exception as e:
            traceback.print_exc()
            return Response({"error": f"An unexpected error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class InstructorDashboardSummaryView(generics.GenericAPIView):
    """
    Vista para que un Instructor obtenga un resumen de su dashboard.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        if user.role != 'instructor':
            return Response({'detail': 'Acceso denegado. Solo instructores.'}, status=status.HTTP_403_FORBIDDEN)

        try:
            # Fichas asignadas
            assigned_fichas = Ficha.objects.filter(instructors=user)
            total_assigned_fichas = assigned_fichas.count()

            # Sesiones programadas del día
            today = timezone.now().date()
            today_sessions = AttendanceSession.objects.filter(
                ficha__in=assigned_fichas,
                date=today
            ).count()

            # Excusas pendientes de revisión
            pending_excuses = Excuse.objects.filter(
                session__ficha__in=assigned_fichas,
                status='pending'
            ).count()

            # Estadísticas de asistencia de sus aprendices (ejemplo: total de asistencias)
            # Esto podría ser más complejo, pero para un resumen inicial:
            total_attendances_by_instructor = Attendance.objects.filter(
                session__ficha__instructors=user
            ).count()
            
            # Example: count of students in assigned fichas
            total_students_in_assigned_fichas = 0
            for ficha in assigned_fichas:
                total_students_in_assigned_fichas += ficha.students.count()

            data = {
                'total_assigned_fichas': total_assigned_fichas,
                'today_sessions': today_sessions,
                'pending_excuses': pending_excuses,
                'total_students_in_assigned_fichas': total_students_in_assigned_fichas,
                'total_attendances_recorded': total_attendances_by_instructor,
            }
            return Response(data)
        except Exception as e:
            return Response({"error": f"An unexpected error occurred in the backend: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ApprenticeDashboardSummaryView(generics.GenericAPIView):
    """
    Vista para que un Aprendiz obtenga un resumen de su dashboard.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        if user.role != 'student':
            return Response({'detail': 'Acceso denegado. Solo aprendices.'}, status=status.HTTP_403_FORBIDDEN)

        try:
            total_sessions_attended = Attendance.objects.filter(student=user, status__in=['present', 'late', 'excused']).count()
            total_sessions_for_student = Attendance.objects.filter(student=user).count()
            
            attendance_percentage = 0
            if total_sessions_for_student > 0:
                attendance_percentage = (total_sessions_attended / total_sessions_for_student) * 100

            data = {
                'attendance_percentage': round(attendance_percentage, 2),
                'upcoming_sessions': 0,
                'pending_excuses': 0,
                'late_count': 0,
                'absent_count': 0,
            }
            return Response(data)
        except Exception as e:
            error_message = f"An unexpected error occurred in the backend: {str(e)}"
            return Response({"error": error_message, "traceback": traceback.format_exc()}, status=status.HTTP_200_OK)

class ApprenticeUpcomingSessionsView(generics.ListAPIView):
    """
    Vista para que un Aprendiz obtenga una lista de sus próximas sesiones.
    """
    serializer_class = SimpleAttendanceSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role != 'student':
            return AttendanceSession.objects.none()

        now = timezone.now()
        return AttendanceSession.objects.filter(
            ficha__in=user.fichas_enrolled.all(),
            date__gte=now.date(),
            start_time__gte=now.time()
        ).exclude(
            attendances__student=user, 
            attendances__status__in=['present', 'late', 'excused']
        ).order_by('date', 'start_time')

class GlobalAttendancePDFReportView(generics.GenericAPIView):
    """
    Vista para que un Administrador genere un reporte PDF de estadísticas globales de asistencia.
    """
    permission_classes = [permissions.IsAdminUser]
    filterset_class = AttendanceFilter # Needed for the helper function

    def get(self, request, *args, **kwargs):
        try:
            # Ugly hack to make the helper function work
            report_data = _get_global_report_data(self)

            response = HttpResponse(content_type='application/pdf')
            response['Content-Disposition'] = 'attachment; filename="global_attendance_report.pdf"'

            doc = SimpleDocTemplate(response, pagesize=letter)
            elements = []
            styles = getSampleStyleSheet()

            elements.append(Paragraph("Reporte Global de Asistencia SENA", styles['h1']))
            elements.append(Paragraph(f"Fecha: {timezone.now().strftime('%Y-%m-%d %H:%M')}", styles['Normal']))
            elements.append(Paragraph("<br/><br/>", styles['Normal']))

            # Resumen general
            summary_data = [
                ["Total de Fichas", report_data['total_fichas']],
                ["Total de Instructores", report_data['total_instructors']],
                ["Total de Aprendices", report_data['total_students']],
                ["Total de Sesiones", report_data['total_sessions']],
                ["Total de Excusas", report_data['total_excuses']],
                ["Excusas Pendientes", report_data['pending_excuses_count']],
            ]
            summary_table = Table(summary_data, colWidths=[3 * inch, 1.5 * inch])
            summary_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            elements.append(summary_table)
            elements.append(Paragraph("<br/><br/>", styles['Normal']))

            # Estadísticas de asistencia
            elements.append(Paragraph("Estadísticas de Asistencia por Estado", styles['h2']))
            attendance_data = [['Estado', 'Cantidad']] + [[status.capitalize(), count] for status, count in report_data['attendance_by_status'].items()]
            attendance_table = Table(attendance_data, colWidths=[2 * inch, 2 * inch])
            attendance_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            elements.append(attendance_table)
            elements.append(Paragraph("<br/><br/>", styles['Normal']))

            # Fichas con más inasistencias
            elements.append(Paragraph("Top 5 Fichas con Más Inasistencias", styles['h2']))
            fichas_data = [[Paragraph(item, styles['Normal'])] for item in report_data['fichas_con_mas_inasistencias']]
            fichas_table = Table(fichas_data, colWidths=[4.5 * inch])
            elements.append(fichas_table)
            elements.append(Paragraph("<br/><br/>", styles['Normal']))

            # Instructores con más sesiones
            elements.append(Paragraph("Top 5 Instructores con Más Sesiones", styles['h2']))
            instructors_data = [[Paragraph(item, styles['Normal'])] for item in report_data['instructores_con_mas_sesiones']]
            instructors_table = Table(instructors_data, colWidths=[4.5 * inch])
            elements.append(instructors_table)

            doc.build(elements)
            return response

        except Exception as e:
            traceback.print_exc()
            return HttpResponse(f"Error al generar el reporte PDF: {e}", content_type="text/plain", status=500)

class FichaAttendanceReportView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, ficha_id, *args, **kwargs):
        try:
            ficha = Ficha.objects.get(id=ficha_id)
        except Ficha.DoesNotExist:
            return Response({"error": "Ficha not found."}, status=status.HTTP_404_NOT_FOUND)

        user = request.user
        if user.role == 'instructor' and not ficha.instructors.filter(id=user.id).exists():
            return Response({"error": "You do not have permission to view this ficha."}, status=status.HTTP_403_FORBIDDEN)
        
        if user.role == 'student':
            return Response({"error": "Students are not allowed to view this report."}, status=status.HTTP_403_FORBIDDEN)

        sessions = AttendanceSession.objects.filter(ficha=ficha).order_by('date', 'start_time')
        students = ficha.students.all()
        attendances = Attendance.objects.filter(session__in=sessions).select_related('student', 'session')

        student_attendances = {student.id: {} for student in students}
        for att in attendances:
            student_attendances[att.student_id][att.session_id] = att.status

        response_data = {
            "ficha": {
                "id": ficha.id,
                "numero_ficha": ficha.numero_ficha,
                "programa_formacion": ficha.programa_formacion,
            },
            "sessions": [
                {"id": s.id, "date": s.date, "start_time": s.start_time} for s in sessions
            ],
            "students": [
                {
                    "id": s.id,
                    "full_name": s.get_full_name() or s.username,
                    "attendances": student_attendances.get(s.id, {})
                } for s in students
            ]
        }

        return Response(response_data)
