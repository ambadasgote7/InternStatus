import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminNavBar from "../../components/navbars/AdminNavBar";
import { BASE_URL } from "../../utils/constants";

/* ---------- Reusable Stat Card ---------- */
const StatCard = ({ title, value, subtitle, color }) => {
  return (
    <div
      className={`rounded-xl shadow p-6 border bg-gradient-to-br ${color}`}
    >
      <p className="text-sm text-white/80">{title}</p>
      <h2 className="text-3xl font-bold text-white mt-2">
        {value ?? "—"}
      </h2>
      {subtitle && (
        <p className="text-xs text-white/70 mt-1">{subtitle}</p>
      )}
    </div>
  );
};

/* ---------- Section Wrapper ---------- */
const Section = ({ title, children }) => (
  <div className="mb-10">
    <h3 className="text-lg font-semibold mb-4 text-slate-800">
      {title}
    </h3>
    {children}
  </div>
);

/* ---------- Dashboard ---------- */
const AdminDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
         `${BASE_URL}/api/admin/dashboard`,
          { withCredentials: true }
        );
        setDashboard(res.data.data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <div className="min-h-screen bg-slate-100">
      <AdminNavBar />

      <main className="px-6 py-8 max-w-7xl mx-auto">
        <h2 className="text-2xl font-semibold mb-8 text-slate-800">
          Admin Dashboard
        </h2>

        {/* Loading */}
        {loading && (
          <div className="bg-white p-6 rounded-xl shadow text-center">
            Loading dashboard…
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
            {error}
          </div>
        )}

        {!loading && !error && dashboard && (
          <>
            {/* ================= USERS ================= */}
            <Section title="User Overview">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Total Users"
                  value={dashboard.users.total}
                  color="from-blue-500 to-blue-700"
                />
                <StatCard
                  title="Students"
                  value={dashboard.users.byRole.students}
                  color="from-indigo-500 to-indigo-700"
                />
                <StatCard
                  title="Faculties"
                  value={dashboard.users.byRole.faculty}
                  color="from-purple-500 to-purple-700"
                />
                <StatCard
                  title="Companies"
                  value={dashboard.users.byRole.companies}
                  color="from-cyan-500 to-cyan-700"
                />
              </div>
            </Section>

            {/* ================= USER HEALTH ================= */}
            <Section title="User Health">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <StatCard
                  title="Unverified Users"
                  value={dashboard.users.unverified}
                  subtitle="Require admin action"
                  color="from-yellow-500 to-yellow-700"
                />
                <StatCard
                  title="Revoked Users"
                  value={dashboard.users.revoked}
                  color="from-gray-600 to-gray-800"
                />
                <StatCard
                  title="New Users (30 days)"
                  value={dashboard.users.new.last30Days}
                  subtitle={`${dashboard.users.new.last7Days} in last 7 days`}
                  color="from-emerald-500 to-emerald-700"
                />
              </div>
            </Section>

            {/* ================= FACULTY REQUESTS ================= */}
            <Section title="Faculty Requests">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Pending Requests"
                  value={dashboard.facultyRequests.pending}
                  color="from-orange-500 to-orange-700"
                />
                <StatCard
                  title="Approved Requests"
                  value={dashboard.facultyRequests.approved}
                  color="from-green-500 to-green-700"
                />
                <StatCard
                  title="Rejected Requests"
                  value={dashboard.facultyRequests.rejected}
                  color="from-red-500 to-red-700"
                />
                <StatCard
                  title="Approval Rate"
                  value={`${dashboard.facultyRequests.approvalRate}%`}
                  subtitle="Overall success"
                  color="from-teal-500 to-teal-700"
                />
              </div>
            </Section>

            {/* ================= ALERTS ================= */}
            <Section title="Action Required">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <StatCard
                  title="Faculty Requests > 7 Days"
                  value={dashboard.alerts.pendingFacultyRequestsOver7Days}
                  color="from-rose-500 to-rose-700"
                />
                <StatCard
                  title="Unverified Users > 7 Days"
                  value={dashboard.alerts.unverifiedUsersOver7Days}
                  color="from-pink-500 to-pink-700"
                />
              </div>
            </Section>

            {/* ================= RECENT ACTIVITY ================= */}
            <Section title="Recent Activity">
            <div className="rounded-xl shadow border overflow-hidden bg-white">
              <table className="min-w-full text-[15px] text-slate-900">
                <thead className="bg-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-800">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-800">
                      Role
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-800">
                      Verified
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-800">
                      Joined
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {dashboard.recentActivity.users.map((u) => (
                    <tr
                      key={u._id}
                      className="
                        border-t
                        odd:bg-white
                        even:bg-slate-50
                        hover:bg-blue-50
                      "
                    >
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {u.email}
                      </td>

                      <td className="px-4 py-3 text-slate-800 font-medium">
                        {u.role}
                      </td>

                      <td className="px-4 py-3">
                        {u.isVerified ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                            Verified
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                            Not Verified
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-slate-600">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
