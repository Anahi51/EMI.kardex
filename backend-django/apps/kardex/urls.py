from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CalificacionViewSet, EncargadoKardexViewSet, TransferenciaKardexViewSet

router = DefaultRouter()
router.register(r'',                  CalificacionViewSet,      basename='calificacion')
router.register(r'encargados',        EncargadoKardexViewSet,   basename='encargado-kardex')
router.register(r'transferencias',    TransferenciaKardexViewSet, basename='transferencia-kardex')

urlpatterns = [
    path('', include(router.urls)),
]
