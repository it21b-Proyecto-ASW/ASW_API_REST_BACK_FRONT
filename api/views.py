# api/views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import User, Issue, Comment
from .serializers import (
    UserProfileSerializer,
    UserIssueSerializer,
    UserCommentSerializer,
    UserSerializer
)
from django.shortcuts import get_object_or_404


# --- ISSUES ---

@api_view(['POST'])
def create_issue(request):
    """Crear un nuevo issue."""
    return Response({"message": "ok"})

@api_view(['GET'])
def get_issue(request, issue_id):
    """Obtener info de un issue."""
    return Response({"message": "ok"})

@api_view(['GET'])
def list_issues(request):
    """Obtener una lista de issues."""
    return Response({"message": "ok"})

@api_view(['POST'])
def edit_issue(request, issue_id):
    """Editar un issue existente."""
    return Response({"message": "ok"})

@api_view(['DELETE'])
def delete_issue(request, issue_id):
    """Eliminar un issue."""
    return Response({"message": "ok"})

@api_view(['POST'])
def assign_issue(request):
    """Asignar un issue a un user."""
    return Response({"message": "ok"})

@api_view(['POST'])
def add_file_to_issue(request, issue_id):
    """Anadir un file attachment a un issue."""
    return Response({"message": "ok"})

@api_view(['DELETE'])
def delete_file_from_issue(request, file_id):
    """Eliminar un file attachment de un issue."""
    return Response({"message": "ok"})

@api_view(['POST'])
def bulk_insert_issues(request):
    """Bulk insert de issues."""
    return Response({"message": "ok"})

@api_view(['POST'])
def add_comment(request, issue_id):
    """Anadir un comentario a un issue."""
    return Response({"message": "ok"})

@api_view(['GET'])
def filter_issues(request):
    """Filtrar issues."""
    return Response({"message": "ok"})


# --- USERS ---

@api_view(['POST'])
def assign_apikey_to_user(request, user_id):
    """Asignar apikey a un user."""
    return Response({"message": "ok"})

@api_view(['GET'])
def user_profile(request, user_id):
    """Ver pagina de perfil de un usuario."""
    return Response({"message": "ok"})

@api_view(['POST'])
def edit_user_profile(request, user_id):
    """Editar perfil de usuario seleccionado."""
    return Response({"message": "ok"})


# --- SETTINGS ---

@api_view(['GET'])
def list_settings(request):
    """Listar todos los settings."""
    return Response({"message": "ok"})

@api_view(['POST'])
def create_setting(request):
    """Anadir un setting nuevo."""
    return Response({"message": "ok"})

@api_view(['DELETE'])
def delete_setting(request, setting_id):
    """Eliminar un setting."""
    return Response({"message": "ok"})

@api_view(['PUT'])
def edit_setting(request, setting_id):
    """Editar un setting existente."""
    return Response({"message": "ok"})


# views.py - Implementación de las APIs requeridas

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_info(request, user_id):
    """Obtener información del perfil de usuario"""
    user = get_object_or_404(User, id=user_id)
    serializer = UserProfileSerializer(user)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_issues(request, user_id):
    """Obtener issues asignadas y watched por el usuario"""
    user = get_object_or_404(User, id=user_id)

    # Issues asignadas al usuario
    assigned_issues = Issue.objects.filter(assignedTo=user)
    # Issues watched (necesitarías un modelo WatchList si quieres seguimiento)
    # Por ahora asumimos que watched es lo mismo que assigned
    watched_issues = assigned_issues

    assigned_data = UserIssueSerializer(assigned_issues, many=True).data
    watched_data = UserIssueSerializer(watched_issues, many=True).data

    return Response({
        'assigned_issues': assigned_data,
        'watched_issues': watched_data
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_comments(request, user_id):
    """Obtener todos los comentarios de un usuario"""
    user = get_object_or_404(User, id=user_id)
    comments = Comment.objects.filter(author=user).order_by('-dateModified')
    serializer = UserCommentSerializer(comments, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_avatar(request, user_id):
    """Actualizar avatar del usuario"""
    user = get_object_or_404(User, id=user_id)

    if 'avatar' not in request.FILES:
        return Response({'error': 'No se proporcionó imagen'}, status=status.HTTP_400_BAD_REQUEST)

    user.avatar = request.FILES['avatar']
    user.save()
    return Response(UserProfileSerializer(user).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_biography(request, user_id):
    """Actualizar biografía del usuario"""
    user = get_object_or_404(User, id=user_id)

    if 'biography' not in request.data:
        return Response({'error': 'No se proporcionó biografía'}, status=status.HTTP_400_BAD_REQUEST)

    user.biography = request.data['biography']
    user.save()
    return Response(UserProfileSerializer(user).data)
