from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),

    # Auth
    path('api/auth/', include('apps.authentication.urls')),

    # Academic
    path('api/estudiantes/', include('apps.estudiantes.urls')),
    path('api/carreras/', include('apps.estudiantes.urls_carreras')),
    path('api/docentes/', include('apps.docentes.urls')),
    path('api/materias/', include('apps.materias.urls')),
    path('api/gestiones/', include('apps.gestiones.urls')),

    # Kardex & Calificaciones
    path('api/calificaciones/', include('apps.kardex.urls')),

    # Certificados
    path('api/certificados/', include('apps.certificados.urls')),

    # Reportes
    path('api/reportes/', include('apps.reportes.urls')),

    # Auditoría
    path('api/audit/', include('apps.auditoria.urls')),
]
