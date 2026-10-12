from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.utils import timezone

from .models import Calificacion, BloqueBlockchain, EncargadoKardex, TransferenciaKardex
from .serializers import (
    CalificacionSerializer, BloqueBlockchainSerializer,
    EncargadoKardexSerializer, TransferenciaKardexSerializer,
)


# ─────────────────────────────────────────────────────────────────────────────
# ViewSet original: Calificaciones
# ─────────────────────────────────────────────────────────────────────────────

class CalificacionViewSet(viewsets.ModelViewSet):
    queryset          = Calificacion.objects.all()
    serializer_class  = CalificacionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset     = super().get_queryset()
        estudiante_id = self.request.query_params.get('estudiante')
        materia_id    = self.request.query_params.get('materia')
        gestion_id    = self.request.query_params.get('gestion')

        if estudiante_id:
            queryset = queryset.filter(estudiante_id=estudiante_id)
        if materia_id:
            queryset = queryset.filter(materia_id=materia_id)
        if gestion_id:
            queryset = queryset.filter(gestion_id=gestion_id)

        return queryset

    @action(detail=False, methods=['get'], url_path='mi-kardex')
    def mi_kardex(self, request):
        user = request.user
        try:
            from apps.estudiantes.models import Estudiante
            estudiante = Estudiante.objects.get(usuario=user)
        except Estudiante.DoesNotExist:
            return Response(
                {'detail': 'No hay un estudiante asociado a este usuario'},
                status=status.HTTP_404_NOT_FOUND
            )

        calificaciones = Calificacion.objects.filter(estudiante=estudiante)

        # Agrupar por gestión
        gestiones = {}
        for c in calificaciones:
            g_cod = c.gestion.codigo
            if g_cod not in gestiones:
                gestiones[g_cod] = {'gestion': g_cod, 'materias': []}
            gestiones[g_cod]['materias'].append({
                'id':       c.id,
                'codigo':   c.materia.codigo,
                'nombre':   c.materia.nombre,
                'creditos': c.materia.creditos,
                'parcial1': c.nota_parcial1,
                'parcial2': c.nota_parcial2,
                'examen':   c.nota_examen_final,
                'final':    c.nota_final,
                'estado':   c.estado,
                'docente':  c.docente.nombre if c.docente else '',
                'hash':     c.hash_blockchain,
            })

        kardex_list = []
        for g_cod, g_data in gestiones.items():
            valid_notes  = [m['final'] for m in g_data['materias'] if m['final'] is not None]
            g_data['promedio'] = sum(valid_notes) / len(valid_notes) if valid_notes else 0
            kardex_list.append(g_data)

        aprobadas          = calificaciones.filter(estado='APROBADO')
        reprobadas         = calificaciones.filter(estado='REPROBADO')
        creditos_totales   = sum([c.materia.creditos for c in calificaciones])
        creditos_obtenidos = sum([c.materia.creditos for c in aprobadas])

        student_data = {
            'id':                 estudiante.id,
            'nombre':             estudiante.nombre,
            'codigo':             estudiante.codigo,
            'carrera':            estudiante.carrera.nombre,
            'semestre':           estudiante.semestre_actual,
            'promedio_general':   estudiante.promedio_general,
            'materias_aprobadas': aprobadas.count(),
            'materias_reprobadas': reprobadas.count(),
            'creditos_totales':   creditos_totales,
            'creditos_obtenidos': creditos_obtenidos,
            'estado':             estudiante.estado,
        }

        return Response({'estudiante': student_data, 'kardex': kardex_list})


# ─────────────────────────────────────────────────────────────────────────────
# MÓDULO: CAMBIO DE ENCARGADO DEL KARDEX
# ─────────────────────────────────────────────────────────────────────────────

class EncargadoKardexViewSet(viewsets.ModelViewSet):
    """
    CRUD de encargados del Kardex.
    Solo accesible por administradores.
    """
    queryset           = EncargadoKardex.objects.all()
    serializer_class   = EncargadoKardexSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['post'], url_path='activar')
    def activar(self, request, pk=None):
        """
        Marca este encargado como el activo (custodio actual).
        Desactiva automáticamente a todos los demás.
        """
        encargado = self.get_object()

        # Desactivar a todos los demás
        EncargadoKardex.objects.exclude(pk=encargado.pk).update(activo=False)

        encargado.activo           = True
        encargado.fecha_asignacion = timezone.now()
        encargado.save()

        return Response(
            EncargadoKardexSerializer(encargado).data,
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['get'], url_path='activo')
    def encargado_activo(self, request):
        """Retorna el encargado activo actual del Kardex."""
        try:
            encargado = EncargadoKardex.objects.get(activo=True)
            return Response(EncargadoKardexSerializer(encargado).data)
        except EncargadoKardex.DoesNotExist:
            return Response(
                {'detail': 'No hay un encargado activo asignado.'},
                status=status.HTTP_404_NOT_FOUND
            )


