from django.db import models
from apps.authentication.models import Usuario


class Carrera(models.Model):
    nombre = models.CharField(max_length=200)
    codigo = models.CharField(max_length=20, unique=True)
    duracion_semestres = models.IntegerField(default=10)
    activa = models.BooleanField(default=True)

    class Meta:
        db_table = 'carreras'
        verbose_name = 'Carrera'

    def __str__(self):
        return self.nombre


class Estudiante(models.Model):
    GRADO_CHOICES = [
        ('ESTUDIANTE', 'Estudiante'),
        ('SUBTENIENTE', 'Subteniente'),
        ('TENIENTE', 'Teniente'),
        ('CAPITAN', 'Capitán'),
        ('MAYOR', 'Mayor'),
        ('CADETE', 'Cadete'),
    ]
    ESTADO_CHOICES = [
        ('ACTIVO', 'Activo'),
        ('BAJA', 'Baja'),
        ('EGRESADO', 'Egresado'),
        ('SUSPENDIDO', 'Suspendido'),
    ]

    usuario = models.OneToOneField(Usuario, on_delete=models.CASCADE, null=True, blank=True)
    codigo = models.CharField(max_length=20, unique=True)
    nombre = models.CharField(max_length=200)
    ci = models.CharField(max_length=20, unique=True, null=True, blank=True)
    carrera = models.ForeignKey(Carrera, on_delete=models.PROTECT)
    semestre_actual = models.CharField(max_length=10, blank=True)
    grado = models.CharField(max_length=20, choices=GRADO_CHOICES, default='ESTUDIANTE')
    email = models.EmailField(blank=True)
    telefono = models.CharField(max_length=20, blank=True)
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='ACTIVO')
    fecha_ingreso = models.DateField(null=True, blank=True)
    fecha_registro = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'estudiantes'
        verbose_name = 'Estudiante'
        ordering = ['nombre']

    def __str__(self):
        return f'{self.codigo} - {self.nombre}'

    @property
    def promedio_general(self):
        from apps.kardex.models import Calificacion
        califs = Calificacion.objects.filter(estudiante=self, nota_final__isnull=False)
        if not califs.exists():
            return 0
        return round(califs.aggregate(avg=models.Avg('nota_final'))['avg'] or 0, 2)
