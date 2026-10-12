from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import AuditLog
from .serializers import AuditLogSerializer

class AuditLogViewSet(viewsets.ModelViewSet):
    queryset = AuditLog.objects.all()
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        tipo = self.request.query_params.get('tipo')
        entidad = self.request.query_params.get('entidad')
        
        if tipo:
            queryset = queryset.filter(tipo=tipo)
        if entidad:
            queryset = queryset.filter(entidad=entidad)
            
        return queryset
