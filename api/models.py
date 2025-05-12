from django.db import models
from rest_framework.exceptions import ValidationError

# Create your models here.
class User(models.Model):
    nombre = models.CharField(max_length=20, unique=True)
    biography = models.TextField()
    numOpenIssues = models.Value(models.IntegerField)
    numWatchedIssues = models.Value(models.IntegerField)
    numComments = models.Value(models.IntegerField)

    def __str__(self):
        return self.nombre

    def delete(self, *args, **kwargs):
        if User.objects.count() <= 1:
            raise ValidationError("No se puede eliminar el único usuario existente")
        super().delete(*args, **kwargs)


class TipoIssue(models.Model):
    nombre = models.CharField(max_length=20, unique=True)

    def __str__(self):
        return self.nombre

    def delete(self, *args, **kwargs):
        if TipoIssue.objects.count() <= 1:
            raise ValidationError("No se puede eliminar el único tipo de issue existente")
        super().delete(*args, **kwargs)


class EstadoIssue(models.Model):
    nombre = models.CharField(max_length=40, unique=True)

    def __str__(self):
        return self.nombre

    def delete(self, *args, **kwargs):
        if EstadoIssue.objects.count() <= 1:
            raise ValidationError("No se puede eliminar el único estado de issue existente")
        super().delete(*args, **kwargs)


class PrioridadIssue(models.Model):
    nombre = models.CharField(max_length=20, unique=True)

    def __str__(self):
        return self.nombre

    def delete(self, *args, **kwargs):
        if PrioridadIssue.objects.count() <= 1:
            raise ValidationError("No se puede eliminar la única prioridad de issue existente")
        super().delete(*args, **kwargs)


class SeveridadIssue(models.Model):
    nombre = models.CharField(max_length=20, unique=True)

    def __str__(self):
        return self.nombre

    def delete(self, *args, **kwargs):
        if SeveridadIssue.objects.count() <= 1:
            raise ValidationError("No se puede eliminar la única severidad de issue existente")
        super().delete(*args, **kwargs)

class Issue(models.Model):
    nombre = models.CharField(max_length=20)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    assignedTo = models.ForeignKey(User, on_delete=models.CASCADE)
    description = models.TextField()
    numIssue = models.IntegerField(unique=True)
    tipo = models.ForeignKey(TipoIssue, on_delete=models.CASCADE)
    estado = models.ForeignKey(EstadoIssue, on_delete=models.CASCADE)
    prioridad = models.ForeignKey(PrioridadIssue, on_delete=models.CASCADE)
    severidad = models.ForeignKey(SeveridadIssue, on_delete=models.CASCADE)
    dateModified = models.DateTimeField()

    def __str__(self):
        return self.nombre

class Comment(models.Model):
    issue = models.ForeignKey(Issue, on_delete=models.CASCADE)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    dateModified = models.DateTimeField()

    def __str__(self):
        return self.content
