from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils import timezone

from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser

from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
import secrets

from rest_framework import serializers
from .models import (
    Issue,
    TipoIssue,
    EstadoIssue,
    PrioridadIssue,
    SeveridadIssue,
    User,
    Comment,
    IssueAttachment,
    ImageAttachment,
)
from .serializers import (
    IssueSerializer,
    CommentSerializer,
    TipoIssueSerializer,
    EstadoIssueSerializer,
    PrioridadIssueSerializer,
    SeveridadIssueSerializer,
    UserSerializer,
    UserWriteSerializer,
    ImageAttachmentSerializer,
    IssueAttachmentSerializer,
)


# --------------------------------------------------------------------
#   Serializadores de escritura (ids en lugar de objetos anidados)
# --------------------------------------------------------------------
class IssueWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Issue
        fields = [
            'nombre',
            'author',        # id de User
            'assignedTo',    # id de User
            'description',
            'numIssue',
            'tipo',          # id de TipoIssue
            'estado',        # id de EstadoIssue
            'prioridad',     # id de PrioridadIssue
            'severidad',     # id de SeveridadIssue
        ]


class CommentWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['issue', 'author', 'content']


# --------------------------------------------------------------------
#                          ISSUES
# --------------------------------------------------------------------
@swagger_auto_schema(
    method='post',
    request_body=IssueWriteSerializer,
    responses={201: IssueSerializer, 400: 'Bad Request'},
    operation_summary="Crear un nuevo issue",
)
@api_view(['POST'])
def create_issue(request):
    """Crear un nuevo issue."""
    serializer = IssueWriteSerializer(data=request.data)
    if serializer.is_valid():
        issue = serializer.save(dateModified=timezone.now())
        return Response(IssueSerializer(issue).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@swagger_auto_schema(
    method='get',
    responses={200: IssueSerializer, 404: 'Not found'},
    operation_summary="Obtener informacion de un issue",
)
@api_view(['GET'])
def get_issue(request, issue_id: int):
    """Obtener info de un issue."""
    issue = get_object_or_404(Issue, pk=issue_id)
    return Response(IssueSerializer(issue).data)


@swagger_auto_schema(
    method='get',
    manual_parameters=[
        openapi.Parameter('search', openapi.IN_QUERY, description="Texto a buscar en nombre o descripcion", type=openapi.TYPE_STRING),
        openapi.Parameter('prioridad', openapi.IN_QUERY, description="ID de PrioridadIssue", type=openapi.TYPE_INTEGER),
        openapi.Parameter('estado', openapi.IN_QUERY, description="ID de EstadoIssue", type=openapi.TYPE_INTEGER),
        openapi.Parameter('severidad', openapi.IN_QUERY, description="ID de SeveridadIssue", type=openapi.TYPE_INTEGER),
        openapi.Parameter('tipo', openapi.IN_QUERY, description="ID de TipoIssue", type=openapi.TYPE_INTEGER),
    ],
    responses={200: IssueSerializer(many=True)},
    operation_summary="Listar issues con filtros basicos",
)
@api_view(['GET'])
def list_issues(request):
    """Obtener una lista de issues (con filtros opcionales)."""
    qs = Issue.objects.all()

    query = request.query_params.get('search')
    if query:
        qs = qs.filter(Q(nombre__icontains=query) | Q(description__icontains=query))

    for field in ('prioridad', 'estado', 'severidad', 'tipo'):
        value = request.query_params.get(field)
        if value:
            qs = qs.filter(**{f"{field}__id": value})

    return Response(IssueSerializer(qs, many=True).data)


@swagger_auto_schema(
    method='post',
    request_body=IssueWriteSerializer,
    responses={200: IssueSerializer, 400: 'Bad request', 404: 'Not found'},
    operation_summary="Editar un issue existente",
)
@api_view(['POST'])
def edit_issue(request, issue_id: int):
    """Editar un issue existente."""
    issue = get_object_or_404(Issue, pk=issue_id)
    serializer = IssueWriteSerializer(issue, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save(dateModified=timezone.now())
        return Response(IssueSerializer(issue).data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@swagger_auto_schema(
    method='delete',
    responses={204: 'Deleted', 404: 'Not found'},
    operation_summary="Eliminar un issue",
)
@api_view(['DELETE'])
def delete_issue(request, issue_id: int):
    """Eliminar un issue."""
    issue = get_object_or_404(Issue, pk=issue_id)
    issue.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@swagger_auto_schema(
    method='post',
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        required=['issue_id', 'user_id'],
        properties={
            'issue_id': openapi.Schema(type=openapi.TYPE_INTEGER),
            'user_id': openapi.Schema(type=openapi.TYPE_INTEGER),
        },
    ),
    responses={200: IssueSerializer, 404: 'Not found'},
    operation_summary="Asignar un issue a un usuario",
)
@api_view(['POST'])
def assign_issue(request):
    """Asignar un issue a un user."""
    issue = get_object_or_404(Issue, pk=request.data.get('issue_id'))
    user = get_object_or_404(User, pk=request.data.get('user_id'))
    issue.assignedTo = user
    issue.dateModified = timezone.now()
    issue.save()
    return Response(IssueSerializer(issue).data)


# ----  Adjuntos (requieren modelo IssueAttachment)  -----------------
@swagger_auto_schema(
    method='post',
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        required=['file'],
        properties={
            'file': openapi.Schema(type=openapi.TYPE_STRING, format='binary'),
        },
    ),
    responses={201: IssueAttachmentSerializer, 400: 'Bad request', 404: 'Not found'},
    operation_summary="Subir una imagen y vincularla a un issue",
)
@parser_classes([MultiPartParser, FormParser])
@api_view(['POST'])
def add_file_to_issue(request, issue_id: int):
    """Sube una imagen (file) y la asocia al issue."""
    issue = get_object_or_404(Issue, pk=issue_id)

    if 'file' not in request.FILES:
        return Response({'file': 'Este campo es obligatorio'}, status=status.HTTP_400_BAD_REQUEST)

    img_ser = ImageAttachmentSerializer(data={'file': request.FILES['file']})
    if not img_ser.is_valid():
        return Response(img_ser.errors, status=status.HTTP_400_BAD_REQUEST)

    image = img_ser.save()
    pivot  = IssueAttachment.objects.create(issue=issue, image=image)
    return Response(IssueAttachmentSerializer(pivot).data, status=status.HTTP_201_CREATED)


@swagger_auto_schema(
    method='delete',
    responses={204: 'Deleted', 404: 'Not found'},
    operation_summary="Eliminar un adjunto (desvincula y borra la imagen)",
)
@api_view(['DELETE'])
def delete_file_from_issue(request, file_id: int):
    """Elimina el IssueAttachment y la imagen asociada."""
    pivot = get_object_or_404(IssueAttachment, pk=file_id)
    # borra primero el archivo físico
    pivot.image.file.delete(save=False)
    pivot.image.delete()
    pivot.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


# ----  Bulk insert  --------------------------------------------------
@swagger_auto_schema(
    method='post',
    request_body=IssueWriteSerializer(many=True),
    responses={201: IssueSerializer(many=True), 400: 'Bad request'},
    operation_summary="Insertar multiples issues de golpe",
)
@api_view(['POST'])
def bulk_insert_issues(request):
    """Bulk insert de issues."""
    serializer = IssueWriteSerializer(data=request.data, many=True)
    if serializer.is_valid():
        issues = serializer.save(dateModified=timezone.now())
        return Response(IssueSerializer(issues, many=True).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ----  Comentarios  ----
@swagger_auto_schema(
    method='post',
    request_body=CommentWriteSerializer,
    responses={201: CommentSerializer, 400: 'Bad request', 404: 'Not found'},
    operation_summary="Anadir un comentario a un issue",
)
@api_view(['POST'])
def add_comment(request, issue_id: int):
    """Anadir un comentario a un issue."""
    issue = get_object_or_404(Issue, pk=issue_id)
    data = request.data.copy()
    data['issue'] = issue.id
    serializer = CommentWriteSerializer(data=data)
    if serializer.is_valid():
        comment = serializer.save(dateModified=timezone.now())
        return Response(CommentSerializer(comment).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@swagger_auto_schema(
    method='get',
    manual_parameters=[
        openapi.Parameter('q', openapi.IN_QUERY, description='Texto libre', type=openapi.TYPE_STRING),
    ],
    responses={200: IssueSerializer(many=True)},
    operation_summary="Filtrar issues (todos los campos principales)",
)
@api_view(['GET'])
def filter_issues(request):
    """Filtrar issues."""
    q = request.query_params.get('q', '')
    qs = Issue.objects.filter(
        Q(nombre__icontains=q) |
        Q(description__icontains=q) |
        Q(tipo__nombre__icontains=q) |
        Q(estado__nombre__icontains=q) |
        Q(prioridad__nombre__icontains=q) |
        Q(severidad__nombre__icontains=q)
    )
    return Response(IssueSerializer(qs, many=True).data)


#----users

@swagger_auto_schema(
    method='get',
    responses={200: UserSerializer, 404: 'Not found'},
    operation_summary="Ver perfil de un usuario",
)
@api_view(['GET'])
def user_profile(request, user_id: int):
    """Ver pagina de perfil de un usuario."""
    user = get_object_or_404(User, pk=user_id)
    return Response(UserSerializer(user).data)

@swagger_auto_schema(
    method='get',
    responses={200: UserSerializer(many=True)},
    operation_summary="Listar todos los usuarios",
)
@api_view(['GET'])
def list_users(request):
    """Devuelve la lista completa de usuarios."""
    users = User.objects.all()
    return Response(UserSerializer(users, many=True).data)

@parser_classes([MultiPartParser, FormParser])
@swagger_auto_schema(                         
    method='post',
    request_body=UserWriteSerializer,
    consumes=['multipart/form-data'],
    responses={200: UserSerializer, 400: 'Bad request', 404: 'Not found'},
    operation_summary="Editar perfil de un usuario (nombre, bio, foto)",
)
@api_view(['POST'])
def edit_user_profile(request, user_id: int):
    """Editar perfil (nombre, biography, photo)."""
    user = get_object_or_404(User, pk=user_id)
    serializer = UserWriteSerializer(user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(UserSerializer(user).data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@parser_classes([MultiPartParser, FormParser])
@swagger_auto_schema(
    method='post',
    request_body=UserWriteSerializer,
    responses={201: UserSerializer, 400: 'Bad request'},
    operation_summary="Crear un usuario (apikey generada)",
)
@api_view(['POST'])
def create_user(request):
    """Crear un usuario y generar automaticamente su API-key."""
    serializer = UserWriteSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@swagger_auto_schema(
    method='post',
    responses={200: UserSerializer, 404: 'Not found'},
    operation_summary="Generar/aplicar una API-key aleatoria a un usuario",
)
@api_view(['POST'])
def assign_apikey_to_user(request, user_id: int):
    """Genera una nueva API-key random y la asigna al user indicado."""
    user = get_object_or_404(User, pk=user_id)
    user.apikey = secrets.token_hex(20)
    user.save(update_fields=['apikey'])
    return Response(UserSerializer(user).data)

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