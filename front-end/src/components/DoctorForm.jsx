
import { useState, useEffect } from "react";
import { apiRequest } from "../api.js";

const emptyForm = {
  name: "",
  specialization: "",
  phone: "",
  email: "",
};

function DoctorForm() {
  const [form, setForm] = useState(emptyForm);
  const [doctors, setDoctors] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  // Fetch doctors from Django database
  async function loadDoctors() {
    setLoadingDoctors(true);

    try {
      const data = await apiRequest("doctors/");

      const doctorList = Array.isArray(data)
        ? data
        : data?.results ?? [];

      setDoctors(doctorList);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingDoctors(false);
    }
  }

  // IMPORTANT: Load doctors when page opens
  useEffect(() => {
    loadDoctors();
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

    setSaving(true);
    setError("");
    setSuccess("");

    const isEditing = editingId !== null;

    try {
      await apiRequest(
        isEditing
          ? `doctors/${editingId}/`
          : "doctors/",
        {
          method: isEditing ? "PUT" : "POST",
          body: JSON.stringify(form),
        }
      );

      setForm(emptyForm);
      setEditingId(null);

      await loadDoctors();

      setSuccess(
        isEditing
          ? "Doctor updated successfully"
          : "Doctor added successfully"
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(doctor) {
    setEditingId(doctor.id);

    setForm({
      name: doctor.name,
      specialization: doctor.specialization,
      phone: doctor.phone || "",
      email: doctor.email || "",
    });

    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function handleCancel() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
  }

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this doctor?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await apiRequest(`doctors/${id}/`, {
        method: "DELETE",
      });

      if (editingId === id) {
        handleCancel();
      }

      await loadDoctors();

      setSuccess("Doctor deleted successfully");
    } catch (err) {
      setError(err.message);
    }
  }

  const filteredDoctors = doctors.filter((doctor) => {
    const keyword = search.toLowerCase();

    return (
      doctor.name.toLowerCase().includes(keyword) ||
      doctor.specialization.toLowerCase().includes(keyword) ||
      (doctor.phone || "").includes(keyword) ||
      (doctor.email || "").toLowerCase().includes(keyword)
    );
  });

  return (
    <div className="mx-auto max-w-6xl p-6">

      <h1 className="mb-6 text-3xl font-bold">
        Doctor Management
      </h1>

      {/* Doctor Form */}
      <div className="mb-8 rounded-xl bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold">
          {editingId !== null
            ? "Edit Doctor"
            : "Add Doctor"}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          <input
            name="name"
            placeholder="Doctor Name"
            value={form.name}
            onChange={handleChange}
            required
            className="rounded-lg border p-3"
          />

          <input
            name="specialization"
            placeholder="Specialization"
            value={form.specialization}
            onChange={handleChange}
            required
            className="rounded-lg border p-3"
          />

          <input
            name="phone"
            placeholder="Phone Number"
            value={form.phone}
            onChange={handleChange}
            maxLength={15}
            className="rounded-lg border p-3"
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            className="rounded-lg border p-3"
          />

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-6 py-3 text-white disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : editingId !== null
                ? "Update Doctor"
                : "Add Doctor"}
            </button>

            {editingId !== null && (
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-lg bg-gray-500 px-6 py-3 text-white"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {error && (
          <p className="mt-4 text-red-600">
            {error}
          </p>
        )}

        {success && (
          <p className="mt-4 text-green-600">
            {success}
          </p>
        )}
      </div>

      {/* Doctor Records */}
      <div className="rounded-xl bg-white p-6 shadow">
        <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row">
          <h2 className="text-xl font-semibold">
            Doctor Records ({doctors.length})
          </h2>

          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              placeholder="Search doctors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-lg border p-3"
            />

            <button
              type="button"
              onClick={loadDoctors}
              className="rounded-lg bg-blue-100 px-4 py-3 font-medium text-blue-700"
            >
              Refresh
            </button>
          </div>
        </div>

        {loadingDoctors ? (
          <p className="p-5 text-center text-gray-500">
            Loading doctors...
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Specialization</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredDoctors.map((doctor) => (
                  <tr
                    key={doctor.id}
                    className="border-b"
                  >
                    <td className="p-3">
                      {doctor.name}
                    </td>

                    <td className="p-3">
                      {doctor.specialization}
                    </td>

                    <td className="p-3">
                      {doctor.phone || "—"}
                    </td>

                    <td className="p-3">
                      {doctor.email || "—"}
                    </td>

                    <td className="p-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(doctor)}
                          className="rounded bg-amber-500 px-4 py-2 text-white"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(doctor.id)}
                          className="rounded bg-red-600 px-4 py-2 text-white"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredDoctors.length === 0 && (
              <p className="p-6 text-center text-gray-500">
                No doctors found
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default DoctorForm;
