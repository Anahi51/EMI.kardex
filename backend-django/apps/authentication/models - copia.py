from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models


class UsuarioManager(BaseUserManager):
    def create_user(self, username, password=None, **extra_fields):
        if not username:
            raise ValueError('El usuario debe tener un nombre de usuario')
        user = self.model(username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('rol', 'ADMIN')
        return self.create_user(username, password, **extra_fields)


class Usuario(AbstractBaseUser, PermissionsMixin):
    ROL_CHOICES = [
        ('ADMIN', 'Administrador'),
        ('ADMINISTRATIVO', 'Administrativo'),
        ('DOCENTE', 'Docente'),
        ('ESTUDIANTE', 'Estudiante'),
        ('SECRETARIA', 'Secretaría'),
        ('AUDITOR', 'Auditor Blockchain'),
    ]

    username = models.CharField(max_length=50, unique=True)
    email = models.EmailField(blank=True)
    nombre = models.CharField(max_length=200)
    rol = models.CharField(max_length=20, choices=ROL_CHOICES, default='ESTUDIANTE')
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    ultimo_acceso = models.DateTimeField(null=True, blank=True)

    objects = UsuarioManager()

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['nombre']

    class Meta:
        db_table = 'auth_usuarios'
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'

    def __str__(self):
        return f'{self.username} ({self.get_rol_display()})'
