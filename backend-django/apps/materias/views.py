from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Materia
from .serializers import MateriaSerializer

class MateriaViewSet(viewsets.ModelViewSet):
    queryset = Materia.objects.all()
    serializer_class = MateriaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        carrera = self.request.query_params.get('carrera')
        semestre = self.request.query_params.get('semestre')
        search = self.request.query_params.get('search')
        
        if carrera:
            queryset = queryset.filter(carrera_id=carrera)
        if semestre:
            queryset = queryset.filter(semestre=semestre)
        if search:
            queryset = queryset.filter(nombre__icontains=search) | queryset.filter(codigo__icontains=search)
            
        return queryset
