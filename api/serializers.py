from rest_framework import serializers
from .models import User, TipoIssue, EstadoIssue, PrioridadIssue, SeveridadIssue, Issue, Comment, ImageAttachment, IssueAttachment

class UserSerializer(serializers.ModelSerializer):
    photo = serializers.ImageField(read_only=True)
    class Meta:
        model = User
        fields = ['id', 'nombre', 'biography', 'apikey', 'photo', 'numOpenIssues', 'numWatchedIssues', 'numComments']
        read_only_fields = ['apikey','numOpenIssues', 'numWatchedIssues', 'numComments']

class TipoIssueSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoIssue
        fields = ['id', 'nombre']

class EstadoIssueSerializer(serializers.ModelSerializer):
    class Meta:
        model = EstadoIssue
        fields = ['id', 'nombre']

class PrioridadIssueSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrioridadIssue
        fields = ['id', 'nombre']

class SeveridadIssueSerializer(serializers.ModelSerializer):
    class Meta:
        model = SeveridadIssue
        fields = ['id', 'nombre']

class IssueSerializer(serializers.ModelSerializer):
    author = serializers.PrimaryKeyRelatedField(read_only=True)
    assignedTo = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    tipo = TipoIssueSerializer(read_only=True)
    tipo      = serializers.PrimaryKeyRelatedField(queryset=TipoIssue.objects.all(), required=False, allow_null=True)
    estado    = serializers.PrimaryKeyRelatedField(queryset=EstadoIssue.objects.all(), required=False, allow_null=True)
    prioridad = serializers.PrimaryKeyRelatedField(queryset=PrioridadIssue.objects.all(), required=False, allow_null=True)
    severidad = serializers.PrimaryKeyRelatedField(queryset=SeveridadIssue.objects.all(), required=False, allow_null=True)
    deadline  = serializers.DateField(required=False, allow_null=True)

    watchers = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), many=True, required=False
    )

    assignedTo = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), many=True, required=False
    )

    class Meta:
        model = Issue
        fields = [
            'id', 'nombre', 'author', 'assignedTo', 'description',
            'tipo', 'estado', 'prioridad', 'severidad',
            'dateModified', 'deadline', 'watchers',
        ]

class CommentSerializer(serializers.ModelSerializer):
    author = serializers.PrimaryKeyRelatedField(read_only=True)
    issue = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'issue', 'author', 'content', 'dateModified']


class UserWriteSerializer(serializers.ModelSerializer):
    biography = serializers.CharField(required=False, allow_blank=True, default='')
    photo     = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model  = User
        fields = ['nombre', 'biography', 'photo']

class ImageAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model  = ImageAttachment
        fields = ['id', 'file', 'uploaded_at']

class IssueAttachmentSerializer(serializers.ModelSerializer):
    image = ImageAttachmentSerializer(read_only=True)

    class Meta:
        model  = IssueAttachment
        fields = ['id', 'issue', 'image']

class SettingSerializer(serializers.Serializer):
    nombre = serializers.CharField(max_length=40)