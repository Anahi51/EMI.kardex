from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from .models import Carrera, Estudiante
from .serializers import CarreraSerializer, EstudianteSerializer

class CarreraViewSet(viewsets.ModelViewSet):
    queryset = Carrera.objects.filter(activa=True)
    serializer_class = CarreraSerializer
    permission_classes = [IsAuthenticated]

class EstudianteViewSet(viewsets.ModelViewSet):
    queryset = Estudiante.objects.all()
    serializer_class = EstudianteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        carrera = self.request.query_params.get('carrera')
        semestre = self.request.query_params.get('semestre')
        search = self.request.query_params.get('search')
        
        if carrera:
            queryset = queryset.filter(carrera_id=carrera)
        if semestre:
            queryset = queryset.filter(semestre_actual=semestre)
        if search:
            queryset = queryset.filter(nombre__icontains=search) | queryset.filter(codigo__icontains=search)
            
        return queryset

    @action(detail=True, methods=['get'])
    def kardex(self, request, pk=None):
        estudiante = self.get_object()
        from apps.kardex.models import Calificacion
        calificaciones = Calificacion.objects.filter(estudiante=estudiante)
        
        # Group by gestion
        gestiones = {}
        for c in calificaciones:
            g_cod = c.gestion.codigo
            if g_cod not in gestiones:
                gestiones[g_cod] = {
                    'gestion': g_cod,
                    'materias': [],
                }
            gestiones[g_cod]['materias'].append({
                'id': c.id,
                'codigo': c.materia.codigo,
                'nombre': c.materia.nombre,
                'creditos': c.materia.creditos,
                'parcial1': c.nota_parcial1,
                'parcial2': c.nota_parcial2,
                'examen': c.nota_examen_final,
                'final': c.nota_final,
                'estado': c.estado,
                'docente': c.docente.nombre if c.docente else '',
                'hash': c.hash_blockchain
            })
            
        # Calculate averages for each gestion
        kardex_list = []
        for g_cod, g_data in gestiones.items():
            valid_notes = [m['final'] for m in g_data['materias'] if m['final'] is not None]
            g_data['promedio'] = sum(valid_notes) / len(valid_notes) if valid_notes else 0
            kardex_list.append(g_data)
            
        # Compile student overview details
        aprobadas = calificaciones.filter(estado='APROBADO')
        reprobadas = calificaciones.filter(estado='REPROBADO')
        creditos_totales = sum([c.materia.creditos for c in calificaciones])
        creditos_obtenidos = sum([c.materia.creditos for c in aprobadas])
        
        student_data = {
            'id': estudiante.id,
            'nombre': estudiante.nombre,
            'codigo': estudiante.codigo,
            'carrera': estudiante.carrera.nombre,
            'semestre': estudiante.semestre_actual,
            'promedio_general': estudiante.promedio_general,
            'materias_aprobadas': aprobadas.count(),
            'materias_reprobadas': reprobadas.count(),
            'creditos_totales': creditos_totales,
            'creditos_obtenidos': creditos_obtenidos,
            'estado': estudiante.estado
        }
        
        return Response({
            'estudiante': student_data,
            'kardex': kardex_list
        })
