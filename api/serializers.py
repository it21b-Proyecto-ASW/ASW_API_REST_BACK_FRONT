from rest_framework import serializers
from .models import *

class TipoIssueSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoIssue
        fields = '__all__'

class PrioridadIssueSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrioridadIssue
        fields = '__all__'

class EstadoIssueSerializer(serializers.ModelSerializer):
    class Meta:
        model = EstadoIssue
        fields = '__all__'

class SeveridadIssueSerializer(serializers.ModelSerializer):
    class Meta:
        model = SeveridadIssue
        fields = '__all__'
