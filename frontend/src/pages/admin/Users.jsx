import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import AdminNavBar from "../../components/navbars/AdminNavBar";
import { BASE_URL } from "../../utils/constants";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/admin/users`, {
          withCredentials: true,
        });
        setUsers(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load users");
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
      const matchRole = roleFilter === "all" || userRole === roleFilter;

      return matchSearch && matchRole;
    });
  }, [users, search, roleFilter]);

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#f9f9f9] flex flex-col">
        <AdminNavBar />
        <main className="flex-grow flex items-center justify-center">
          <p className="text-[14px] font-bold text-[#333] animate-pulse">
            Loading Users...
          </p>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full bg-[#f9f9f9] flex flex-col">
        <AdminNavBar />
        <main className="flex-grow flex items-center justify-center p-4">
          <div className="px-6 py-4 text-[13px] font-bold text-[#cc0000] bg-[#fff] border border-[#cc0000] rounded-[14px]">
            {error}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#f9f9f9] flex flex-col text-[#333]">
      <AdminNavBar />

      <main className="w-full max-w-7xl mx-auto flex-grow p-4 md:p-6 flex flex-col gap-4">
        {/* Compact Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3 border-b border-[#e5e5e5] pb-4">
          <div>
            <h1 className="text-[23px] font-black text-[#333] m-0 mb-1 leading-tight">
              User Management
            </h1>
            <p className="text-[13px] text-[#333] opacity-70 m-0">
              View, filter, and manage all platform accounts
            </p>
          </div>
        </div>

        {/* Compact Filter Bar */}
        <div className="bg-[#fff] border border-[#e5e5e5] rounded-[20px] p-4 flex flex-col md:flex-row gap-3 shadow-sm">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by email, role, status..."
            className="flex-1 px-4 py-2.5 rounded-[14px] border border-[#e5e5e5] bg-[#fff] focus:border-[#333] text-[13px] text-[#333] outline-none transition-colors"
          />

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full md:w-48 px-4 py-2.5 rounded-[14px] border border-[#e5e5e5] bg-[#fff] focus:border-[#333] text-[13px] text-[#333] outline-none cursor-pointer transition-colors"
          >
            <option value="all">All Roles</option>
            <option value="student">Student</option>
            <option value="faculty">Faculty</option>
            <option value="company">Company</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Data Table */}
        {filteredUsers.length === 0 ? (
          <div className="bg-[#fff] border-2 border-dashed border-[#e5e5e5] rounded-[20px] p-10 text-center">
            <p className="text-[13px] font-bold text-[#333] opacity-60 m-0">
              No users found matching your criteria.
            </p>
          </div>
        ) : (
          <div className="bg-[#fff] border border-[#e5e5e5] rounded-[20px] shadow-sm overflow-hidden flex-1">
            <div className="overflow-x-auto no-scrollbar w-full">
              <table className="w-full text-left border-collapse whitespace-nowrap min-w-max">
                <thead className="bg-[#f9f9f9] border-b border-[#e5e5e5]">
                  <tr>
                    <th className="px-5 py-3 text-[11px] font-bold text-[#333] opacity-70 uppercase tracking-widest">
                      Email
                    </th>
                    <th className="px-5 py-3 text-[11px] font-bold text-[#333] opacity-70 uppercase tracking-widest">
                      Role
                    </th>
                    <th className="px-5 py-3 text-[11px] font-bold text-[#333] opacity-70 uppercase tracking-widest">
                      Verified
                    </th>
                    <th className="px-5 py-3 text-[11px] font-bold text-[#333] opacity-70 uppercase tracking-widest">
                      Status
                    </th>
                    <th className="px-5 py-3 text-[11px] font-bold text-[#333] opacity-70 uppercase tracking-widest">
                      Joined
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#e5e5e5]">
                  {filteredUsers.map((u) => (
                    <tr
                      key={u._id}
                      className="hover:bg-[#f9f9f9] transition-colors duration-200"
                    >
                      <td className="px-5 py-3">
                        <div
                          className="font-bold text-[13px] text-[#333] truncate max-w-[200px] md:max-w-xs lg:max-w-sm"
                          title={u.email}
                        >
                          {u.email}
                        </div>
                      </td>

                      <td className="px-5 py-3">
                        <span className="inline-block px-2.5 py-1 rounded-[14px] bg-[#f9f9f9] border border-[#e5e5e5] text-[10px] font-bold text-[#333] uppercase tracking-widest">
                          {u.role}
                        </span>
                      </td>

                      <td className="px-5 py-3">
                        {u.isVerified ? (
                          <span className="inline-block px-2.5 py-1 rounded-[14px] bg-[#111] text-[#fff] text-[10px] font-bold uppercase tracking-widest">
                            Verified
                          </span>
                        ) : (
                          <span className="inline-block px-2.5 py-1 rounded-[14px] bg-[#fff] border border-[#333] text-[#333] text-[10px] font-bold uppercase tracking-widest">
                            Pending
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-3 text-[13px] font-bold capitalize tracking-wide">
                        <span
                          className={
                            u.roleStatus === "active"
                              ? "text-[#333]"
                              : "text-[#333] opacity-50"
                          }
                        >
                          {u.roleStatus || "—"}
                        </span>
                      </td>

                      <td className="px-5 py-3 text-[#333] opacity-70 text-[13px] font-medium tracking-wide">
                        {new Date(u.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Users;
