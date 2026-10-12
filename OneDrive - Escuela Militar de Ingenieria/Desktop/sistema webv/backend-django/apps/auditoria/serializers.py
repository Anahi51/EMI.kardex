from rest_framework import serializers
from .models import AuditLog

class AuditLogSerializer(serializers.ModelSerializer):
    usuario_name = serializers.ReadOnlyField(source='usuario.nombre')
    usuario_username = serializers.ReadOnlyField(source='usuario.username')

    class Meta:
        model = AuditLog
        fields = '__all__'
