
import { useState, useEffect } from "react";
import DashboardCard from "./components/DashboardCard.jsx";
import PatientForm from "./components/PatientForm.jsx";
import DoctorForm from "./components/DoctorForm.jsx";
import AppointmentForm from "./components/AppointmentForm.jsx";
import Login from "./pages/Login.jsx";
import { apiRequest, getToken } from "./api.js";
import "./App.css";

const Hospitalname = "City Hospital";

const menuItems = [
  { name: "Dashboard", icon: "▦" },
  { name: "Patients", icon: "♙" },
  { name: "Doctors", icon: "✚" },
  { name: "Appointments", icon: "▤" },
];

function App() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [username, setUsername] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Dynamic dashboard statistics
  const [stats, setStats] = useState({
    patients: null,
    doctors: null,
    appointments: null,
  });

  const [statsError, setStatsError] = useState("");

  // Check existing login
  useEffect(() => {
    async function checkAuthentication() {
      if (!getToken()) {
        setCheckingAuth(false);
        return;
      }

      try {
        const data = await apiRequest("auth/me/");
        setUsername(data.username);
        setAuthenticated(true);
      } catch {
        sessionStorage.removeItem("hospital_token");
        setAuthenticated(false);
      } finally {
        setCheckingAuth(false);
      }
    }

    checkAuthentication();
  }, []);

  // Handle expired or invalid token
  useEffect(() => {
    function handleUnauthorized() {
      setAuthenticated(false);
      setUsername("");
      setStats({
        patients: null,
        doctors: null,
        appointments: null,
      });
    }

    window.addEventListener(
      "hospital:unauthorized",
      handleUnauthorized
    );

    return () => {
      window.removeEventListener(
        "hospital:unauthorized",
        handleUnauthorized
      );
    };
  }, []);

  // Load real database counts
  async function loadStats() {
    try {
      const [patients, doctors, appointments] =
        await Promise.all([
          apiRequest("patients/"),
          apiRequest("doctors/"),
          apiRequest("appointments/"),
        ]);

      function countRecords(data) {
        if (Array.isArray(data)) {
          return data.length;
        }

        return data.count ?? data.results?.length ?? 0;
      }

      setStats({
        patients: countRecords(patients),
        doctors: countRecords(doctors),
        appointments: countRecords(appointments),
      });

      setStatsError("");
    } catch (err) {
      setStatsError(err.message);
    }
  }

  // Refresh counts whenever Dashboard opens
  useEffect(() => {
    if (authenticated && activePage === "Dashboard") {
      loadStats();
    }
  }, [authenticated, activePage]);

  function handleLogin(name) {
    setUsername(name);
    setAuthenticated(true);
    setActivePage("Dashboard");
  }

  async function handleLogout() {
    try {
      await apiRequest("auth/logout/", {
        method: "POST",
      });
    } catch {
      // Clear local login even if server request fails
    } finally {
      sessionStorage.removeItem("hospital_token");
      setAuthenticated(false);
      setUsername("");
      setStats({
        patients: null,
        doctors: null,
        appointments: null,
      });
      setActivePage("Dashboard");
    }
  }

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Checking authentication...
      </div>
    );
  }

  if (!authenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#f4f7fb] font-sans text-slate-800 lg:flex">

      {/* Sidebar */}
      <aside className="bg-[#101c35] text-white lg:min-h-screen lg:w-72 lg:shrink-0">
        <div className="border-b border-white/10 px-7 py-7">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500 text-2xl">
              ✚
            </div>

            <div>
              <h2 className="text-xl font-bold">
                {Hospitalname}
              </h2>

              <p className="text-xs text-slate-400">
                Management System
              </p>
            </div>
          </div>
        </div>

        <nav className="flex gap-2 overflow-x-auto p-4 lg:flex-col lg:px-5 lg:py-8">
          {menuItems.map((item) => (
            <button
              key={item.name}
              type="button"
              onClick={() => setActivePage(item.name)}
              className={`flex shrink-0 items-center gap-4 rounded-xl px-5 py-3.5 text-left text-sm font-medium transition-all ${
                activePage === item.name
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/30"
                  : "text-slate-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className="text-xl">
                {item.icon}
              </span>

              {item.name}
            </button>
          ))}
        </nav>

        <div className="hidden px-7 text-xs text-slate-500 lg:block">
          Hospital Management v1.0
        </div>
      </aside>

      {/* Main */}
      <div className="min-w-0 flex-1">

        {/* Top Navbar */}
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-5 lg:px-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
              Hospital Administration
            </p>

            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              {activePage}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-slate-500 sm:block">
              {username}
            </span>

            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
              AD
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-7xl p-5 lg:p-10">

          {/* Dashboard */}
          {activePage === "Dashboard" && (
            <>
              {/* Welcome Banner */}
              <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 to-cyan-500 p-8 text-white shadow-lg shadow-blue-200">
                <div className="relative z-10">
                  <p className="text-sm text-blue-100">
                    Hospital Overview
                  </p>

                  <h2 className="mt-2 text-3xl font-bold">
                    Welcome to {Hospitalname}
                  </h2>

                  <p className="mt-3 max-w-xl text-sm text-blue-100">
                    Manage patient records, appointments and hospital
                    operations from one central workspace.
                  </p>
                </div>

                <div className="absolute -right-10 -top-16 h-64 w-64 rounded-full bg-white/10" />
                <div className="absolute right-20 top-20 h-32 w-32 rounded-full bg-white/10" />
              </div>

              {/* Real Database Statistics */}
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                <DashboardCard
                  title="Total Patients"
                  count={stats.patients ?? "—"}
                />

                <DashboardCard
                  title="Total Doctors"
                  count={stats.doctors ?? "—"}
                />

                <DashboardCard
                  title="Appointments"
                  count={stats.appointments ?? "—"}
                />
              </div>

              {statsError && (
                <p className="mt-3 text-red-600">
                  Dashboard data error: {statsError}
                </p>
              )}

              {/* Dashboard Sections */}
              <div className="mt-8 grid gap-6 xl:grid-cols-3">
                <section className="rounded-2xl border border-slate-100 bg-white p-7 shadow-sm xl:col-span-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900">
                      Patient Management
                    </h3>

                    <button
                      onClick={() => setActivePage("Patients")}
                      className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                    >
                      View Patients
                    </button>
                  </div>

                  <p className="mt-4 text-sm leading-7 text-slate-500">
                    Register new patients, view patient details and manage
                    patient records using the Patients section.
                  </p>

                  <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                    Patient records are stored in the hospital database.
                    Open Patients to manage them.
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-100 bg-white p-7 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900">
                    Quick Actions
                  </h3>

                  <div className="mt-6 space-y-3">
                    <button
                      onClick={() => setActivePage("Patients")}
                      className="w-full rounded-xl bg-blue-600 px-5 py-3 text-left text-sm font-semibold text-white hover:bg-blue-700"
                    >
                      + Register Patient
                    </button>

                    <button
                      onClick={() => setActivePage("Appointments")}
                      className="w-full rounded-xl border border-slate-200 px-5 py-3 text-left text-sm font-medium hover:bg-slate-50"
                    >
                      View Appointments
                    </button>

                    <button
                      onClick={() => setActivePage("Doctors")}
                      className="w-full rounded-xl border border-slate-200 px-5 py-3 text-left text-sm font-medium hover:bg-slate-50"
                    >
                      View Doctors
                    </button>

                    <button
                      onClick={loadStats}
                      className="w-full rounded-xl border border-blue-200 bg-blue-50 px-5 py-3 text-left text-sm font-semibold text-blue-700 hover:bg-blue-100"
                    >
                      ↻ Refresh Dashboard
                    </button>
                  </div>
                </section>
              </div>
            </>
          )}

          {/* Patients */}
          {activePage === "Patients" && (
            <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:p-8">
              <PatientForm />
            </section>
          )}

          {/* Doctors */}
          {activePage === "Doctors" && (
            <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:p-8">
              <DoctorForm />
            </section>
          )}

          {/* Appointments */}
          {activePage === "Appointments" && (
            <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:p-8">
              <AppointmentForm />
            </section>
          )}

        </main>
      </div>
    </div>
  );
}

export default App;
