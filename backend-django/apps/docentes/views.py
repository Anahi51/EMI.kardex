from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Docente
from .serializers import DocenteSerializer

class DocenteViewSet(viewsets.ModelViewSet):
    queryset = Docente.objects.all()
    serializer_class = DocenteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(nombre__icontains=search) | queryset.filter(ci__icontains=search)
        return queryset
