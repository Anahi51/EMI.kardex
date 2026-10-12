"""
=============================================================
MÓDULO: Certificados - Modelo de Datos
=============================================================
SISTEMA: EMI - Sistema de Gestión Académica con Blockchain
ARCHIVO: apps/certificados/models.py

DESCRIPCIÓN:
    Define el modelo de base de datos para los Certificados académicos.
    Cada certificado está vinculado a un estudiante y contiene un hash
    SHA-256 que simula el registro en blockchain para garantizar
    autenticidad e integridad del documento.

ROLES QUE INTERACTÚAN CON ESTE MÓDULO:
    - Secretaría / Administrador : Puede emitir y gestionar certificados.
    - Docente                    : Puede consultar certificados de sus estudiantes.
    - Estudiante                 : Puede solicitar y verificar sus propios certificados.

FLUJO GENERAL:
    1. Se crea un certificado asociado a un Estudiante.
    2. Al guardar, se genera automáticamente el código único (CERT-EMI-AÑO-XXXX).
    3. Se calcula el hash SHA-256 del certificado para verificación blockchain.
    4. El certificado puede incluir un QR y un archivo PDF descargable.
=============================================================
"""

import os
import hashlib   # Para generar el hash SHA-256 del certificado
import uuid      # Reservado para posibles usos de identificadores únicos
from django.db import models
from django.utils import timezone
from apps.estudiantes.models import Estudiante  # Relación con el modelo Estudiante


class Certificado(models.Model):
    """
    Modelo que representa un Certificado Académico emitido por la EMI.

    Atributos:
        codigo          -- Código único del certificado (ej: CERT-EMI-2024-0001).
        estudiante      -- Estudiante al que pertenece el certificado (FK).
        tipo            -- Tipo de certificado (historial, egreso, aprobación, etc.).
        emitido_por     -- Nombre de la entidad emisora (por defecto: Secretaría EMI).
        fecha_emision   -- Fecha y hora de emisión del certificado.
        hash_blockchain -- Hash SHA-256 para verificación de autenticidad.
        qr_code         -- Imagen QR vinculada al certificado (opcional).
        archivo_pdf     -- Archivo PDF del certificado (opcional).
        vigente         -- Indica si el certificado está activo o fue revocado.
    """

    # -------------------------------------------------------
    # Tipos de certificado disponibles en el sistema
    # -------------------------------------------------------
    TIPO_CHOICES = [
        ('HISTORIAL_ACADEMICO', 'Historial Académico'),  # Registro completo de materias y notas
        ('NOTA_ESPECIFICA',     'Nota Específica'),       # Constancia de nota en una materia puntual
        ('EGRESO',              'Certificado de Egreso'), # Constancia de haber concluido la carrera
        ('APROBACION',          'Certificado de Aprobación'),  # Constancia de aprobación de un nivel
    ]

    # -------------------------------------------------------
    # Campos del modelo
    # -------------------------------------------------------
    codigo          = models.CharField(max_length=50, unique=True, default='')
    # Código legible y único; se genera automáticamente en save()

    estudiante      = models.ForeignKey(
        Estudiante,
        on_delete=models.CASCADE,
        related_name='certificados'
        # Al eliminar un estudiante, todos sus certificados se eliminan también
    )

    tipo            = models.CharField(max_length=30, choices=TIPO_CHOICES)
    # Tipo de certificado, limitado a las opciones en TIPO_CHOICES

    emitido_por     = models.CharField(max_length=200, default='Secretaría EMI')
    # Entidad responsable de la emisión del documento

    fecha_emision   = models.DateTimeField(default=timezone.now)
    # Fecha y hora exacta de la emisión; se toma al momento de crear el registro

    hash_blockchain = models.CharField(max_length=64, blank=True)
    # Hash SHA-256 de 64 caracteres; garantiza la integridad del certificado

    qr_code         = models.ImageField(upload_to='certificados/qr/', null=True, blank=True)
    # Imagen QR que apunta al certificado para verificación rápida

    archivo_pdf     = models.FileField(upload_to='certificados/pdf/', null=True, blank=True)
    # Archivo PDF descargable del certificado oficial

    vigente         = models.BooleanField(default=True)
    # Si es False, el certificado fue revocado o anulado

    # -------------------------------------------------------
    # Configuración de la tabla en la base de datos
    # -------------------------------------------------------
    class Meta:
        db_table = 'certificados'          # Nombre de la tabla en la BD
        ordering = ['-fecha_emision']      # Más recientes primero

    # -------------------------------------------------------
    # Método save: lógica automática al guardar un certificado
    # -------------------------------------------------------
    def save(self, *args, **kwargs):
        """
        Sobrescribe el método save para:
          1. Generar el código único del certificado si no existe.
          2. Calcular el hash SHA-256 si aún no se ha generado.

        Formato del código: CERT-EMI-{AÑO}-{NÚMERO CORRELATIVO 4 dígitos}
        Ejemplo: CERT-EMI-2024-0007

        El hash se calcula combinando: código + ID estudiante + tipo + fecha ISO.
        Esto garantiza que cada certificado tenga una huella digital única e irrepetible.
        """
        # --- Generar código único si el campo está vacío ---
        if not self.codigo:
            count = Certificado.objects.count() + 1  # Número correlativo
            year  = timezone.now().year               # Año actual
            self.codigo = f'CERT-EMI-{year}-{str(count).zfill(4)}'
            # zfill(4) agrega ceros a la izquierda: 7 → 0007

        # --- Calcular hash SHA-256 si aún no existe ---
        if not self.hash_blockchain:
            # Se concatenan los datos clave del certificado como cadena de texto
            data = f'{self.codigo}{self.estudiante_id}{self.tipo}{self.fecha_emision.isoformat()}'
            # Se calcula el hash SHA-256 y se almacena como hexadecimal (64 chars)
            self.hash_blockchain = hashlib.sha256(data.encode()).hexdigest()

        super().save(*args, **kwargs)  # Llama al save original de Django

    # -------------------------------------------------------
    # Representación legible del objeto en admin y shell
    # -------------------------------------------------------
    def __str__(self):
        """Retorna una representación legible: 'CERT-EMI-2024-0001 - Juan Pérez'"""
        return f'{self.codigo} - {self.estudiante.nombre}'
