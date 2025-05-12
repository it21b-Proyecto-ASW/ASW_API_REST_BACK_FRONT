from django.db import models
from django.contrib.auth.models import User
from django.utils.timezone import datetime
from django.core.exceptions import ValidationError


class TipoIssue(models.Model):
    nombre = models.CharField(max_length=20, unique=True)

    def __str__(self):
        return self.nombre

    def delete(self, *args, **kwargs):
        if TipoIssue.objects.count() <= 1:
            raise ValidationError("No se puede eliminar el único tipo existente")
        super().delete(*args, **kwargs)

class EstadoIssue(models.Model):
    nombre = models.CharField(max_length=40, unique=True)

    def __str__(self):
        return self.nombre
    def delete(self, *args, **kwargs):
        if EstadoIssue.objects.count() <= 1:
            raise ValidationError("No se puede eliminar el único estado existente")
        super().delete(*args, **kwargs)

class PrioridadIssue(models.Model):
    nombre = models.CharField(max_length=10, unique=True)

    def __str__(self):
        return self.nombre

    def delete(self, *args, **kwargs):
        if PrioridadIssue.objects.count() <= 1:
            raise ValidationError("No se puede eliminar la única prioridad existente")
        super().delete(*args, **kwargs)

class SeveridadIssue(models.Model):
    nombre = models.CharField(max_length=30, unique=True)

    def __str__(self):
        return self.nombre

    def delete(self, *args, **kwargs):
        if SeveridadIssue.objects.count() <= 1:
            raise ValidationError("No se puede eliminar la única severidad existente")
        super().delete(*args, **kwargs)
