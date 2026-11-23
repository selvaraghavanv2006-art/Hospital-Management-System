from rest_framework import serializers
from .models import Appointment


class AppointmentSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(
        source="patient.name",
        read_only=True
    )

    doctor_name = serializers.CharField(
        source="doctor.name",
        read_only=True
    )

    class Meta:
        model = Appointment
        fields = [
            "id",
            "patient",
            "patient_name",
            "doctor",
            "doctor_name",
            "date",
            "time",
            "status",
        ]
        read_only_fields = ["id"]

    def validate(self, attrs):
        doctor = attrs.get(
            "doctor",
            getattr(self.instance, "doctor", None)
        )
        date = attrs.get(
            "date",
            getattr(self.instance, "date", None)
        )
        time = attrs.get(
            "time",
            getattr(self.instance, "time", None)
        )
        status = attrs.get(
            "status",
            getattr(self.instance, "status", "scheduled")
        )

        if status == "scheduled":
            conflict = Appointment.objects.filter(
                doctor=doctor,
                date=date,
                time=time,
                status="scheduled"
            )

            if self.instance:
                conflict = conflict.exclude(pk=self.instance.pk)

            if conflict.exists():
                raise serializers.ValidationError(
                    "Doctor already has an appointment at this time."
                )

        return attrs