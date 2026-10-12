from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Certificado
from .serializers import CertificadoSerializer

class CertificadoViewSet(viewsets.ModelViewSet):
    queryset = Certificado.objects.all()
    serializer_class = CertificadoSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post'], url_path='generate')
    def generate(self, request):
        student_id = request.data.get('estudiante_id')
        tipo = request.data.get('tipo')
        emitido_por = request.data.get('emitido_por', 'Secretaría EMI')
        
        if not student_id or not tipo:
            return Response({'detail': 'Faltan campos requeridos estudiante_id y tipo'}, status=status.HTTP_400_BAD_REQUEST)
            
        from apps.estudiantes.models import Estudiante
        try:
            estudiante = Estudiante.objects.get(id=student_id)
        except Estudiante.DoesNotExist:
            try:
                # Try search by code too
                estudiante = Estudiante.objects.get(codigo=student_id)
            except Estudiante.DoesNotExist:
                return Response({'detail': 'Estudiante no encontrado'}, status=status.HTTP_404_NOT_FOUND)
            
        cert = Certificado.objects.create(
            estudiante=estudiante,
            tipo=tipo,
            emitido_por=emitido_por
        )
        
        serializer = self.get_serializer(cert)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], url_path='verify/(?P<codigo>[^/.]+)', permission_classes=[AllowAny])
    def verify(self, request, codigo=None):
        try:
            cert = Certificado.objects.get(codigo=codigo)
        except Certificado.DoesNotExist:
            return Response({'valid': False, 'message': 'Código de certificado no encontrado'}, status=status.HTTP_404_NOT_FOUND)
            
        serializer = self.get_serializer(cert)
        return Response({
            'valid': cert.vigente,
            'certificado': serializer.data,
            'message': 'Certificado válido y verificado en el sistema' if cert.vigente else 'Certificado inactivo o revocado'
        })
