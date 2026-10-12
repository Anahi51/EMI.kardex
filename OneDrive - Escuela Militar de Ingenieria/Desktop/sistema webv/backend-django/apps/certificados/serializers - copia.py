from rest_framework import serializers
from .models import Certificado

class CertificadoSerializer(serializers.ModelSerializer):
    estudiante_nombre = serializers.ReadOnlyField(source='estudiante.nombre')
    estudiante_codigo = serializers.ReadOnlyField(source='estudiante.codigo')
    carrera_nombre = serializers.ReadOnlyField(source='estudiante.carrera.nombre')

    class Meta:
        model = Certificado
        fields = '__all__'
