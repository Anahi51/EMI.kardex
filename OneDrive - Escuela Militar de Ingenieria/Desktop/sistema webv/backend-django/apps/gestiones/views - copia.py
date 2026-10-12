from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Gestion
from .serializers import GestionSerializer

class GestionViewSet(viewsets.ModelViewSet):
    queryset = Gestion.objects.all()
    serializer_class = GestionSerializer
    permission_classes = [IsAuthenticated]
