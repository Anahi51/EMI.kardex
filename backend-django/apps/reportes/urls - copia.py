from django.urls import path
from .views import DashboardStatsView, RendimientoView, ResumenView

urlpatterns = [
    path('dashboard/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('rendimiento/', RendimientoView.as_view(), name='rendimiento-stats'),
    path('resumen/', ResumenView.as_view(), name='resumen-stats'),
]