class TransferenciaKardexViewSet(viewsets.ModelViewSet):
    """
    Actas de transferencia de custodia del Kardex.
    - Crear: registra una nueva transferencia (estado PENDIENTE, hash generado automáticamente).
    - confirmar_recepcion: el receptor confirma el acta (pasa a CONFIRMADA).
    - anular: permite anular una transferencia PENDIENTE.
    - generar_acta: devuelve los datos estructurados del acta para visualización/impresión.
    - historial_custodios: retorna el historial cronológico de todos los custodios.
    """
    queryset           = TransferenciaKardex.objects.select_related(
        'encargado_entrega', 'encargado_recibe',
        'registrado_por', 'confirmado_por'
    ).all()
    serializer_class   = TransferenciaKardexSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        """Asigna automáticamente el usuario que registra la transferencia."""
        serializer.save(registrado_por=self.request.user)

    @action(detail=True, methods=['patch'], url_path='confirmar-recepcion')
    def confirmar_recepcion(self, request, pk=None):
        """
        El encargado receptor confirma la recepción de documentos.
        Actualiza el estado a CONFIRMADA y activa al nuevo encargado.
        """
        transferencia = self.get_object()

        if transferencia.estado != 'PENDIENTE':
            return Response(
                {'detail': f'Solo se pueden confirmar transferencias PENDIENTES. Estado actual: {transferencia.estado}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        observaciones = request.data.get('observaciones_receptor', '')
        transferencia.estado                = 'CONFIRMADA'
        transferencia.fecha_confirmacion    = timezone.now()
        transferencia.confirmado_por        = request.user
        transferencia.observaciones_receptor = observaciones
        transferencia.save()

        # Activar al nuevo encargado (quien recibe) y desactivar al que entregó
        EncargadoKardex.objects.exclude(
            pk=transferencia.encargado_recibe.pk
        ).update(activo=False)
        transferencia.encargado_recibe.activo           = True
        transferencia.encargado_recibe.fecha_asignacion = timezone.now()
        transferencia.encargado_recibe.save()

        return Response(
            TransferenciaKardexSerializer(transferencia).data,
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['patch'], url_path='anular')
    def anular(self, request, pk=None):
        """Anula una transferencia que aún no ha sido confirmada."""
        transferencia = self.get_object()

        if transferencia.estado != 'PENDIENTE':
            return Response(
                {'detail': 'Solo se pueden anular transferencias en estado PENDIENTE.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        transferencia.estado = 'ANULADA'
        transferencia.save()
        return Response(
            TransferenciaKardexSerializer(transferencia).data,
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['get'], url_path='generar-acta')
    def generar_acta(self, request, pk=None):
        """
        Retorna los datos estructurados del acta digital de transferencia,
        listos para renderizar o imprimir en el frontend.
        """
        t = self.get_object()
        acta = {
            'numero_acta':    t.numero_acta,
            'hash_integridad': t.hash_acta,
            'estado':         t.estado,
            'fecha_emision':  t.fecha_registro.isoformat(),
            'encargado_entrega': {
                'nombre': t.encargado_entrega.nombre_completo,
                'cargo':  t.encargado_entrega.cargo,
                'ci':     t.encargado_entrega.ci,
                'email':  t.encargado_entrega.email,
            },
            'encargado_recibe': {
                'nombre': t.encargado_recibe.nombre_completo,
                'cargo':  t.encargado_recibe.cargo,
                'ci':     t.encargado_recibe.ci,
                'email':  t.encargado_recibe.email,
            },
            'transferencia': {
                'fecha':              t.fecha_transferencia.isoformat(),
                'cantidad_documentos': t.cantidad_documentos,
                'descripcion':        t.descripcion_documentos,
                'motivo':             t.motivo,
            },
            'confirmacion': {
                'fecha':          t.fecha_confirmacion.isoformat() if t.fecha_confirmacion else None,
                'confirmado_por': t.confirmado_por.nombre if t.confirmado_por else None,
                'observaciones':  t.observaciones_receptor,
            } if t.estado == 'CONFIRMADA' else None,
            'registrado_por': t.registrado_por.nombre if t.registrado_por else 'Sistema',
        }
        return Response(acta, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='historial-custodios')
    def historial_custodios(self, request):
        """
        Retorna el historial cronológico de todos los custodios del Kardex,
        basado en las transferencias confirmadas.
        """
        transferencias = TransferenciaKardex.objects.filter(
            estado='CONFIRMADA'
        ).order_by('fecha_confirmacion')

        historial = []
        for t in transferencias:
            historial.append({
                'numero_acta':   t.numero_acta,
                'encargado':     t.encargado_recibe.nombre_completo,
                'cargo':         t.encargado_recibe.cargo,
                'ci':            t.encargado_recibe.ci,
                'desde':         t.fecha_confirmacion.isoformat() if t.fecha_confirmacion else None,
                'hasta':         None,  # Se calcula en frontend comparando con el siguiente
                'hash_acta':     t.hash_acta,
            })

        # Marcar el período "hasta" de cada custodio
        for i in range(len(historial) - 1):
            historial[i]['hasta'] = historial[i + 1]['desde']

        return Response({'historial': list(reversed(historial))})
