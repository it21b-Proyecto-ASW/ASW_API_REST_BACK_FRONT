from django.db import models
from django.contrib.auth.models import User
from django.utils.timezone import datetime
from django.core.exceptions import ValidationError
from rest_framework.exceptions import ValidationError
import secrets
from django.db import models
from django.utils import timezone



class TipoIssue(models.Model):
    nombre = models.CharField(max_length=20, unique=True)

    def __str__(self):
        return self.nombre

    def delete(self, *args, **kwargs):
        if TipoIssue.objects.count() <= 1:
            raise ValidationError("No se puede eliminar el unico tipo existente")
        super().delete(*args, **kwargs)


class User(models.Model):
    nombre           = models.CharField(max_length=20, unique=True)
    biography        = models.TextField(blank=True)
    photo            = models.ImageField(upload_to="profiles/", null=True, blank=True)
    apikey           = models.CharField(max_length=40, unique=True, null=True, blank=True)
    numOpenIssues    = models.IntegerField(default=0)
    numWatchedIssues = models.IntegerField(default=0)
    numComments      = models.IntegerField(default=0)
    
    def save(self, *args, **kwargs):
        
        if not self.apikey:
            self.apikey = secrets.token_hex(20)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.nombre

    def delete(self, *args, **kwargs):
        if User.objects.count() <= 1:
            raise ValidationError("No se puede eliminar el unico usuario existente")
        super().delete(*args, **kwargs)

class ImageAttachment(models.Model):
    file        = models.ImageField(upload_to='attachments/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

class IssueAttachment(models.Model):
    issue       = models.ForeignKey("Issue", on_delete=models.CASCADE, related_name="attachments")
    image       = models.ForeignKey(ImageAttachment, on_delete=models.CASCADE)

    class Meta:
        unique_together = ("issue", "image")


class EstadoIssue(models.Model):
    nombre = models.CharField(max_length=40, unique=True)

    def __str__(self):
        return self.nombre

    def delete(self, *args, **kwargs):
        if EstadoIssue.objects.count() <= 1:
            raise ValidationError("No se puede eliminar el unico estado de issue existente")
        super().delete(*args, **kwargs)


class PrioridadIssue(models.Model):
    nombre = models.CharField(max_length=20, unique=True)

    def __str__(self):
        return self.nombre

    def delete(self, *args, **kwargs):
        if PrioridadIssue.objects.count() <= 1:
            raise ValidationError("No se puede eliminar la unica prioridad de issue existente")
        super().delete(*args, **kwargs)


class SeveridadIssue(models.Model):
    nombre = models.CharField(max_length=20, unique=True)

    def __str__(self):
        return self.nombre

    def delete(self, *args, **kwargs):
        if SeveridadIssue.objects.count() <= 1:
            raise ValidationError("No se puede eliminar la unica severidad de issue existente")
        super().delete(*args, **kwargs)

class Issue(models.Model):
    nombre = models.CharField(max_length=20)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='authored_issues')
    assignedTo = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='assigned_issues')
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

