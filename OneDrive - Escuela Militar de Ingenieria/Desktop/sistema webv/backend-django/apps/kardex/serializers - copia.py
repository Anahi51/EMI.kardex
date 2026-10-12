from rest_framework import serializers
from .models import Calificacion, BloqueBlockchain, EncargadoKardex, TransferenciaKardex


class CalificacionSerializer(serializers.ModelSerializer):
    estudiante_nombre = serializers.ReadOnlyField(source='estudiante.nombre')
    estudiante_codigo = serializers.ReadOnlyField(source='estudiante.codigo')
    materia_nombre    = serializers.ReadOnlyField(source='materia.nombre')
    materia_codigo    = serializers.ReadOnlyField(source='materia.codigo')
    gestion_codigo    = serializers.ReadOnlyField(source='gestion.codigo')
    docente_nombre    = serializers.ReadOnlyField(source='docente.nombre')

    class Meta:
        model  = Calificacion
        fields = '__all__'


class BloqueBlockchainSerializer(serializers.ModelSerializer):
    class Meta:
        model  = BloqueBlockchain
        fields = '__all__'


# ─────────────────────────────────────────────────────────────────────────────
# MÓDULO: CAMBIO DE ENCARGADO DEL KARDEX
# ─────────────────────────────────────────────────────────────────────────────

class EncargadoKardexSerializer(serializers.ModelSerializer):
    usuario_nombre = serializers.ReadOnlyField(source='usuario.nombre')

    class Meta:
        model  = EncargadoKardex
        fields = [
            'id', 'usuario', 'usuario_nombre',
            'nombre_completo', 'cargo', 'ci', 'email', 'telefono',
            'activo', 'fecha_asignacion', 'observaciones', 'fecha_registro',
        ]


class TransferenciaKardexSerializer(serializers.ModelSerializer):
    # Campos de solo lectura para mostrar datos completos en la UI
    encargado_entrega_nombre = serializers.ReadOnlyField(source='encargado_entrega.nombre_completo')
    encargado_entrega_cargo  = serializers.ReadOnlyField(source='encargado_entrega.cargo')
    encargado_entrega_ci     = serializers.ReadOnlyField(source='encargado_entrega.ci')
    encargado_recibe_nombre  = serializers.ReadOnlyField(source='encargado_recibe.nombre_completo')
    encargado_recibe_cargo   = serializers.ReadOnlyField(source='encargado_recibe.cargo')
    encargado_recibe_ci      = serializers.ReadOnlyField(source='encargado_recibe.ci')
    estado_display           = serializers.ReadOnlyField(source='get_estado_display')
    registrado_por_nombre    = serializers.ReadOnlyField(source='registrado_por.nombre')
    confirmado_por_nombre    = serializers.ReadOnlyField(source='confirmado_por.nombre')

    class Meta:
        model  = TransferenciaKardex
        fields = [
            'id', 'numero_acta', 'estado', 'estado_display',
            'encargado_entrega', 'encargado_entrega_nombre',
            'encargado_entrega_cargo', 'encargado_entrega_ci',
            'encargado_recibe', 'encargado_recibe_nombre',
            'encargado_recibe_cargo', 'encargado_recibe_ci',
            'fecha_transferencia', 'cantidad_documentos',
            'descripcion_documentos', 'motivo',
            'fecha_confirmacion', 'confirmado_por', 'confirmado_por_nombre',
            'observaciones_receptor', 'hash_acta',
            'registrado_por', 'registrado_por_nombre', 'fecha_registro',
        ]
        read_only_fields = [
            'numero_acta', 'hash_acta', 'estado',
            'fecha_confirmacion', 'confirmado_por', 'fecha_registro',
        ]
