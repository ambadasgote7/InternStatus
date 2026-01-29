import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import AdminNavBar from "../../components/navbars/AdminNavBar";
import { BASE_URL } from "../../utils/constants";

const roleBadge = {
  student: "bg-blue-100 text-blue-800",
  faculty: "bg-purple-100 text-purple-800",
  company: "bg-amber-100 text-amber-800",
  admin: "bg-slate-200 text-slate-900",
};

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}/api/admin/users`,
          { withCredentials: true }
        );
        setUsers(res.data.data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load users"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
  const q = search.toLowerCase().trim();

  return users.filter((u) => {
    const userRole = u.role?.toLowerCase().trim();

    const searchableText = `
      ${u.email}
      ${u.role}
      ${u.roleStatus}
      ${u.isVerified ? "verified" : "not verified"}
    `.toLowerCase();

    const matchSearch = searchableText.includes(q);

    const matchRole =
      roleFilter === "all" || userRole === roleFilter;

    return matchSearch && matchRole;
  });
}, [users, search, roleFilter]);

  return (
    <div className="min-h-screen bg-slate-100">
      <AdminNavBar />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-semibold text-slate-900 mb-6">
          User Management
        </h1>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow mb-6 flex flex-col md:flex-row gap-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by email, role, status, verified…"
            className="
              w-full md:w-1/2
              border border-slate-300
              rounded-lg
              px-4 py-2.5
              text-slate-900
              placeholder:text-slate-500
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
              focus:border-blue-500
            "
          />

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="
              w-full md:w-1/4
              border border-slate-300
              rounded-lg
              px-4 py-2.5
              text-slate-900
              bg-white
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
              focus:border-blue-500
            "
          >
            <option value="all">All Roles</option>
            <option value="student">Student</option>
            <option value="faculty">Faculty</option>
            <option value="company">Company</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* States */}
        {loading && (
          <div className="bg-white p-6 rounded-xl shadow text-slate-700">
            Loading users…
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="bg-white rounded-xl shadow border overflow-x-auto">
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
                    Status
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-800">
                    Joined
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-4 py-6 text-center text-slate-600"
                    >
                      No users found
                    </td>
                  </tr>
                )}

                {filteredUsers.map((u) => (
                  <tr
                    key={u._id}
                    className="border-t odd:bg-white even:bg-slate-50 hover:bg-blue-50"
                  >
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {u.email}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          roleBadge[u.role] || "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {u.role}
                      </span>
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

                    <td className="px-4 py-3 font-medium text-slate-800">
                      {u.roleStatus}
                    </td>

                    <td className="px-4 py-3 text-slate-600">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default Users;
