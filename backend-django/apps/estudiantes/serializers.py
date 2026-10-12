import re
from rest_framework import serializers
from .models import Carrera, Estudiante

class CarreraSerializer(serializers.ModelSerializer):
    class Meta:
        model = Carrera
        fields = '__all__'

class EstudianteSerializer(serializers.ModelSerializer):
    carrera_nombre = serializers.ReadOnlyField(source='carrera.nombre')
    carrera_codigo = serializers.ReadOnlyField(source='carrera.codigo')
    promedio = serializers.ReadOnlyField(source='promedio_general')

    class Meta:
        model = Estudiante
        fields = [
            'id', 'usuario', 'codigo', 'nombre', 'ci', 'carrera',
            'carrera_nombre', 'carrera_codigo', 'semestre_actual',
            'grado', 'email', 'telefono', 'estado', 'fecha_ingreso',
            'fecha_registro', 'promedio'
        ]

    def validate_nombre(self, value):
        if any(char.isdigit() for char in value):
            raise serializers.ValidationError('El nombre completo no puede contener números. Solo se permiten letras.')
        if not re.match(r'^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$', value.strip()):
            raise serializers.ValidationError('El nombre completo solo debe contener letras.')
        return value
