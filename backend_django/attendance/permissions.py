# attendance/permissions.py
from rest_framework import permissions

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Permiso personalizado para permitir solo a los administradores crear/editar/eliminar.
    Otros usuarios (autenticados) pueden ver (GET, HEAD, OPTIONS).
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.role == 'admin'

class IsInstructorOfFicha(permissions.BasePermission):
    """
    Permiso para verificar si el usuario es el instructor de la ficha asociada al objeto.
    """
    def has_object_permission(self, request, view, obj):
        # Para vistas que tienen get_permission_object(), como ManualAttendanceUpdateView
        if hasattr(view, 'get_permission_object'):
            ficha = view.get_permission_object()
            return ficha.instructors.filter(id=request.user.id).exists()

        # Para objetos Ficha
        if hasattr(obj, 'instructors'): # Check for 'instructors' ManyToManyField
            print(f"DEBUG: IsInstructorOfFicha - Checking Ficha object. User ID: {request.user.id}, Ficha ID: {obj.id}, Ficha Instructors: {[i.id for i in obj.instructors.all()]}")
            return obj.instructors.filter(id=request.user.id).exists()
        
        # Para objetos AttendanceSession
        if hasattr(obj, 'ficha') and hasattr(obj.ficha, 'instructors'):
            return obj.ficha.instructors.filter(id=request.user.id).exists()
        
        return False

class IsStudentInFicha(permissions.BasePermission):
    """
    Permiso para verificar si el usuario es un estudiante inscrito en la ficha.
    """
    def has_object_permission(self, request, view, obj):
        ficha = obj.ficha if hasattr(obj, 'ficha') else obj
        return ficha.students.filter(id=request.user.id).exists()

class IsInstructor(permissions.BasePermission):
    """
    Permiso personalizado para permitir el acceso solo a usuarios con rol 'instructor'.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'instructor'