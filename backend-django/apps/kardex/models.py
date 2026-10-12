import hashlib
import json
from django.db import models
from django.utils import timezone
from apps.estudiantes.models import Estudiante


class Gestion(models.Model):
    ESTADO_CHOICES = [('PLANIFICADO', 'Planificado'), ('ACTIVO', 'Activo'), ('CERRADO', 'Cerrado')]
    codigo = models.CharField(max_length=20, unique=True)  # ej: "1/2024"
    nombre = models.CharField(max_length=100)
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='PLANIFICADO')
    class Meta:
        db_table = 'gestiones'
    def __str__(self):
        return self.codigo


class Materia(models.Model):
    from apps.estudiantes.models import Carrera
    codigo = models.CharField(max_length=20, unique=True)
    nombre = models.CharField(max_length=200)
    carrera = models.ForeignKey('estudiantes.Carrera', on_delete=models.PROTECT)
    semestre = models.CharField(max_length=10)
    creditos = models.IntegerField(default=3)
    horas_teoria = models.IntegerField(default=2)
    horas_practica = models.IntegerField(default=1)
    activa = models.BooleanField(default=True)
    class Meta:
        db_table = 'materias'
    def __str__(self):
        return f'{self.codigo} - {self.nombre}'


class Docente(models.Model):
    from apps.authentication.models import Usuario
    usuario = models.OneToOneField('authentication.Usuario', on_delete=models.CASCADE, null=True, blank=True)
    ci = models.CharField(max_length=20, unique=True)
    nombre = models.CharField(max_length=200)
    especialidad = models.CharField(max_length=200, blank=True)
    grado_academico = models.CharField(max_length=50, blank=True)
    email = models.EmailField(blank=True)
    activo = models.BooleanField(default=True)
    class Meta:
        db_table = 'docentes'
    def __str__(self):
        return self.nombre


class Calificacion(models.Model):
    estudiante = models.ForeignKey(Estudiante, on_delete=models.CASCADE, related_name='calificaciones')
    materia = models.ForeignKey(Materia, on_delete=models.PROTECT)
    gestion = models.ForeignKey(Gestion, on_delete=models.PROTECT)
    docente = models.ForeignKey(Docente, on_delete=models.SET_NULL, null=True, blank=True)

    # Notas
    nota_parcial1 = models.FloatField(null=True, blank=True)
    nota_parcial2 = models.FloatField(null=True, blank=True)
    nota_examen_final = models.FloatField(null=True, blank=True)
    nota_recuperacion = models.FloatField(null=True, blank=True)
    nota_final = models.FloatField(null=True, blank=True)

    estado = models.CharField(
        max_length=20,
        choices=[('APROBADO', 'Aprobado'), ('REPROBADO', 'Reprobado'), ('PENDIENTE', 'Pendiente')],
        default='PENDIENTE'
    )

    # Blockchain fields
    hash_blockchain = models.CharField(max_length=64, blank=True)
    bloque_index = models.IntegerField(null=True, blank=True)
    timestamp_blockchain = models.DateTimeField(null=True, blank=True)

    fecha_registro = models.DateTimeField(auto_now_add=True)
    fecha_modificacion = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'calificaciones'
        unique_together = ('estudiante', 'materia', 'gestion')

    def calcular_nota_final(self):
        """Calcular nota final ponderada"""
        if self.nota_parcial1 is not None and self.nota_parcial2 is not None and self.nota_examen_final is not None:
            self.nota_final = round(
                (self.nota_parcial1 * 0.25) +
                (self.nota_parcial2 * 0.25) +
                (self.nota_examen_final * 0.50),
                2
            )
            if self.nota_recuperacion and self.nota_final < 51:
                self.nota_final = round((self.nota_final + self.nota_recuperacion) / 2, 2)
            self.estado = 'APROBADO' if self.nota_final >= 51 else 'REPROBADO'
        return self.nota_final

    def generar_hash(self):
        """Generar hash SHA-256 del registro de calificación"""
        data = {
            'estudiante_id': self.estudiante.codigo,
            'materia': self.materia.codigo,
            'gestion': self.gestion.codigo,
            'nota_final': self.nota_final,
            'timestamp': timezone.now().isoformat(),
        }
        self.hash_blockchain = hashlib.sha256(json.dumps(data, sort_keys=True).encode()).hexdigest()
        self.timestamp_blockchain = timezone.now()
        return self.hash_blockchain

    def save(self, *args, **kwargs):
        self.calcular_nota_final()
        if not self.hash_blockchain and self.nota_final is not None:
            self.generar_hash()
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.estudiante.codigo} - {self.materia.codigo} - {self.gestion.codigo}: {self.nota_final}'


