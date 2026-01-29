import React from "react";
import { Link } from "react-router-dom";
import AdminNavBar from "../../components/navbars/AdminNavBar";



/* ---------------- Stat Card ---------------- */
const StatCard = ({ title, value }) => {
  return (
    <div className="bg-white rounded-xl shadow p-6 border">
      <p className="text-sm text-gray-500">{title}</p>
      <h2 className="text-3xl font-bold mt-2 text-slate-800">{value}</h2>
    </div>
  );
};

/* ---------------- Footer ---------------- */
const Footer = () => {
  return (
    <footer className="bg-slate-900 text-gray-300 text-center py-3 text-sm">
      © {new Date().getFullYear()} InternStatus | Admin Panel
    </footer>
  );
};

/* ---------------- Dashboard ---------------- */
const AdminDashboard = () => {
  // 🔴 Dummy data (replace with API later)
  const stats = {
    students: 1245,
    faculties: 132,
    colleges: 48,
    companies: 76,
    pendingApprovals: 19,
  };



  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <AdminNavBar />

      <main className="flex-1 px-6 py-8">
        <h2 className="text-2xl font-semibold mb-6 text-slate-800">
          Admin Dashboard Overview
        </h2>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatCard title="Total Students" value={stats.students} />
          <StatCard title="Registered Faculties" value={stats.faculties} />
          <StatCard title="Registered Colleges" value={stats.colleges} />
          <StatCard title="Registered Companies" value={stats.companies} />
          <StatCard title="Pending Approvals" value={stats.pendingApprovals} />
        </div>

        {/* Placeholder for future tables */}
        <div className="mt-10 bg-white rounded-xl shadow p-6 border">
          <h3 className="text-lg font-semibold mb-2">
            Recent Activity (Coming Soon)
          </h3>
          <p className="text-sm text-gray-500">
            This section will show latest registrations, approvals, and actions
            taken by admin.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
