from django.db import models
from patients.models import Patient
from doctors.models import Doctor


class Appointment(models.Model):
    STATUS_CHOICES = [
        ("scheduled", "Scheduled"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    ]

    patient = models.ForeignKey(
        Patient,
        on_delete=models.PROTECT
    )

    doctor = models.ForeignKey(
        Doctor,
        on_delete=models.PROTECT
    )

    date = models.DateField()
    time = models.TimeField()

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="scheduled"
    )

    def __str__(self):
        return f"{self.patient.name} - {self.doctor.name}"