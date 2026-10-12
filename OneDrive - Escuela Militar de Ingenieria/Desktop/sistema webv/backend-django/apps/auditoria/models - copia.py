from django.db import models
from apps.authentication.models import Usuario


class AuditLog(models.Model):
    TIPO_CHOICES = [
        ('INFO', 'Información'),
        ('WRITE', 'Escritura'),
        ('READ', 'Lectura'),
        ('CHAIN', 'Blockchain'),
        ('ERROR', 'Error'),
        ('AUTH', 'Autenticación'),
    ]

    usuario = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True, blank=True)
    accion = models.CharField(max_length=50)
    entidad = models.CharField(max_length=50)
    entidad_id = models.CharField(max_length=50, blank=True)
    descripcion = models.TextField()
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES, default='INFO')
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    hash_registro = models.CharField(max_length=64, blank=True)
    fecha = models.DateTimeField(auto_now_add=True)
    datos_extra = models.JSONField(null=True, blank=True)

    class Meta:
        db_table = 'audit_log'
        ordering = ['-fecha']

    def __str__(self):
        return f'{self.accion} - {self.usuario} - {self.fecha}'
