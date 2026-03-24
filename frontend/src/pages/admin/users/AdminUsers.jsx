import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/api";

const ROLES = ["", "admin", "college", "faculty", "student", "company", "mentor"];
const STATUSES = ["", "active", "suspended", "deleted"];

// Simplified to monochrome/high-contrast
const ROLE_COLORS = {
  admin: "bg-[#111] text-[#fff]",
  college: "bg-[#f9f9f9] border border-[#e5e5e5] text-[#333]",
  faculty: "bg-[#f9f9f9] border border-[#e5e5e5] text-[#333]",
  student: "bg-[#f9f9f9] border border-[#e5e5e5] text-[#333]",
  company: "bg-[#f9f9f9] border border-[#e5e5e5] text-[#333]",
  mentor: "bg-[#f9f9f9] border border-[#e5e5e5] text-[#333]",
};

const STATUS_COLORS = {
  active: "bg-[#111] text-[#fff]",
  suspended: "bg-[#fff] border border-[#cc0000] text-[#cc0000]",
  deleted: "bg-[#f9f9f9] text-[#333] opacity-50",
};

function Badge({ value, map }) {
  const cls = map[value] || "bg-[#f9f9f9] border border-[#e5e5e5] text-[#333]";
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-[14px] text-[10px] font-bold uppercase tracking-widest ${cls}`}>
      {value}
    </span>
  );
}

function Spinner({ size = 5 }) {
  return (
    <div className={`animate-spin h-${size} w-${size} rounded-full border-2 border-[#e5e5e5] border-t-[#333]`}></div>
  );
}

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [filters, setFilters] = useState({
    search: "",
    role: "",
    status: "",
    isVerified: "",
    isRegistered: "",
    page: 1,
    limit: 20,
  });
  const [actionLoading, setActionLoading] = useState({});
  const [toast, setToast] = useState(null);
  const searchRef = useRef(null);
  const searchTimerRef = useRef(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchUsers = useCallback(async (currentFilters) => {
    setLoading(true);
    try {
      const params = {};
      Object.entries(currentFilters).forEach(([k, v]) => {
        if (v !== "") params[k] = v;
      });
      const { data } = await api.get("/admin/users", { params });
      setUsers(data.data.users);
      setPagination(data.data.pagination);
    } catch (err) {
      showToast("Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(filters);
  }, [filters, fetchUsers]);

  const handleSearch = (e) => {
    const val = e.target.value;
    clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setFilters((f) => ({ ...f, search: val, page: 1 }));
    }, 400);
  };

  const handleFilter = (key, value) => {
    setFilters((f) => ({ ...f, [key]: value, page: 1 }));
  };

  const handleStatusChange = async (userId, newStatus) => {
    setActionLoading((prev) => ({ ...prev, [userId]: "status" }));
    try {
      await api.patch(`/admin/users/${userId}/status`, { accountStatus: newStatus });
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, accountStatus: newStatus } : u))
      );
      showToast(`User ${newStatus === "active" ? "activated" : "suspended"} successfully`);
    } catch {
      showToast("Failed to update status", "error");
    } finally {
      setActionLoading((prev) => ({ ...prev, [userId]: null }));
    }
  };

  const handleResendInvite = async (userId, email) => {
    setActionLoading((prev) => ({ ...prev, [userId]: "invite" }));
    try {
      await api.post(`/admin/users/${userId}/resend-invite`);
      showToast(`Invite sent to ${email}`);
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to send invite", "error");
    } finally {
      setActionLoading((prev) => ({ ...prev, [userId]: null }));
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f9f9] font-sans box-border text-[#333] pb-10">
      
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-[14px] shadow-sm text-[11px] font-bold tracking-widest uppercase border transition-all
          ${toast.type === "error" ? "bg-[#fff] text-[#cc0000] border-[#cc0000]" : "bg-[#111] text-[#fff] border-[#111]"}`}>
          {toast.message}
        </div>
      )}

      {/* Compact Header & Filters */}
      <div className="bg-[#fff] border-b border-[#e5e5e5] px-4 md:px-6 py-5 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-[23px] font-black m-0 tracking-tight text-[#333]">
              User Management
            </h1>
            <p className="text-[13px] font-bold text-[#333] opacity-60 m-0">
              {pagination.total.toLocaleString()} total users across all roles
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <input
              ref={searchRef}
              type="text"
              placeholder="Search by email..."
              onChange={handleSearch}
              className="w-full md:w-64 px-4 py-2.5 text-[13px] text-[#333] bg-[#fff] border border-[#e5e5e5] rounded-[14px] outline-none transition-colors focus:border-[#333]"
            />

            {[
              { key: "role", options: ROLES, label: "All Roles" },
              { key: "status", options: STATUSES, label: "All Statuses" },
            ].map(({ key, options, label }) => (
              <select
                key={key}
                value={filters[key]}
                onChange={(e) => handleFilter(key, e.target.value)}
                className="flex-1 md:flex-none px-4 py-2.5 text-[13px] text-[#333] bg-[#fff] border border-[#e5e5e5] rounded-[14px] outline-none transition-colors focus:border-[#333] capitalize cursor-pointer appearance-none"
              >
                {options.map((o) => (
                  <option key={o} value={o}>{o === "" ? label : o}</option>
                ))}
              </select>
            ))}

            <select
              value={filters.isVerified}
              onChange={(e) => handleFilter("isVerified", e.target.value)}
              className="flex-1 md:flex-none px-4 py-2.5 text-[13px] text-[#333] bg-[#fff] border border-[#e5e5e5] rounded-[14px] outline-none transition-colors focus:border-[#333] cursor-pointer appearance-none"
            >
              <option value="">Verified: All</option>
              <option value="true">Verified</option>
              <option value="false">Unverified</option>
            </select>

            <select
              value={filters.isRegistered}
              onChange={(e) => handleFilter("isRegistered", e.target.value)}
              className="flex-1 md:flex-none px-4 py-2.5 text-[13px] text-[#333] bg-[#fff] border border-[#e5e5e5] rounded-[14px] outline-none transition-colors focus:border-[#333] cursor-pointer appearance-none"
            >
              <option value="">Registered: All</option>
              <option value="true">Registered</option>
              <option value="false">Pending Setup</option>
            </select>

            {Object.values(filters).some((v) => v !== "" && v !== 1 && v !== 20) && (
              <button
                onClick={() => {
                  setFilters({ search: "", role: "", status: "", isVerified: "", isRegistered: "", page: 1, limit: 20 });
                  if (searchRef.current) searchRef.current.value = "";
                }}
                className="px-3 py-2.5 text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest bg-transparent border-none hover:opacity-100 cursor-pointer transition-opacity outline-none"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <div className="bg-[#fff] border border-[#e5e5e5] rounded-[20px] shadow-sm overflow-hidden box-border">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Spinner size={8} />
              <p className="text-[#333] font-bold text-[13px] animate-pulse m-0">Loading Users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-16">
              <p className="font-black text-[#333] text-[16px] m-0">No users found</p>
              <p className="text-[13px] text-[#333] opacity-60 mt-1 mb-0 font-bold">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead className="bg-[#f9f9f9] border-b border-[#e5e5e5]">
                  <tr>
                    {["Email", "Role", "Status", "Verified", "Registered", "Created", "Actions"].map((h) => (
                      <th key={h} className="px-5 py-3 text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e5e5]">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-[#f9f9f9] transition-colors duration-200 group">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-[10px] bg-[#f9f9f9] border border-[#e5e5e5] flex items-center justify-center text-[#333] font-black text-[13px] shrink-0">
                            {user.email[0].toUpperCase()}
                          </div>
                          <span className="font-bold text-[#333] text-[13px] truncate max-w-[180px]">{user.email}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <Badge value={user.role} map={ROLE_COLORS} />
                      </td>
                      <td className="px-5 py-3">
                        <Badge value={user.accountStatus} map={STATUS_COLORS} />
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${user.isVerified ? "text-[#111]" : "text-[#333] opacity-40"}`}>
                          {user.isVerified ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${user.isRegistered ? "text-[#111]" : "text-[#333] opacity-40"}`}>
                          {user.isRegistered ? "Complete" : "Pending"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-[#333] opacity-60 text-[13px] font-bold">
                        {new Date(user.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit", month: "short", year: "numeric"
                        })}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/admin/users/${user._id}`)}
                            className="px-3 py-1.5 text-[11px] font-bold text-[#333] uppercase tracking-widest bg-[#f9f9f9] border border-[#e5e5e5] rounded-[10px] hover:border-[#333] transition-colors cursor-pointer outline-none"
                          >
                            View
                          </button>

                          {user.accountStatus !== "deleted" && (
                            <button
                              onClick={() =>
                                handleStatusChange(
                                  user._id,
                                  user.accountStatus === "active" ? "suspended" : "active"
                                )
                              }
                              disabled={actionLoading[user._id] === "status"}
                              className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest border rounded-[10px] transition-colors disabled:opacity-50 cursor-pointer min-w-[70px] flex items-center justify-center outline-none
                                ${user.accountStatus === "active"
                                  ? "bg-[#fff] border-[#cc0000] text-[#cc0000] hover:bg-[#cc0000] hover:text-[#fff]"
                                  : "bg-[#111] border-[#111] text-[#fff] hover:opacity-80"
                                }`}
                            >
                              {actionLoading[user._id] === "status" ? (
                                <Spinner size={3} />
                              ) : user.accountStatus === "active" ? (
                                "Suspend"
                              ) : (
                                "Activate"
                              )}
                            </button>
                          )}

                          {!user.isRegistered && user.accountStatus !== "deleted" && (
                            <button
                              onClick={() => handleResendInvite(user._id, user.email)}
                              disabled={actionLoading[user._id] === "invite"}
                              className="px-3 py-1.5 text-[11px] font-bold text-[#333] uppercase tracking-widest bg-[#f9f9f9] border border-[#e5e5e5] rounded-[10px] hover:border-[#333] transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center min-w-[70px] outline-none"
                            >
                              {actionLoading[user._id] === "invite" ? (
                                <Spinner size={3} />
                              ) : (
                                "Resend"
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Compact Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <div className="mt-5 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[13px] font-bold text-[#333] opacity-70 m-0">
              Showing <span className="text-[#111] opacity-100">{(pagination.page - 1) * filters.limit + 1}–{Math.min(pagination.page * filters.limit, pagination.total)}</span> of <span className="text-[#111] opacity-100">{pagination.total.toLocaleString()}</span>
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
                disabled={!pagination.hasPrev}
                className="px-3 py-2 text-[11px] font-bold text-[#333] uppercase tracking-widest bg-[#f9f9f9] border border-[#e5e5e5] rounded-[10px] hover:bg-[#e5e5e5] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors outline-none"
              >
                Prev
              </button>
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const p = Math.max(1, Math.min(pagination.page - 2, pagination.totalPages - 4)) + i;
                return (
                  <button
                    key={p}
                    onClick={() => setFilters((f) => ({ ...f, page: p }))}
                    className={`w-8 h-8 text-[11px] font-bold rounded-[10px] flex items-center justify-center cursor-pointer transition-colors outline-none ${
                      p === pagination.page 
                        ? "bg-[#111] text-[#fff] border-none" 
                        : "bg-[#fff] border border-[#e5e5e5] text-[#333] hover:bg-[#f9f9f9]"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
                disabled={!pagination.hasNext}
                className="px-3 py-2 text-[11px] font-bold text-[#333] uppercase tracking-widest bg-[#f9f9f9] border border-[#e5e5e5] rounded-[10px] hover:bg-[#e5e5e5] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors outline-none"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}