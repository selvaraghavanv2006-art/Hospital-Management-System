from rest_framework import viewsets
from .models import Appointment
from .serializers import AppointmentSerializer


class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.select_related(
        "patient", "doctor"
    ).all().order_by("-date", "-time")

    serializer_class = AppointmentSerializer