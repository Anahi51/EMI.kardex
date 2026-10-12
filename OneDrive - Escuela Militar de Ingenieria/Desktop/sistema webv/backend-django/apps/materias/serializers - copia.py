from rest_framework import serializers
from .models import Materia

class MateriaSerializer(serializers.ModelSerializer):
    carrera_nombre = serializers.ReadOnlyField(source='carrera.nombre')

    class Meta:
        model = Materia
        fields = '__all__'
