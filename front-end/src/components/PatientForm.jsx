import { useState, useEffect } from "react";
import { apiRequest } from "../api.js";


function PatientForm() {
  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "",
    phone: "",
  });

  const [patients, setPatients] = useState([]);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);

  async function loadPatients() {
  try {
    const data = await apiRequest("patients/");
    setPatients(data);
    setError("");
  } catch (err) {
    setError(err.message);
  }
}
  useEffect(() => {
    loadPatients();
  }, []);

  async function handleSubmit(e) {
  e.preventDefault();
  setError("");

  const isEditing = editingId !== null;

  const endpoint = isEditing
    ? `patients/${editingId}/`
    : "patients/";

  const method = isEditing ? "PUT" : "POST";

  try {
    await apiRequest(endpoint, {
      method,
      body: JSON.stringify({
        ...form,
        age: Number(form.age),
      }),
    });

    setForm({
      name: "",
      age: "",
      gender: "",
      phone: "",
    });

    setEditingId(null);
    await loadPatients();
  } catch (err) {
    setError(err.message);
  }
}

  function handleEdit(patient){
    setEditingId(patient.id);
    setForm({
        name: patient.name,
    age: String(patient.age),
    gender: patient.gender,
    phone: patient.phone || "",
    });
    }
  async function handleDelete(id) {
  try {
    setError("");

    await apiRequest(`patients/${id}/`, {
      method: "DELETE",
    });

    if (editingId === id) {
      setEditingId(null);
      setForm({
        name: "",
        age: "",
        gender: "",
        phone: "",
      });
    }

    await loadPatients();
  } catch (err) {
    setError(err.message);
  }
}

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-5">
        Patient Management
      </h1>

      <form onSubmit={handleSubmit} className="grid gap-3 max-w-md">
        <input
          className="border p-3 rounded"
          placeholder="Patient Name"
          required
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
        />

        <input
          className="border p-3 rounded"
          type="number"
          placeholder="Age"
          min="1"
          max="120"
          required
          value={form.age}
          onChange={(e) =>
            setForm({ ...form, age: e.target.value })
          }
        />

        <select
          className="border p-3 rounded"
          required
          value={form.gender}
          onChange={(e) =>
            setForm({ ...form, gender: e.target.value })
          }
        >
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>

        <input
          className="border p-3 rounded"
          placeholder="Phone Number"
          value={form.phone}
          onChange={(e) =>
            setForm({ ...form, phone: e.target.value })
          }
        />

        <button className="bg-blue-600 text-white p-3 rounded">
  {editingId ? "Update Patient" : "Add Patient"}
</button>
      </form>

      {error && <p className="text-red-600 mt-3">{error}</p>}

      <h2 className="text-xl font-semibold mt-8 mb-3">
        Patient Records
      </h2>

      <div className="space-y-3">
        {patients.map((patient) => (
          <div
            key={patient.id}
            className="border rounded p-4 flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">{patient.name}</p>
              <p>Age: {patient.age}</p>
              <p>Gender: {patient.gender}</p>
              <p>Phone: {patient.phone}</p>
            </div>

            <button
  type="button"
  onClick={() => handleEdit(patient)}
  className="bg-amber-500 text-white px-4 py-2 rounded"
>
  Edit
</button>

<button
  type="button"
  onClick={() => handleDelete(patient.id)}
  className="bg-red-500 text-white px-4 py-2 rounded"
>
  Delete
</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PatientForm;