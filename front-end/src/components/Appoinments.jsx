
import { useEffect, useState } from "react";
import { apiRequest } from "../api.js";

const emptyForm = {
  patient: "",
  doctor: "",
  date: "",
  time: "",
  status: "scheduled",
};

function AppointmentForm() {
  const [form, setForm] = useState(emptyForm);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  async function getList(endpoint) {
    const data = await apiRequest(endpoint);
    return Array.isArray(data) ? data : data.results ?? [];
  }

  async function loadData() {
    try {
      const [patientData, doctorData, appointmentData] =
        await Promise.all([
          getList("patients/"),
          getList("doctors/"),
          getList("appointments/"),
        ]);

      setPatients(patientData);
      setDoctors(doctorData);
      setAppointments(appointmentData);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setMessage("");
    setSaving(true);

    const isEditing = editingId !== null;

    const endpoint = isEditing
      ? `appointments/${editingId}/`
      : "appointments/";

    try {
      await apiRequest(endpoint, {
        method: isEditing ? "PUT" : "POST",
        body: JSON.stringify({
          ...form,
          patient: Number(form.patient),
          doctor: Number(form.doctor),
        }),
      });

      setForm(emptyForm);
      setEditingId(null);

      await loadData();

      setMessage(
        isEditing
          ? "Appointment updated successfully!"
          : "Appointment booked successfully!"
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(appointment) {
    setEditingId(appointment.id);

    setForm({
      patient: String(appointment.patient),
      doctor: String(appointment.doctor),
      date: appointment.date,
      time: appointment.time.slice(0, 5),
      status: appointment.status,
    });

    setError("");
    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function handleReset() {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
    setMessage("");
  }

  async function handleCancel(id) {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this appointment?"
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      await apiRequest(`appointments/${id}/`, {
        method: "PATCH",
        body: JSON.stringify({
          status: "cancelled",
        }),
      });

      if (editingId === id) {
        setEditingId(null);
        setForm(emptyForm);
      }

      await loadData();

      setMessage("Appointment cancelled successfully!");
    } catch (err) {
      setError(err.message);
    }
  }

  const filteredAppointments = appointments.filter(
    (appointment) => {
      const keyword = search.toLowerCase();

      return (
        appointment.patient_name
          .toLowerCase()
          .includes(keyword) ||
        appointment.doctor_name
          .toLowerCase()
          .includes(keyword) ||
        appointment.status
          .toLowerCase()
          .includes(keyword)
      );
    }
  );

  return (
    <div className="mx-auto max-w-6xl p-4">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">
        Appointment Management
      </h1>

      <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-xl font-semibold">
          {editingId !== null
            ? "Edit Appointment"
            : "Book New Appointment"}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          <select
            name="patient"
            value={form.patient}
            onChange={handleChange}
            required
            className="rounded-lg border p-3"
          >
            <option value="">Select Patient</option>

            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.name}
              </option>
            ))}
          </select>

          <select
            name="doctor"
            value={form.doctor}
            onChange={handleChange}
            required
            className="rounded-lg border p-3"
          >
            <option value="">Select Doctor</option>

            {doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.name} - {doctor.specialization}
              </option>
            ))}
          </select>

          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
            className="rounded-lg border p-3"
          />

          <input
            type="time"
            name="time"
            value={form.time}
            onChange={handleChange}
            required
            className="rounded-lg border p-3"
          />

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="rounded-lg border p-3"
          >
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : editingId !== null
                ? "Update Appointment"
                : "Book Appointment"}
            </button>

            {editingId !== null && (
              <button
                type="button"
                onClick={handleReset}
                className="rounded-lg bg-slate-500 px-6 py-3 text-white"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        {error && (
          <p role="alert" className="mt-4 text-red-600">
            {error}
          </p>
        )}

        {message && (
          <p className="mt-4 text-green-600">
            {message}
          </p>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <h2 className="text-xl font-semibold">
            Appointment Records ({appointments.length})
          </h2>

          <input
            type="text"
            placeholder="Search appointments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg border p-3"
          />
        </div>

        {loading ? (
          <p className="py-6 text-center text-slate-500">
            Loading appointments...
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-100">
                <tr>
                  <th className="p-3">Patient</th>
                  <th className="p-3">Doctor</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Time</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredAppointments.map((appointment) => (
                  <tr
                    key={appointment.id}
                    className="border-b"
                  >
                    <td className="p-3">
                      {appointment.patient_name}
                    </td>

                    <td className="p-3">
                      {appointment.doctor_name}
                    </td>

                    <td className="p-3">
                      {appointment.date}
                    </td>

                    <td className="p-3">
                      {appointment.time.slice(0, 5)}
                    </td>

                    <td className="p-3">
                      <span
                        className={`rounded-full px-3 py-1 text-sm capitalize ${
                          appointment.status === "scheduled"
                            ? "bg-blue-100 text-blue-700"
                            : appointment.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {appointment.status}
                      </span>
                    </td>

                    <td className="p-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(appointment)}
                          className="rounded bg-amber-500 px-3 py-2 text-white"
                        >
                          Edit
                        </button>

                        {appointment.status !== "cancelled" && (
                          <button
                            type="button"
                            onClick={() =>
                              handleCancel(appointment.id)
                            }
                            className="rounded bg-red-600 px-3 py-2 text-white"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredAppointments.length === 0 && (
              <p className="p-6 text-center text-slate-500">
                No appointments found
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AppointmentForm;
