import re
from rest_framework import serializers
from .models import Docente

class DocenteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Docente
        fields = '__all__'

    def validate_ci(self, value):
        val_str = str(value).strip()
        if not re.match(r'^\d+$', val_str):
            raise serializers.ValidationError('El carnet (C.I.) solo debe contener números.')
        if len(val_str) > 10:
            raise serializers.ValidationError('El carnet (C.I.) no puede tener más de 10 dígitos.')
        return val_str

    def validate_nombre(self, value):
        if any(char.isdigit() for char in value):
            raise serializers.ValidationError('El nombre completo no puede contener números. Solo se permiten letras.')
        if not re.match(r'^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s.]+$', value.strip()):
            raise serializers.ValidationError('El nombre completo solo debe contener letras.')
        return value
