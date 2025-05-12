# api/views.py
from gc import get_objects

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import generics
from rest_framework import serializers
from rest_framework import status
from .models import *
from .serializers import *

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
def list_tipos(request):
    """Listar todos los tipos."""
    tipos = TipoIssue.objects.all()
    serialTipo = TipoIssueSerializer(tipos, many=True)
    return Response(serialTipo.data)

@api_view(['POST'])
def create_tipo(request):
    """Anadir un tipo nuevo."""
    tipo = TipoIssueSerializer(data=request.data)

    if TipoIssue.objects.filter(**request.data).exists():
        raise serializers.ValidationError('Este tipo ya existe')

    if tipo.is_valid():
        tipo.save()
        return Response(tipo.data)
    else:
        return Response(status=status.HTTP_404_NOT_FOUND)

@api_view(['DELETE'])
def delete_tipo(request, setting_id):
    """Eliminar un tipo."""
    try:
        tipo = TipoIssue.objects.get(pk=setting_id)
    except TipoIssue.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
    tipo.delete()
    return Response({"message": "ok"})

@api_view(['GET'])
def list_estados(request):
    """Listar todos los estados."""
    estados = EstadoIssue.objects.all()
    serialEstado = EstadoIssueSerializer(estados, many=True)
    return Response(serialEstado.data)

@api_view(['POST'])
def create_estado(request):
    """Anadir un estado nuevo."""
    estado = EstadoIssueSerializer(data=request.data)

    if EstadoIssue.objects.filter(**request.data).exists():
        raise serializers.ValidationError('Este estado ya existe')

    if estado.is_valid():
        estado.save()
        return Response(estado.data)
    else:
        return Response(status=status.HTTP_404_NOT_FOUND)

@api_view(['DELETE'])
def delete_estado(request, id):
    """Eliminar un estado."""
    try:
        estado = EstadoIssue.objects.get(pk=id)
    except EstadoIssue.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    estado.delete()
    return Response({"message": "ok"})

@api_view(['GET'])
def list_prioridades(request):
    """Listar todas las prioridades."""
    prioridades = PrioridadIssue.objects.all()
    serialPrio = PrioridadIssueSerializer(prioridades, many=True)
    return Response(serialPrio.data)

@api_view(['POST'])
def create_prioridad(request):
    """Anadir una prioridad."""
    prioridad = PrioridadIssueSerializer(data=request.data)

    if PrioridadIssue.objects.filter(**request.data).exists():
        raise serializers.ValidationError('Esta prioridad ya existe')

    if prioridad.is_valid():
        prioridad.save()
        return Response(prioridad.data)
    else:
        return Response(status=status.HTTP_404_NOT_FOUND)

@api_view(['DELETE'])
def delete_prioridad(request, setting_id):
    """Eliminar una prioridad."""
    try:
        prioridad = PrioridadIssue.objects.get(pk=setting_id)
    except PrioridadIssue.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    prioridad.delete()
    return Response({"message": "ok"})

@api_view(['GET'])
def list_severidades(request):
    """Listar todas las severidades."""
    severidades = SeveridadIssue.objects.all()
    serialSev = SeveridadIssueSerializer(severidades, many=True)
    return Response(serialSev.data)

@api_view(['POST'])
def create_severidad(request):
    """Anadir una severidad nueva."""
    severidad = SeveridadIssueSerializer(data=request.data)

    if SeveridadIssue.objects.filter(**request.data).exists():
        raise serializers.ValidationError('Esta severidad ya existe')

    if severidad.is_valid():
        severidad.save()
        return Response(severidad.data)
    else:
        return Response(status=status.HTTP_404_NOT_FOUND)

@api_view(['DELETE'])
def delete_severidad(request, setting_id):
    """Eliminar una severidad."""
    try:
        severidad = SeveridadIssue.objects.get(pk=setting_id)
    except SeveridadIssue.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    severidad.delete()
    return Response({"message": "ok"})

@api_view(['PUT'])
def edit_setting(request, setting_id):
    """Editar un setting existente."""
    return Response({"message": "ok"})