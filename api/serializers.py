from rest_framework import serializers
from .models import User, TipoIssue, EstadoIssue, PrioridadIssue, SeveridadIssue, Issue, Comment

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'nombre', 'biography', 'numOpenIssues', 'numWatchedIssues', 'numComments']
        read_only_fields = ['numOpenIssues', 'numWatchedIssues', 'numComments']

class TipoIssueSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoIssue
        fields = '__all__'
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
    author = UserSerializer(read_only=True)
    assignedTo = UserSerializer(read_only=True)
    tipo = TipoIssueSerializer(read_only=True)
    estado = EstadoIssueSerializer(read_only=True)
    prioridad = PrioridadIssueSerializer(read_only=True)
    severidad = SeveridadIssueSerializer(read_only=True)

    class Meta:
        model = Issue
        fields = [
            'id', 'nombre', 'author', 'assignedTo', 'description',
            'numIssue', 'tipo', 'estado', 'prioridad', 'severidad',
            'dateModified'
        ]

class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    issue = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'issue', 'author', 'content', 'dateModified']