
import { useEffect, useState } from "react";
import { apiRequest } from "../api.js";

const emptyForm = {
  patient: "",
  doctor: "",
  date: "",
  time: "",
  status: "scheduled",
};

const toList = (data) =>
  Array.isArray(data) ? data : data?.results ?? [];

function AppointmentForm() {
  const [form, setForm] = useState(emptyForm);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadData() {
    try {
      const [patientData, doctorData, appointmentData] =
        await Promise.all([
          apiRequest("patients/"),
          apiRequest("doctors/"),
          apiRequest("appointments/"),
        ]);

      setPatients(toList(patientData));
      setDoctors(toList(doctorData));
      setAppointments(toList(appointmentData));
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const editing = editingId !== null;

    try {
      await apiRequest(
        editing
          ? `appointments/${editingId}/`
          : "appointments/",
        {
          method: editing ? "PUT" : "POST",
          body: JSON.stringify({
            ...form,
            patient: Number(form.patient),
            doctor: Number(form.doctor),
          }),
        }
      );

      setForm(emptyForm);
      setEditingId(null);
      await loadData();

      setSuccess(
        editing
          ? "Appointment updated successfully"
          : "Appointment booked successfully"
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
    setSuccess("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleCancel(id) {
    if (!window.confirm("Cancel this appointment?")) return;

    try {
      setError("");
      await apiRequest(`appointments/${id}/`, {
        method: "PATCH",
        body: JSON.stringify({ status: "cancelled" }),
      });

      if (editingId === id) {
        setEditingId(null);
        setForm(emptyForm);
      }

      await loadData();
      setSuccess("Appointment cancelled successfully");
    } catch (err) {
      setError(err.message);
    }
  }

  const filtered = appointments.filter((a) =>
    `${a.patient_name} ${a.doctor_name} ${a.status}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">
        Appointment Management
      </h2>

      <section className="rounded-xl border bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold">
          {editingId !== null
            ? "Edit Appointment"
            : "Book Appointment"}
        </h3>

        <form
          onSubmit={handleSubmit}
          className="grid gap-4 md:grid-cols-2"
        >
          <select
            name="patient"
            value={form.patient}
            onChange={handleChange}
            required
            className="rounded-lg border p-3"
          >
            <option value="">Select Patient</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
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
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} — {d.specialization}
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

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-5 py-3 text-white disabled:opacity-50"
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
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm);
                }}
                className="rounded-lg bg-gray-500 px-5 py-3 text-white"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        {error && (
          <p className="mt-4 text-red-600">{error}</p>
        )}

        {success && (
          <p className="mt-4 text-green-600">{success}</p>
        )}
      </section>

      <section className="rounded-xl border bg-white p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold">
            Appointment Records ({appointments.length})
          </h3>

          <input
            placeholder="Search appointments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg border p-3"
          />
        </div>

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
              {filtered.map((a) => (
                <tr key={a.id} className="border-b">
                  <td className="p-3">{a.patient_name}</td>
                  <td className="p-3">{a.doctor_name}</td>
                  <td className="p-3">{a.date}</td>
                  <td className="p-3">
                    {a.time?.slice(0, 5)}
                  </td>
                  <td className="p-3 capitalize">
                    {a.status}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(a)}
                        className="rounded bg-amber-500 px-3 py-2 text-white"
                      >
                        Edit
                      </button>

                      {a.status !== "cancelled" && (
                        <button
                          onClick={() => handleCancel(a.id)}
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

          {filtered.length === 0 && (
            <p className="p-5 text-center text-gray-500">
              No appointments found
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

export default AppointmentForm;