class BloqueBlockchain(models.Model):
    index = models.IntegerField(unique=True)
    timestamp = models.DateTimeField()
    data = models.JSONField()
    hash_previo = models.CharField(max_length=64)
    hash_actual = models.CharField(max_length=64, unique=True)
    nonce = models.IntegerField(default=0)
    calificacion = models.ForeignKey(Calificacion, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        db_table = 'bloques_blockchain'
        ordering = ['index']

    def __str__(self):
        return f'Bloque #{self.index} - {self.hash_actual[:16]}...'


# ─────────────────────────────────────────────────────────────────────────────
# MÓDULO: CAMBIO DE ENCARGADO DEL KARDEX
# ─────────────────────────────────────────────────────────────────────────────

class EncargadoKardex(models.Model):
    """
    Registro de las personas que pueden estar a cargo de la custodia del Kardex.
    Solo uno puede estar activo (activo=True) a la vez.
    """
    usuario = models.ForeignKey(
        'authentication.Usuario',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='encargados_kardex'
    )
    nombre_completo = models.CharField(max_length=200)
    cargo           = models.CharField(max_length=200)
    ci              = models.CharField(max_length=20, unique=True)
    email           = models.EmailField(blank=True)
    telefono        = models.CharField(max_length=20, blank=True)
    activo          = models.BooleanField(default=False)
    fecha_asignacion = models.DateTimeField(null=True, blank=True)
    observaciones   = models.TextField(blank=True)
    fecha_registro  = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'encargados_kardex'
        verbose_name = 'Encargado del Kardex'
        verbose_name_plural = 'Encargados del Kardex'
        ordering = ['-fecha_asignacion']

    def __str__(self):
        estado = '✓ ACTIVO' if self.activo else 'Inactivo'
        return f'{self.nombre_completo} ({self.cargo}) — {estado}'


class TransferenciaKardex(models.Model):
    """
    Acta digital de transferencia de custodia del Kardex entre encargados.
    Incluye hash SHA-256 para garantizar integridad del registro.
    """
    ESTADO_CHOICES = [
        ('PENDIENTE',  'Pendiente de confirmación'),
        ('CONFIRMADA', 'Confirmada por receptor'),
        ('ANULADA',    'Anulada'),
    ]

    # Partes de la transferencia
    encargado_entrega = models.ForeignKey(
        EncargadoKardex,
        on_delete=models.PROTECT,
        related_name='transferencias_entregadas',
        verbose_name='Encargado que entrega'
    )
    encargado_recibe = models.ForeignKey(
        EncargadoKardex,
        on_delete=models.PROTECT,
        related_name='transferencias_recibidas',
        verbose_name='Encargado que recibe'
    )

    # Datos de la transferencia
    fecha_transferencia   = models.DateTimeField(default=timezone.now)
    cantidad_documentos   = models.PositiveIntegerField(default=1)
    descripcion_documentos = models.TextField(
        help_text='Detalle de los documentos transferidos (Kardex, actas, etc.)'
    )
    motivo = models.TextField(help_text='Motivo del cambio de encargado')

    # Identificación del acta
    numero_acta = models.CharField(max_length=50, unique=True, blank=True)

    # Control de estado
    estado           = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='PENDIENTE')
    fecha_confirmacion = models.DateTimeField(null=True, blank=True)
    confirmado_por   = models.ForeignKey(
        'authentication.Usuario',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='transferencias_confirmadas'
    )
    observaciones_receptor = models.TextField(blank=True)

    # Integridad
    hash_acta = models.CharField(max_length=64, blank=True)

    # Trazabilidad
    registrado_por = models.ForeignKey(
        'authentication.Usuario',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='transferencias_registradas'
    )
    fecha_registro = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'transferencias_kardex'
        verbose_name = 'Transferencia de Kardex'
        verbose_name_plural = 'Transferencias de Kardex'
        ordering = ['-fecha_transferencia']

    def generar_numero_acta(self):
        """Genera el número único del acta: ACTA-KARDEX-YYYY-NNNN"""
        from django.utils import timezone as tz
        year = tz.now().year
        count = TransferenciaKardex.objects.filter(
            fecha_transferencia__year=year
        ).count() + 1
        self.numero_acta = f'ACTA-KARDEX-{year}-{count:04d}'

    def generar_hash(self):
        """Genera hash SHA-256 del acta para garantizar integridad"""
        data = {
            'numero_acta': self.numero_acta,
            'encargado_entrega': self.encargado_entrega.ci,
            'encargado_recibe': self.encargado_recibe.ci,
            'fecha_transferencia': self.fecha_transferencia.isoformat(),
            'cantidad_documentos': self.cantidad_documentos,
            'descripcion': self.descripcion_documentos,
            'motivo': self.motivo,
        }
        self.hash_acta = hashlib.sha256(
            json.dumps(data, sort_keys=True).encode()
        ).hexdigest()

    def save(self, *args, **kwargs):
        if not self.numero_acta:
            self.generar_numero_acta()
        if not self.hash_acta:
            self.generar_hash()
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.numero_acta} | {self.encargado_entrega.nombre_completo} → {self.encargado_recibe.nombre_completo} ({self.estado})'
