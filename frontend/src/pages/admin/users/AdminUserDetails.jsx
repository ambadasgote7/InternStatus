import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../api/api";

const ROLE_COLORS = {
  admin: "bg-rose-50 border-rose-200 text-rose-600",
  college: "bg-blue-50 border-blue-200 text-blue-600",
  faculty: "bg-emerald-50 border-emerald-200 text-emerald-600",
  student: "bg-[#F5F6FA] border-[#A29BFE] text-[#6C5CE7]",
  company: "bg-amber-50 border-amber-200 text-amber-600",
  mentor: "bg-cyan-50 border-cyan-200 text-cyan-600",
};

const STATUS_COLORS = {
  active: "bg-emerald-50 border-emerald-200 text-emerald-600",
  suspended: "bg-rose-50 border-rose-200 text-rose-600",
  deleted: "bg-slate-100 border-slate-300 text-slate-500",
  inactive: "bg-[#F5F6FA] border-transparent text-[#2D3436]",
  unassigned: "bg-transparent border-[#E5E5E5] text-[#2D3436]",
  completed: "bg-emerald-50 border-emerald-200 text-emerald-600",
  pending: "bg-amber-50 border-amber-200 text-amber-600",
  graduated: "bg-[#F5F6FA] border-[#6C5CE7] text-[#6C5CE7]",
};

const APP_STATUS_COLORS = {
  applied: "bg-[#F5F6FA] border-transparent text-[#2D3436]",
  shortlisted: "bg-blue-50 border-blue-200 text-blue-600",
  selected: "bg-emerald-50 border-emerald-200 text-emerald-600",
  offer_accepted: "bg-emerald-50 border-emerald-200 text-emerald-600",
  rejected: "bg-rose-50 border-rose-200 text-rose-600",
  withdrawn: "bg-slate-100 border-slate-300 text-slate-500",
  ongoing: "bg-[#F5F6FA] border-[#6C5CE7] text-[#6C5CE7]",
  completed: "bg-emerald-50 border-emerald-200 text-emerald-600",
  terminated: "bg-rose-50 border-rose-200 text-rose-600",
};

function Badge({ value, map, className = "" }) {
  const cls =
    (map && map[value]) || "bg-[#F5F6FA] border-transparent text-[#2D3436]";
  return (
    <span
      className={`inline-flex items-center px-3 py-1.5 rounded-[10px] text-[10px] font-black uppercase tracking-widest border transition-colors ${cls} ${className}`}
    >
      {value?.replace(/_/g, " ")}
    </span>
  );
}

function Spinner({ size = 5 }) {
  return (
    <div
      className={`animate-spin h-${size} w-${size} rounded-full border-2 border-transparent border-t-[#6C5CE7]`}
    ></div>
  );
}

function InfoRow({ label, value }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1.5 sm:gap-4 py-3 border-b border-[#F5F6FA] last:border-0 hover:bg-[#F5F6FA] hover:bg-opacity-50 transition-colors px-2 -mx-2 rounded-lg">
      <span className="text-[10px] text-[#2D3436] opacity-60 sm:w-40 shrink-0 font-bold uppercase tracking-widest mt-0.5">
        {label}
      </span>
      <span className="text-sm font-bold text-[#2D3436] break-words">
        {String(value)}
      </span>
    </div>
  );
}

function Section({ title, children, action }) {
  return (
    <div className="bg-[#FFFFFF] rounded-[20px] border border-[#F5F6FA] overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="px-6 py-4 border-b border-[#F5F6FA] flex items-center justify-between bg-[#F5F6FA] bg-opacity-50">
        <h3 className="text-[11px] font-black text-[#6C5CE7] uppercase tracking-widest m-0">
          {title}
        </h3>
        {action}
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

function StatCard({ label, value, accent = "primary" }) {
  const colors = {
    primary: "bg-[#FFFFFF] border-[#F5F6FA] text-[#2D3436] shadow-sm",
    secondary: "bg-[#F5F6FA] border-transparent text-[#6C5CE7] shadow-sm",
    accent: "bg-[#6C5CE7] border-[#6C5CE7] text-[#FFFFFF] shadow-md",
    dark: "bg-[#2D3436] border-[#2D3436] text-[#FFFFFF] shadow-md",
    light: "bg-[#FFFFFF] border-[#F5F6FA] text-[#2D3436] shadow-sm",
  };
  return (
    <div
      className={`rounded-[20px] p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg border ${colors[accent]}`}
    >
      <p className="text-3xl font-black m-0 tracking-tight">{value ?? "–"}</p>
      <p className="text-[10px] font-bold mt-2 uppercase tracking-widest opacity-80">
        {label}
      </p>
    </div>
  );
}

function CertificateModal({ url, onClose }) {
  if (!url) return null;

  return (
    <div className="fixed inset-0 bg-[#2D3436]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300">
      <div className="bg-[#FFFFFF] rounded-[24px] shadow-2xl border border-[#F5F6FA] w-full max-w-4xl max-h-[90vh] flex flex-col font-['Nunito'] box-border transform transition-transform duration-300 scale-100">
        <div className="px-8 py-6 border-b border-[#F5F6FA] flex items-center justify-between">
          <h2 className="text-xl font-black text-[#6C5CE7] m-0 tracking-tight">
            Certificate
          </h2>
          <button
            onClick={onClose}
            className="text-[10px] font-bold text-[#2D3436] opacity-60 uppercase tracking-widest bg-[#F5F6FA] border-none rounded-full px-3 py-1 cursor-pointer hover:bg-[#2D3436] hover:text-[#FFFFFF] transition-colors outline-none"
          >
            Close
          </button>
        </div>
        <div className="flex-1 overflow-auto bg-[#F5F6FA] p-4">
          {url?.endsWith(".pdf") ? (
            <iframe
              src={url}
              className="w-full h-full border-none rounded-[16px] shadow-inner"
              title="Certificate PDF"
            />
          ) : (
            <div className="flex items-center justify-center p-8">
              <img
                src={url}
                alt="Certificate"
                className="max-w-full max-h-full object-contain rounded-[16px] shadow-sm"
              />
            </div>
          )}
        </div>
        <div className="px-8 py-6 border-t border-[#F5F6FA] flex gap-4 justify-end bg-[#FFFFFF] rounded-b-[24px]">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 text-[11px] font-black text-[#FFFFFF] bg-[#6C5CE7] border-none rounded-[12px] hover:bg-opacity-90 hover:shadow-md cursor-pointer transition-all uppercase tracking-widest outline-none no-underline transform hover:-translate-y-0.5 flex items-center"
          >
            Download
          </a>
          <button
            onClick={onClose}
            className="px-6 py-3 text-[11px] font-black text-[#2D3436] bg-[#F5F6FA] border border-transparent rounded-[12px] hover:border-[#6C5CE7] hover:text-[#6C5CE7] transition-colors cursor-pointer uppercase tracking-widest outline-none"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

const TABS_BY_ROLE = {
  student: [
    "Overview",
    "Profile",
    "Applications",
    "Reports",
    "History",
    "Organization",
  ],
  faculty: ["Overview", "Profile", "Employment", "Students", "Organization"],
  mentor: ["Overview", "Profile", "Employment", "Interns", "Organization"],
  college: ["Overview", "Profile", "Faculty", "Students"],
  company: ["Overview", "Profile", "Internships", "Mentors"],
  admin: ["Overview"],
};

function EditModal({ user, profile, onClose, onSave }) {
  const FIELDS_BY_ROLE = {
    student: [
      { key: "fullName", label: "Full Name", type: "text" },
      { key: "phoneNo", label: "Phone", type: "text" },
      { key: "courseName", label: "Course Name", type: "text" },
      { key: "specialization", label: "Specialization", type: "text" },
      { key: "bio", label: "Bio", type: "textarea" },
    ],
    faculty: [
      { key: "fullName", label: "Full Name", type: "text" },
      { key: "designation", label: "Designation", type: "text" },
      { key: "department", label: "Department", type: "text" },
      { key: "phoneNo", label: "Phone", type: "text" },
      { key: "employeeId", label: "Employee ID", type: "text" },
      { key: "bio", label: "Bio", type: "textarea" },
    ],
    mentor: [
      { key: "fullName", label: "Full Name", type: "text" },
      { key: "designation", label: "Designation", type: "text" },
      { key: "department", label: "Department", type: "text" },
      { key: "phoneNo", label: "Phone", type: "text" },
      { key: "employeeId", label: "Employee ID", type: "text" },
      { key: "bio", label: "Bio", type: "textarea" },
    ],
    college: [
      { key: "name", label: "College Name", type: "text" },
      { key: "address", label: "Address", type: "text" },
      { key: "phone", label: "Phone", type: "text" },
      { key: "website", label: "Website", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
    ],
    company: [
      { key: "name", label: "Company Name", type: "text" },
      { key: "website", label: "Website", type: "text" },
      { key: "industry", label: "Industry", type: "text" },
      { key: "companySize", label: "Company Size", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
    ],
  };

  const fields = FIELDS_BY_ROLE[user.role] || [];
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const init = {};
    fields.forEach(({ key }) => {
      init[key] = profile?.[key] ?? "";
    });
    setForm(init);
  }, []);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#2D3436]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300">
      <div className="bg-[#FFFFFF] rounded-[24px] shadow-2xl border border-[#F5F6FA] w-full max-w-lg max-h-[90vh] flex flex-col font-['Nunito'] box-border transform transition-transform duration-300 scale-100">
        <div className="px-8 py-6 border-b border-[#F5F6FA] flex items-center justify-between">
          <h2 className="text-xl font-black text-[#6C5CE7] m-0 tracking-tight">
            Edit Profile
          </h2>
          <button
            onClick={onClose}
            className="text-[10px] font-bold text-[#2D3436] opacity-60 uppercase tracking-widest bg-[#F5F6FA] border-none rounded-full px-3 py-1 cursor-pointer hover:bg-[#2D3436] hover:text-[#FFFFFF] transition-colors outline-none"
          >
            Close
          </button>
        </div>
        <div className="px-8 py-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
          {fields.map(({ key, label, type }) => (
            <div key={key} className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-[#2D3436] opacity-80 uppercase tracking-widest">
                {label}
              </label>
              {type === "textarea" ? (
                <textarea
                  value={form[key] || ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, [key]: e.target.value }))
                  }
                  rows={3}
                  className="w-full px-4 py-3.5 text-sm font-bold text-[#2D3436] bg-[#F5F6FA] border border-transparent rounded-[14px] outline-none focus:border-[#6C5CE7] focus:ring-1 focus:ring-[#6C5CE7] resize-y transition-all placeholder:text-[#2D3436] placeholder:opacity-40"
                />
              ) : (
                <input
                  type={type}
                  value={form[key] || ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, [key]: e.target.value }))
                  }
                  className="w-full px-4 py-3.5 text-sm font-bold text-[#2D3436] bg-[#F5F6FA] border border-transparent rounded-[14px] outline-none focus:border-[#6C5CE7] focus:ring-1 focus:ring-[#6C5CE7] transition-all placeholder:text-[#2D3436] placeholder:opacity-40"
                />
              )}
            </div>
          ))}
        </div>
        <div className="px-8 py-6 border-t border-[#F5F6FA] flex gap-4 justify-end bg-[#FFFFFF] rounded-b-[24px]">
          <button
            onClick={onClose}
            className="px-6 py-3 text-[11px] font-black text-[#2D3436] bg-[#F5F6FA] border border-transparent rounded-[12px] hover:border-[#6C5CE7] hover:text-[#6C5CE7] transition-colors cursor-pointer uppercase tracking-widest outline-none"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-6 py-3 text-[11px] font-black text-[#FFFFFF] bg-[#6C5CE7] border-none rounded-[12px] hover:bg-opacity-90 hover:shadow-md disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2 cursor-pointer transition-all uppercase tracking-widest outline-none transform hover:-translate-y-0.5"
          >
            {saving && <Spinner size={4} />}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminUserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [actionLoading, setActionLoading] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [showCertificateUrl, setShowCertificateUrl] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/users/${id}`);

      let userData = res.data;

      if (userData?.data?.data) {
        userData = userData.data.data;
      } else if (userData?.data) {
        userData = userData.data;
      }

      if (!userData) {
        showToast("Invalid response from server", "error");
        return;
      }

      if (!userData.user) {
        showToast("User not found or unable to load user details", "error");
        return;
      }

      setData(userData);
    } catch (err) {
      const errorMsg =
        err?.response?.data?.message || err?.message || "Failed to load user";
      console.error("Fetch error:", {
        status: err?.response?.status,
        message: errorMsg,
        error: err,
      });
      showToast(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setActionLoading((p) => ({ ...p, status: true }));
    try {
      const res = await api.patch(`/admin/users/${id}/status`, {
        accountStatus: newStatus,
      });
      setData((d) => ({ ...d, user: { ...d.user, accountStatus: newStatus } }));
      showToast(`User ${newStatus === "active" ? "activated" : "suspended"}`);
    } catch {
      showToast("Failed to update status", "error");
    } finally {
      setActionLoading((p) => ({ ...p, status: false }));
    }
  };

  const handleResendInvite = async () => {
    setActionLoading((p) => ({ ...p, invite: true }));
    try {
      await api.post(`/admin/users/${id}/resend-invite`);
      showToast("Invite sent successfully");
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed", "error");
    } finally {
      setActionLoading((p) => ({ ...p, invite: false }));
    }
  };

  const handleSaveProfile = async (form) => {
    try {
      await api.patch(`/admin/users/${id}/profile`, form);
      showToast("Profile updated");
      fetchUser();
    } catch {
      showToast("Update failed", "error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] flex items-center justify-center font-['Nunito'] transition-all duration-300">
        <div className="flex flex-col items-center gap-4">
          <Spinner size={10} />
          <p className="text-[#6C5CE7] font-black tracking-widest uppercase text-[10px] animate-pulse m-0">
            Loading User
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] flex items-center justify-center font-['Nunito'] transition-all duration-300">
        <div className="bg-[#F5F6FA] border border-transparent rounded-[24px] p-12 text-center shadow-sm">
          <p className="text-[#2D3436] opacity-60 m-0 text-base font-bold uppercase tracking-widest">
            User not found.
          </p>
        </div>
      </div>
    );
  }

  const {
    user,
    profile,
    organization,
    analytics,
    applications,
    history,
    related,
  } = data;
  const tabs = TABS_BY_ROLE[user.role] || ["Overview"];

  return (
    <div className="min-h-screen bg-[#FFFFFF] font-['Nunito'] box-border text-[#2D3436] selection:bg-[#6C5CE7]/20 selection:text-[#6C5CE7] pb-12 transition-all duration-300">
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-6 py-4 rounded-[14px] shadow-lg text-[10px] font-black tracking-widest uppercase border backdrop-blur-md transition-all animate-fade-in-down
          ${toast.type === "error" ? "bg-rose-50 text-rose-600 border-rose-200" : "bg-emerald-50 text-emerald-600 border-emerald-200"}`}
        >
          {toast.message}
        </div>
      )}

      {showEditModal && (
        <EditModal
          user={user}
          profile={profile}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveProfile}
        />
      )}

      {showCertificateUrl && (
        <CertificateModal
          url={showCertificateUrl}
          onClose={() => setShowCertificateUrl(null)}
        />
      )}

      <div className="bg-[#FFFFFF] border-b border-[#F5F6FA] pt-8 px-4 md:px-8 sticky top-0 z-30 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate("/admin/users")}
            className="flex items-center text-[10px] font-black text-[#2D3436] opacity-60 uppercase tracking-widest hover:text-[#6C5CE7] hover:opacity-100 mb-6 transition-colors bg-[#F5F6FA] border-none rounded-full px-4 py-2 cursor-pointer outline-none w-max transform hover:-translate-x-1"
          >
            ← Back to Users
          </button>

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-[20px] bg-[#F5F6FA] border border-transparent flex items-center justify-center text-[#6C5CE7] font-black text-2xl shadow-sm shrink-0 transition-all duration-300 hover:shadow-md hover:border-[#6C5CE7]">
                {user.email[0].toUpperCase()}
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl md:text-3xl font-black text-[#6C5CE7] m-0 leading-none tracking-tight">
                    {profile?.fullName || profile?.name || user.email}
                  </h1>
                  <Badge value={user.role} map={ROLE_COLORS} />
                  <Badge value={user.accountStatus} map={STATUS_COLORS} />
                </div>
                <p className="text-sm text-[#2D3436] opacity-80 font-bold tracking-wide m-0 leading-none">
                  {user.email}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[10px] font-black text-[#2D3436] opacity-50 uppercase tracking-widest">
                  <span>
                    Joined{" "}
                    {new Date(user.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  {user.lastLoginAt && (
                    <>
                      <span className="opacity-30">|</span>
                      <span>
                        Seen{" "}
                        {new Date(user.lastLoginAt).toLocaleDateString(
                          "en-IN",
                          { day: "2-digit", month: "short", year: "numeric" },
                        )}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {!user.isRegistered && user.accountStatus !== "deleted" && (
                <button
                  onClick={handleResendInvite}
                  disabled={actionLoading.invite}
                  className="px-5 py-3 text-[10px] font-black uppercase tracking-widest bg-[#F5F6FA] border border-transparent text-[#2D3436] rounded-[12px] hover:border-[#6C5CE7] hover:text-[#6C5CE7] flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer transition-all outline-none hover:-translate-y-0.5"
                >
                  {actionLoading.invite ? (
                    <Spinner size={3} />
                  ) : (
                    "Resend Invite"
                  )}
                </button>
              )}

              {user.accountStatus !== "deleted" && (
                <>
                  {user.accountStatus === "active" ? (
                    <button
                      onClick={() => handleStatusChange("suspended")}
                      disabled={actionLoading.status}
                      className="px-5 py-3 text-[10px] font-black uppercase tracking-widest bg-rose-50 border border-rose-200 text-rose-600 rounded-[12px] hover:bg-rose-100 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer transition-all outline-none hover:-translate-y-0.5"
                    >
                      {actionLoading.status ? (
                        <Spinner size={3} />
                      ) : (
                        "Suspend User"
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStatusChange("active")}
                      disabled={actionLoading.status}
                      className="px-5 py-3 text-[10px] font-black uppercase tracking-widest bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-[12px] hover:bg-emerald-100 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer transition-all outline-none hover:-translate-y-0.5 shadow-sm"
                    >
                      {actionLoading.status ? (
                        <Spinner size={3} />
                      ) : (
                        "Activate User"
                      )}
                    </button>
                  )}
                </>
              )}

              {user.role !== "admin" && (
                <button
                  onClick={() => setShowEditModal(true)}
                  className="px-6 py-3 text-[10px] font-black uppercase tracking-widest bg-[#6C5CE7] border-none text-[#FFFFFF] rounded-[12px] hover:bg-opacity-90 hover:shadow-md flex items-center gap-2 cursor-pointer transition-all outline-none transform hover:-translate-y-0.5"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-px">
            {tabs.map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActiveTab(i)}
                className={`px-6 py-4 text-[11px] font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap border-none cursor-pointer outline-none rounded-t-[14px] ${
                  activeTab === i
                    ? "bg-[#F5F6FA] text-[#6C5CE7] border-b-2 border-[#6C5CE7] shadow-inner"
                    : "bg-transparent text-[#2D3436] opacity-60 hover:opacity-100 hover:bg-[#F5F6FA] hover:text-[#6C5CE7]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {tabs[activeTab] === "Overview" && (
          <div className="flex flex-col gap-8 animate-fade-in-up">
            {analytics && Object.keys(analytics).length > 0 && (
              <div className="bg-[#FFFFFF] border border-[#F5F6FA] p-6 md:p-8 rounded-[24px] shadow-sm hover:shadow-md transition-shadow duration-300">
                <h2 className="text-[11px] font-black text-[#6C5CE7] uppercase tracking-widest mb-6 m-0 border-b border-[#F5F6FA] pb-4">
                  Analytics Dashboard
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {user.role === "student" && analytics && (
                    <>
                      <StatCard
                        label="Total Apps"
                        value={analytics.totalApplications}
                        accent="dark"
                      />
                      <StatCard
                        label="Applied"
                        value={analytics.applied}
                        accent="primary"
                      />
                      <StatCard
                        label="Shortlisted"
                        value={analytics.shortlisted}
                        accent="secondary"
                      />
                      <StatCard
                        label="Selected"
                        value={analytics.selected}
                        accent="accent"
                      />
                      <StatCard
                        label="Ongoing"
                        value={analytics.ongoing}
                        accent="primary"
                      />
                      <StatCard
                        label="Completed"
                        value={analytics.completed}
                        accent="light"
                      />
                      <StatCard
                        label="Rejected"
                        value={analytics.rejected}
                        accent="primary"
                      />
                    </>
                  )}
                  {user.role === "faculty" && analytics && (
                    <>
                      <StatCard
                        label="College Students"
                        value={analytics.students}
                        accent="accent"
                      />
                      <StatCard
                        label="College Faculty"
                        value={analytics.faculty}
                        accent="secondary"
                      />
                    </>
                  )}
                  {user.role === "mentor" && analytics && (
                    <>
                      <StatCard
                        label="Ongoing Interns"
                        value={analytics.ongoing}
                        accent="dark"
                      />
                      <StatCard
                        label="Completed Interns"
                        value={analytics.completed}
                        accent="accent"
                      />
                    </>
                  )}
                  {user.role === "college" && analytics && (
                    <>
                      <StatCard
                        label="Total Faculty"
                        value={analytics.faculty}
                        accent="secondary"
                      />
                      <StatCard
                        label="Total Students"
                        value={analytics.students}
                        accent="light"
                      />
                    </>
                  )}
                  {user.role === "company" && analytics && (
                    <>
                      <StatCard
                        label="Total Internships"
                        value={analytics.totalInternships}
                        accent="dark"
                      />
                      <StatCard
                        label="Total Applications"
                        value={analytics.totalApplications}
                        accent="accent"
                      />
                    </>
                  )}
                  {user.role === "admin" && (
                    <>
                      <StatCard label="Admin User" value="–" accent="primary" />
                    </>
                  )}
                </div>
              </div>
            )}

            <div className="bg-[#FFFFFF] border border-[#F5F6FA] p-6 md:p-8 rounded-[24px] shadow-sm hover:shadow-md transition-shadow duration-300">
              <Section title="Account System Details">
                <div className="flex flex-col">
                  <InfoRow label="Email Address" value={user.email} />
                  <InfoRow label="Assigned Role" value={user.role} />
                  <InfoRow label="Account State" value={user.accountStatus} />
                  <InfoRow
                    label="Email Verified"
                    value={user.isVerified ? "Yes" : "No"}
                  />
                  <InfoRow
                    label="Profile Setup"
                    value={user.isRegistered ? "Completed" : "Pending"}
                  />
                  <InfoRow label="Ref Model" value={user.referenceModel} />
                  <InfoRow
                    label="Creation Date"
                    value={new Date(user.createdAt).toLocaleString("en-IN")}
                  />
                  {user.lastLoginAt && (
                    <InfoRow
                      label="Last Active"
                      value={new Date(user.lastLoginAt).toLocaleString("en-IN")}
                    />
                  )}
                </div>
              </Section>
            </div>
          </div>
        )}

        {tabs[activeTab] === "Profile" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up">
            <div className="bg-[#FFFFFF] border border-[#F5F6FA] p-6 md:p-8 rounded-[24px] shadow-sm hover:shadow-md transition-shadow duration-300">
              <Section title="Profile Data">
                {profile ? (
                  <div className="flex flex-col">
                    {["fullName", "name"].map(
                      (k) =>
                        profile[k] && (
                          <InfoRow key={k} label="Name" value={profile[k]} />
                        ),
                    )}
                    <InfoRow label="Designation" value={profile.designation} />
                    <InfoRow label="Department" value={profile.department} />
                    <InfoRow
                      label="Phone"
                      value={profile.phoneNo || profile.phone}
                    />
                    <InfoRow label="Biography" value={profile.bio} />
                    <InfoRow label="Employee ID" value={profile.employeeId} />
                    <InfoRow label="PRN Number" value={profile.prn} />
                    <InfoRow label="Course" value={profile.courseName} />
                    <InfoRow
                      label="Specialization"
                      value={profile.specialization}
                    />
                    <InfoRow label="Joining Year" value={profile.joiningYear} />
                    <InfoRow
                      label="Profile Status"
                      value={profile.profileStatus}
                    />
                    <InfoRow label="Current Status" value={profile.status} />
                    {profile.website && (
                      <InfoRow label="Website" value={profile.website} />
                    )}
                    {profile.industry && (
                      <InfoRow label="Industry" value={profile.industry} />
                    )}
                    {profile.companySize && (
                      <InfoRow
                        label="Company Size"
                        value={profile.companySize}
                      />
                    )}
                    {profile.address && (
                      <InfoRow label="Address" value={profile.address} />
                    )}
                    {profile.description && (
                      <InfoRow
                        label="Description"
                        value={profile.description}
                      />
                    )}
                    {profile.skills?.length > 0 && (
                      <div className="flex flex-col sm:flex-row sm:items-start gap-1.5 sm:gap-4 py-4 border-b border-[#F5F6FA] last:border-0 hover:bg-[#F5F6FA] hover:bg-opacity-50 transition-colors px-2 -mx-2 rounded-lg">
                        <span className="text-[10px] text-[#2D3436] opacity-60 sm:w-40 shrink-0 font-bold uppercase tracking-widest mt-1">
                          Skills
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {profile.skills.map((s) => (
                            <span
                              key={s}
                              className="px-3 py-1.5 bg-[#F5F6FA] border border-transparent text-[#6C5CE7] text-[10px] font-black rounded-lg tracking-wide shadow-sm"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="py-8 text-sm text-[#2D3436] opacity-40 font-bold text-center m-0 uppercase tracking-widest">
                    No profile data available.
                  </p>
                )}
              </Section>
            </div>

            <div className="flex flex-col gap-6">
              {user.role === "college" && profile?.courses?.length > 0 && (
                <div className="bg-[#FFFFFF] border border-[#F5F6FA] p-6 md:p-8 rounded-[24px] shadow-sm hover:shadow-md transition-shadow duration-300">
                  <Section title="Offered Courses">
                    <div className="flex flex-col gap-4">
                      {profile.courses.map((c, i) => (
                        <div
                          key={i}
                          className="p-5 bg-[#F5F6FA] border border-transparent rounded-[16px] transition-all duration-300 hover:border-[#6C5CE7] hover:shadow-sm"
                        >
                          <p className="text-base font-black text-[#6C5CE7] m-0">
                            {c.name}
                          </p>
                          <p className="text-[10px] font-bold text-[#2D3436] opacity-60 uppercase tracking-widest mt-1 mb-0">
                            {c.durationYears} years
                          </p>
                          {c.specializations?.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-[#FFFFFF]">
                              {c.specializations.map((s) => (
                                <span
                                  key={s}
                                  className="px-3 py-1.5 bg-[#FFFFFF] border border-transparent text-[#2D3436] font-bold text-[10px] rounded-lg uppercase tracking-widest shadow-sm"
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </Section>
                </div>
              )}

              {(user.role === "company" || user.role === "mentor") &&
                organization?.locations?.length > 0 && (
                  <div className="bg-[#FFFFFF] border border-[#F5F6FA] p-6 md:p-8 rounded-[24px] shadow-sm hover:shadow-md transition-shadow duration-300">
                    <Section title="Registered Locations">
                      <div className="flex flex-col gap-3">
                        {organization.locations.map((l, i) => (
                          <div
                            key={i}
                            className="p-4 bg-[#F5F6FA] border border-transparent rounded-[16px] text-sm font-bold text-[#2D3436] transition-all hover:border-[#6C5CE7] hover:text-[#6C5CE7]"
                          >
                            {[l.city, l.state, l.country]
                              .filter(Boolean)
                              .join(", ")}
                          </div>
                        ))}
                      </div>
                    </Section>
                  </div>
                )}
            </div>
          </div>
        )}

        {tabs[activeTab] === "Applications" && (
          <div className="flex flex-col gap-5 animate-fade-in-up">
            {applications?.length === 0 ? (
              <div className="bg-[#F5F6FA] border border-transparent rounded-[24px] py-16 text-center text-[#2D3436] opacity-60 shadow-inner">
                <p className="font-bold text-base m-0 uppercase tracking-widest">
                  No applications on record
                </p>
              </div>
            ) : (
              applications.map((app) => (
                <div
                  key={app._id}
                  className="bg-[#FFFFFF] rounded-[24px] border border-[#F5F6FA] p-6 md:p-8 hover:border-[#6C5CE7] hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <div className="flex flex-col md:flex-row items-start justify-between gap-5">
                    <div className="flex-1 flex flex-col gap-3">
                      <div className="flex items-center gap-4 flex-wrap">
                        <h3 className="font-black text-[#6C5CE7] text-xl m-0">
                          {app.internship?.title}
                        </h3>
                        <Badge value={app.status} map={APP_STATUS_COLORS} />
                      </div>
                      <p className="text-sm font-black text-[#2D3436] uppercase tracking-widest m-0">
                        {app.company?.name}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold text-[#2D3436] opacity-60 uppercase tracking-widest mt-1 bg-[#F5F6FA] p-3 rounded-[12px] w-max">
                        <span>
                          Applied:{" "}
                          {new Date(app.appliedAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        {app.internship?.mode && (
                          <>
                            <span className="opacity-30">|</span>
                            <span className="text-[#6C5CE7] font-black">
                              {app.internship.mode}
                            </span>
                          </>
                        )}
                        {app.internship?.durationMonths && (
                          <>
                            <span className="opacity-30">|</span>
                            <span>{app.internship.durationMonths} mos</span>
                          </>
                        )}
                        {app.internship?.stipendAmount && (
                          <>
                            <span className="opacity-30">|</span>
                            <span className="text-emerald-600 font-black">
                              ₹{app.internship.stipendAmount.toLocaleString()}
                            </span>
                          </>
                        )}
                      </div>

                      {(app.mentor || app.faculty) && (
                        <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-[#F5F6FA]">
                          {app.mentor && (
                            <p className="text-xs font-bold text-[#2D3436] m-0">
                              <span className="font-black text-[#6C5CE7] uppercase tracking-widest mr-2">
                                Mentor:
                              </span>{" "}
                              {app.mentor.fullName}
                            </p>
                          )}
                          {app.faculty && (
                            <p className="text-xs font-bold text-[#2D3436] m-0">
                              <span className="font-black text-[#6C5CE7] uppercase tracking-widest mr-2">
                                Faculty:
                              </span>{" "}
                              {app.faculty.fullName}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col md:items-end gap-2 text-[10px] font-black uppercase tracking-widest text-[#2D3436] bg-[#F5F6FA] border border-transparent p-5 rounded-[16px] w-full md:w-auto shadow-sm">
                      {app.internshipStartDate && (
                        <p className="m-0">
                          <span className="text-[#6C5CE7] mr-2">Start:</span>{" "}
                          {new Date(app.internshipStartDate).toLocaleDateString(
                            "en-IN",
                          )}
                        </p>
                      )}
                      {app.internshipEndDate && (
                        <p className="m-0">
                          <span className="text-[#6C5CE7] mr-2">End:</span>{" "}
                          {new Date(app.internshipEndDate).toLocaleDateString(
                            "en-IN",
                          )}
                        </p>
                      )}
                      {app.evaluationScore != null && (
                        <p className="font-black text-[#FFFFFF] text-sm mt-3 mb-0 bg-[#6C5CE7] px-3 py-1.5 rounded-lg border border-transparent w-max shadow-sm">
                          Score: {app.evaluationScore}/100
                        </p>
                      )}
                      {app.certificate && (
                        <button
                          onClick={() => setShowCertificateUrl(app.certificate)}
                          className="mt-3 px-3 py-2 text-[9px] font-black uppercase tracking-widest bg-[#FFFFFF] border border-[#6C5CE7] text-[#6C5CE7] rounded-lg hover:bg-[#6C5CE7] hover:text-[#FFFFFF] transition-colors cursor-pointer whitespace-nowrap shadow-sm"
                        >
                          View Certificate
                        </button>
                      )}
                    </div>
                  </div>
                  {(app.mentorFeedback || app.facultyFeedback) && (
                    <div className="mt-6 pt-5 border-t border-[#F5F6FA] flex flex-col gap-3">
                      {app.mentorFeedback && (
                        <p className="text-xs font-bold leading-relaxed text-[#2D3436] m-0 bg-[#F5F6FA] p-4 rounded-[16px] border border-transparent">
                          <span className="font-black text-[#6C5CE7] uppercase tracking-widest block mb-1">
                            Mentor Feedback:
                          </span>{" "}
                          {app.mentorFeedback}
                        </p>
                      )}
                      {app.facultyFeedback && (
                        <p className="text-xs font-bold leading-relaxed text-[#2D3436] m-0 bg-[#F5F6FA] p-4 rounded-[16px] border border-transparent">
                          <span className="font-black text-[#6C5CE7] uppercase tracking-widest block mb-1">
                            Faculty Feedback:
                          </span>{" "}
                          {app.facultyFeedback}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {tabs[activeTab] === "Reports" && (
          <div className="flex flex-col gap-5 animate-fade-in-up">
            {!applications?.length ? (
              <div className="bg-[#F5F6FA] border border-transparent rounded-[24px] py-16 text-center text-[#2D3436] opacity-60 shadow-inner">
                <p className="font-bold text-base m-0 uppercase tracking-widest">
                  No internship reports
                </p>
              </div>
            ) : (
              applications.map((app) =>
                app.report ? (
                  <div
                    key={app._id}
                    className="bg-[#FFFFFF] rounded-[24px] border border-[#F5F6FA] p-6 md:p-8 hover:border-[#6C5CE7] transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-3 flex-wrap justify-between">
                        <h3 className="font-black text-[#6C5CE7] text-lg m-0">
                          {app.internship?.title} - {app.company?.name}
                        </h3>
                        <Badge value={app.report.status} map={STATUS_COLORS} />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-[#F5F6FA] border border-transparent p-4 rounded-[16px] shadow-sm">
                          <p className="text-[10px] text-[#2D3436] opacity-60 font-black uppercase tracking-widest m-0">
                            Total Tasks
                          </p>
                          <p className="text-2xl font-black text-[#6C5CE7] m-0 mt-2">
                            {app.report.totalTasks}
                          </p>
                        </div>
                        <div className="bg-[#F5F6FA] border border-transparent p-4 rounded-[16px] shadow-sm">
                          <p className="text-[10px] text-[#2D3436] opacity-60 font-black uppercase tracking-widest m-0">
                            Completed
                          </p>
                          <p className="text-2xl font-black text-emerald-600 m-0 mt-2">
                            {app.report.tasksCompleted}
                          </p>
                        </div>
                        <div className="bg-[#F5F6FA] border border-transparent p-4 rounded-[16px] shadow-sm">
                          <p className="text-[10px] text-[#2D3436] opacity-60 font-black uppercase tracking-widest m-0">
                            Completion Rate
                          </p>
                          <p className="text-2xl font-black text-[#6C5CE7] m-0 mt-2">
                            {app.report.completionRate}%
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-[#FFFFFF] border border-[#F5F6FA] p-3 rounded-[16px] shadow-sm text-center">
                          <p className="text-[10px] text-[#2D3436] opacity-60 font-black uppercase tracking-widest m-0">
                            Mentor Score
                          </p>
                          <p className="text-xl font-black text-[#6C5CE7] m-0 mt-1">
                            {app.report.mentorScore}/10
                          </p>
                        </div>
                        <div className="bg-[#FFFFFF] border border-[#F5F6FA] p-3 rounded-[16px] shadow-sm text-center">
                          <p className="text-[10px] text-[#2D3436] opacity-60 font-black uppercase tracking-widest m-0">
                            Faculty Score
                          </p>
                          <p className="text-xl font-black text-[#6C5CE7] m-0 mt-1">
                            {app.report.facultyScore}/10
                          </p>
                        </div>
                      </div>

                      {app.report.technologies?.length > 0 && (
                        <div className="bg-[#F5F6FA] border border-transparent p-4 rounded-[16px]">
                          <p className="text-[10px] text-[#2D3436] opacity-60 font-black uppercase tracking-widest m-0 mb-2">
                            Technologies
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {app.report.technologies.map((tech) => (
                              <span
                                key={tech}
                                className="px-3 py-1.5 bg-[#FFFFFF] border border-[#F5F6FA] text-[#6C5CE7] text-[10px] font-black rounded-lg shadow-sm"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {app.report.facultyRemarks && (
                        <div className="bg-[#F5F6FA] border border-transparent p-4 rounded-[16px]">
                          <p className="text-[10px] text-[#2D3436] opacity-60 font-black uppercase tracking-widest m-0 mb-2">
                            Faculty Remarks
                          </p>
                          <p className="text-sm font-bold text-[#2D3436] m-0">
                            {app.report.facultyRemarks}
                          </p>
                        </div>
                      )}

                      {app.report.reportUrl && (
                        <a
                          href={app.report.reportUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-3 mt-2 text-[11px] font-black uppercase tracking-widest bg-[#6C5CE7] text-[#FFFFFF] rounded-[12px] hover:bg-opacity-90 hover:shadow-md transition-all text-center cursor-pointer no-underline transform hover:-translate-y-0.5 inline-block w-max self-start"
                        >
                          View Full Report
                        </a>
                      )}
                    </div>
                  </div>
                ) : null,
              )
            )}
          </div>
        )}

        {tabs[activeTab] === "History" && (
          <div className="flex flex-col gap-5 animate-fade-in-up">
            {history?.length === 0 ? (
              <div className="bg-[#F5F6FA] border border-transparent rounded-[24px] py-16 text-center text-[#2D3436] opacity-60 shadow-inner">
                <p className="font-bold text-base m-0 uppercase tracking-widest">
                  No academic history
                </p>
              </div>
            ) : (
              history.map((h) => (
                <div
                  key={h._id}
                  className="bg-[#FFFFFF] rounded-[24px] border border-[#F5F6FA] p-6 md:p-8 hover:border-[#6C5CE7] hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-5 border-b border-[#F5F6FA] pb-5">
                    <h3 className="font-black text-[#6C5CE7] text-xl m-0">
                      {h.college?.name}
                    </h3>
                    <Badge
                      value={h.status}
                      map={{
                        active:
                          "bg-emerald-50 border-emerald-200 text-emerald-600",
                        ended: "bg-slate-100 border-slate-300 text-slate-500",
                      }}
                    />
                  </div>
                  <div className="flex flex-col gap-2.5 text-sm text-[#2D3436] font-bold">
                    {h.courseName && (
                      <p className="font-black text-[#2D3436] m-0 bg-[#F5F6FA] px-3 py-1.5 rounded-lg w-max">
                        {h.courseName}
                        {h.specialization ? ` — ${h.specialization}` : ""}
                      </p>
                    )}
                    <p className="font-black text-[10px] uppercase tracking-widest text-[#6C5CE7] m-0 mt-2">
                      {new Date(h.startDate).toLocaleDateString("en-IN")} →{" "}
                      {h.endDate
                        ? new Date(h.endDate).toLocaleDateString("en-IN")
                        : "Present"}
                    </p>
                    {h.college?.address && (
                      <p className="opacity-60 m-0 text-xs mt-1">
                        {h.college.address}
                      </p>
                    )}
                    {h.remarks && (
                      <p className="italic bg-[#F5F6FA] p-4 rounded-[12px] border border-transparent mt-3 mb-0 text-xs text-[#2D3436]">
                        {h.remarks}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tabs[activeTab] === "Employment" && (
          <div className="flex flex-col gap-5 animate-fade-in-up">
            {history?.length === 0 ? (
              <div className="bg-[#F5F6FA] border border-transparent rounded-[24px] py-16 text-center text-[#2D3436] opacity-60 shadow-inner">
                <p className="font-bold text-base m-0 uppercase tracking-widest">
                  No employment history
                </p>
              </div>
            ) : (
              history.map((h) => (
                <div
                  key={h._id}
                  className="bg-[#FFFFFF] rounded-[24px] border border-[#F5F6FA] p-6 md:p-8 hover:border-[#6C5CE7] hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-5 border-b border-[#F5F6FA] pb-5">
                    <div className="flex flex-col gap-1.5">
                      <h3 className="font-black text-[#6C5CE7] text-xl m-0">
                        {h.college?.name || h.company?.name}
                      </h3>
                      {(h.designation || h.department) && (
                        <p className="text-[11px] font-black text-[#2D3436] opacity-80 uppercase tracking-widest m-0 bg-[#F5F6FA] px-2 py-1 rounded-md w-max">
                          {[h.designation, h.department]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      )}
                    </div>
                    <Badge
                      value={h.status}
                      map={{
                        active:
                          "bg-emerald-50 border-emerald-200 text-emerald-600",
                        ended: "bg-slate-100 border-slate-300 text-slate-500",
                      }}
                    />
                  </div>
                  <div className="flex flex-col gap-2.5 text-sm text-[#2D3436] font-bold">
                    {h.courseName && (
                      <p className="m-0 text-[#6C5CE7] font-black">
                        {h.courseName}
                        {h.specialization ? ` — ${h.specialization}` : ""}
                      </p>
                    )}
                    <p className="font-black text-[10px] uppercase tracking-widest text-[#2D3436] opacity-60 m-0">
                      {new Date(h.startDate).toLocaleDateString("en-IN")} →{" "}
                      {h.endDate
                        ? new Date(h.endDate).toLocaleDateString("en-IN")
                        : "Present"}
                    </p>
                    {h.remarks && (
                      <p className="italic bg-[#F5F6FA] p-4 rounded-[12px] border border-transparent mt-3 mb-0 text-xs text-[#2D3436]">
                        {h.remarks}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tabs[activeTab] === "Organization" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up">
            {organization ? (
              <div className="bg-[#FFFFFF] border border-[#F5F6FA] p-6 md:p-8 rounded-[24px] shadow-sm hover:shadow-md transition-shadow duration-300">
                <Section
                  title={
                    user.role === "student" || user.role === "faculty"
                      ? "College Details"
                      : "Company Details"
                  }
                >
                  <div className="flex flex-col">
                    <InfoRow label="Name" value={organization.name} />
                    <InfoRow label="Website" value={organization.website} />
                    <InfoRow
                      label="Email Domain"
                      value={organization.emailDomain}
                    />
                    <InfoRow label="Industry" value={organization.industry} />
                    <InfoRow label="Address" value={organization.address} />
                    {organization.locations?.map((l, i) => (
                      <InfoRow
                        key={i}
                        label={`Location ${i + 1}`}
                        value={[l.city, l.state, l.country]
                          .filter(Boolean)
                          .join(", ")}
                      />
                    ))}
                    <InfoRow
                      label="System Status"
                      value={organization.status}
                    />
                  </div>
                </Section>
              </div>
            ) : (
              <div className="bg-[#F5F6FA] border border-transparent rounded-[24px] py-16 text-center text-[#2D3436] opacity-60 shadow-inner col-span-full">
                <p className="font-bold text-base m-0 uppercase tracking-widest">
                  Not assigned to any organization
                </p>
              </div>
            )}
          </div>
        )}

        {tabs[activeTab] === "Students" && user.role === "faculty" && (
          <div className="bg-[#FFFFFF] border border-[#F5F6FA] rounded-[24px] shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden animate-fade-in-up">
            {!related?.students?.length ? (
              <div className="py-16 text-center text-[#2D3436] opacity-60 font-bold text-base bg-[#F5F6FA] uppercase tracking-widest">
                <p className="m-0">No students in your college</p>
              </div>
            ) : (
              <div className="overflow-x-auto bg-[#FFFFFF] custom-scrollbar">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead className="bg-[#F5F6FA] border-b border-[#E5E5E5]">
                    <tr>
                      <th className="px-6 py-5 text-[10px] font-black text-[#6C5CE7] uppercase tracking-widest">
                        Name
                      </th>
                      <th className="px-6 py-5 text-[10px] font-black text-[#6C5CE7] uppercase tracking-widest">
                        PRN
                      </th>
                      <th className="px-6 py-5 text-[10px] font-black text-[#6C5CE7] uppercase tracking-widest">
                        Course
                      </th>
                      <th className="px-6 py-5 text-[10px] font-black text-[#6C5CE7] uppercase tracking-widest">
                        Specialization
                      </th>
                      <th className="px-6 py-5 text-[10px] font-black text-[#6C5CE7] uppercase tracking-widest">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F5F6FA]">
                    {related.students.map((student) => (
                      <tr
                        key={student._id}
                        className="hover:bg-[#F5F6FA] transition-colors duration-300 group"
                      >
                        <td className="px-6 py-5 text-sm font-black text-[#2D3436] group-hover:text-[#6C5CE7] transition-colors">
                          {student.fullName}
                        </td>
                        <td className="px-6 py-5 text-xs text-[#2D3436] opacity-60 font-mono font-bold">
                          {student.prn || "–"}
                        </td>
                        <td className="px-6 py-5 text-xs text-[#6C5CE7] font-black tracking-wide bg-[#F5F6FA] bg-opacity-50">
                          {student.courseName || "–"}
                        </td>
                        <td className="px-6 py-5 text-xs text-[#2D3436] font-bold">
                          {student.specialization || "–"}
                        </td>
                        <td className="px-6 py-5">
                          <Badge value={student.status} map={STATUS_COLORS} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tabs[activeTab] === "Mentors" && user.role === "company" && (
          <div className="flex flex-col gap-5 animate-fade-in-up">
            {!related?.mentors?.length ? (
              <div className="bg-[#F5F6FA] border border-transparent rounded-[24px] py-16 text-center text-[#2D3436] opacity-60 shadow-inner">
                <p className="font-bold text-base m-0 uppercase tracking-widest">
                  No mentors assigned to your company
                </p>
              </div>
            ) : (
              related.mentors.map((mentor) => (
                <div
                  key={mentor._id}
                  className="bg-[#FFFFFF] rounded-[24px] border border-[#F5F6FA] p-6 md:p-8 hover:border-[#6C5CE7] transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex flex-col gap-2">
                      <p className="font-black text-[#6C5CE7] text-lg m-0">
                        {mentor.fullName}
                      </p>
                      <p className="text-[11px] text-[#2D3436] bg-[#F5F6FA] px-2 py-1 rounded-md font-black uppercase tracking-widest m-0 w-max">
                        {mentor.designation || "–"}
                      </p>
                      {mentor.department && (
                        <p className="text-xs font-bold text-[#2D3436] opacity-80 m-0">
                          {mentor.department}
                        </p>
                      )}
                    </div>
                    <Badge value={mentor.status} map={STATUS_COLORS} />
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tabs[activeTab] === "Internships" && user.role === "company" && (
          <div className="flex flex-col gap-5 animate-fade-in-up">
            {!related?.internships?.length ? (
              <div className="bg-[#F5F6FA] border border-transparent rounded-[24px] py-16 text-center text-[#2D3436] opacity-60 shadow-inner">
                <p className="font-bold text-base m-0 uppercase tracking-widest">
                  No internships posted
                </p>
              </div>
            ) : (
              related.internships.map((internship) => (
                <div
                  key={internship._id}
                  className="bg-[#FFFFFF] rounded-[24px] border border-[#F5F6FA] p-6 md:p-8 hover:border-[#6C5CE7] transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                      <div className="flex-1 flex flex-col gap-3">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="font-black text-[#6C5CE7] text-xl m-0">
                            {internship.title}
                          </h3>
                          <Badge
                            value={internship.status}
                            map={{
                              open: "bg-emerald-50 border-emerald-200 text-emerald-600",
                              closed:
                                "bg-rose-50 border-rose-200 text-rose-600",
                            }}
                          />
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-[10px] font-black text-[#2D3436] uppercase tracking-widest bg-[#F5F6FA] p-3.5 rounded-[12px] border border-transparent w-max shadow-sm">
                          {internship.mode && (
                            <span className="text-[#6C5CE7]">
                              {internship.mode}
                            </span>
                          )}
                          {internship.durationMonths && (
                            <>
                              <span className="opacity-30">|</span>
                              <span className="opacity-80">
                                {internship.durationMonths} mos
                              </span>
                            </>
                          )}
                          {internship.stipendType && (
                            <>
                              <span className="opacity-30">|</span>
                              <span className="text-emerald-600">
                                {internship.stipendType}
                              </span>
                            </>
                          )}
                          {internship.stipendAmount && (
                            <>
                              <span className="opacity-30">|</span>
                              <span className="text-emerald-600">
                                ₹{internship.stipendAmount.toLocaleString()}/mo
                              </span>
                            </>
                          )}
                        </div>

                        {internship.skillsRequired?.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {internship.skillsRequired.map((s) => (
                              <span
                                key={s}
                                className="px-3 py-1.5 bg-[#FFFFFF] border border-[#F5F6FA] text-[#6C5CE7] text-[10px] font-black uppercase tracking-widest rounded-lg shadow-sm"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="bg-[#F5F6FA] border border-[#6C5CE7] border-opacity-30 p-5 rounded-[20px] text-center min-w-[140px] shadow-sm flex flex-col items-center justify-center">
                        <p className="text-4xl font-black text-[#6C5CE7] m-0 leading-none">
                          {internship.applicantCount}
                        </p>
                        <p className="text-[10px] font-black text-[#2D3436] opacity-60 uppercase tracking-widest mt-2 mb-0">
                          Applicants
                        </p>
                      </div>
                    </div>

                    {internship.applicants?.length > 0 && (
                      <div className="border-t border-[#F5F6FA] pt-6 mt-2">
                        <h4 className="text-[11px] font-black text-[#6C5CE7] uppercase tracking-widest mb-4">
                          Applicants
                        </h4>
                        <div className="space-y-3">
                          {internship.applicants.map((applicant) => (
                            <div
                              key={applicant._id}
                              className="bg-[#FFFFFF] border border-[#F5F6FA] hover:border-[#6C5CE7] transition-colors p-4 rounded-[16px] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm"
                            >
                              <div className="flex-1">
                                <p className="font-black text-[#2D3436] m-0">
                                  {applicant.student?.fullName}
                                </p>
                                <p className="text-[11px] text-[#2D3436] opacity-60 font-mono font-bold m-0 mt-1">
                                  {applicant.student?.prn}
                                </p>
                              </div>
                              <div className="flex items-center gap-3">
                                <Badge
                                  value={applicant.status}
                                  map={APP_STATUS_COLORS}
                                />
                                <span className="text-[10px] text-[#2D3436] opacity-40 font-black uppercase tracking-widest whitespace-nowrap bg-[#F5F6FA] px-2 py-1 rounded-md">
                                  {new Date(
                                    applicant.appliedAt,
                                  ).toLocaleDateString("en-IN")}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tabs[activeTab] === "Students" && user.role === "college" && (
          <div className="bg-[#FFFFFF] border border-[#F5F6FA] rounded-[24px] shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden animate-fade-in-up">
            {!related?.students?.length ? (
              <div className="py-16 text-center text-[#2D3436] opacity-60 font-bold text-base bg-[#F5F6FA] uppercase tracking-widest">
                No students found
              </div>
            ) : (
              <div className="overflow-x-auto bg-[#FFFFFF] custom-scrollbar">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead className="bg-[#F5F6FA] border-b border-[#E5E5E5]">
                    <tr>
                      <th className="px-6 py-5 text-[10px] font-black text-[#6C5CE7] uppercase tracking-widest">
                        Name
                      </th>
                      <th className="px-6 py-5 text-[10px] font-black text-[#6C5CE7] uppercase tracking-widest">
                        PRN
                      </th>
                      <th className="px-6 py-5 text-[10px] font-black text-[#6C5CE7] uppercase tracking-widest">
                        Course
                      </th>
                      <th className="px-6 py-5 text-[10px] font-black text-[#6C5CE7] uppercase tracking-widest">
                        Specialization
                      </th>
                      <th className="px-6 py-5 text-[10px] font-black text-[#6C5CE7] uppercase tracking-widest">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F5F6FA]">
                    {related.students.map((student) => (
                      <tr
                        key={student._id}
                        className="hover:bg-[#F5F6FA] transition-colors duration-300 group"
                      >
                        <td className="px-6 py-5 text-sm font-black text-[#2D3436] group-hover:text-[#6C5CE7] transition-colors">
                          {student.fullName}
                        </td>
                        <td className="px-6 py-5 text-xs text-[#2D3436] opacity-60 font-mono font-bold">
                          {student.prn || "–"}
                        </td>
                        <td className="px-6 py-5 text-xs text-[#6C5CE7] font-black tracking-wide bg-[#F5F6FA] bg-opacity-50">
                          {student.courseName || "–"}
                        </td>
                        <td className="px-6 py-5 text-xs text-[#2D3436] font-bold">
                          {student.specialization || "–"}
                        </td>
                        <td className="px-6 py-5">
                          <Badge value={student.status} map={STATUS_COLORS} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tabs[activeTab] === "Faculty" && user.role === "college" && (
          <div className="bg-[#FFFFFF] border border-[#F5F6FA] rounded-[24px] shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden animate-fade-in-up">
            {!related?.faculty?.length ? (
              <div className="py-16 text-center text-[#2D3436] opacity-60 font-bold text-base bg-[#F5F6FA] uppercase tracking-widest">
                No faculty found
              </div>
            ) : (
              <div className="overflow-x-auto bg-[#FFFFFF] custom-scrollbar">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead className="bg-[#F5F6FA] border-b border-[#E5E5E5]">
                    <tr>
                      <th className="px-6 py-5 text-[10px] font-black text-[#6C5CE7] uppercase tracking-widest">
                        Name
                      </th>
                      <th className="px-6 py-5 text-[10px] font-black text-[#6C5CE7] uppercase tracking-widest">
                        Designation
                      </th>
                      <th className="px-6 py-5 text-[10px] font-black text-[#6C5CE7] uppercase tracking-widest">
                        Department
                      </th>
                      <th className="px-6 py-5 text-[10px] font-black text-[#6C5CE7] uppercase tracking-widest">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F5F6FA]">
                    {related.faculty.map((member) => (
                      <tr
                        key={member._id}
                        className="hover:bg-[#F5F6FA] transition-colors duration-300 group"
                      >
                        <td className="px-6 py-5 text-sm font-black text-[#2D3436] group-hover:text-[#6C5CE7] transition-colors">
                          {member.fullName}
                        </td>
                        <td className="px-6 py-5 text-xs text-[#2D3436] font-bold">
                          {member.designation || "–"}
                        </td>
                        <td className="px-6 py-5 text-xs text-[#6C5CE7] font-black tracking-wide bg-[#F5F6FA] bg-opacity-50">
                          {member.department || "–"}
                        </td>
                        <td className="px-6 py-5">
                          <Badge value={member.status} map={STATUS_COLORS} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tabs[activeTab] === "Interns" && user.role === "mentor" && (
          <div className="flex flex-col gap-5 animate-fade-in-up">
            {applications?.length === 0 ? (
              <div className="bg-[#F5F6FA] border border-transparent rounded-[24px] py-16 text-center text-[#2D3436] opacity-60 shadow-inner">
                <p className="font-bold text-base m-0 uppercase tracking-widest">
                  No interns assigned
                </p>
              </div>
            ) : (
              applications.map((app) => (
                <div
                  key={app._id}
                  className="bg-[#FFFFFF] rounded-[24px] border border-[#F5F6FA] p-6 md:p-8 hover:border-[#6C5CE7] hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <div className="flex flex-col md:flex-row items-start justify-between gap-5">
                    <div className="flex flex-col gap-2">
                      <p className="font-black text-[#6C5CE7] text-xl m-0">
                        {app.student?.fullName}
                      </p>
                      {app.student && (
                        <p className="text-[10px] font-black text-[#2D3436] uppercase tracking-widest m-0 bg-[#F5F6FA] px-3 py-1.5 rounded-lg border border-transparent w-max mt-1">
                          {app.student?.prn}
                        </p>
                      )}
                      <p className="text-sm font-bold text-[#2D3436] opacity-80 m-0 mt-2">
                        {app.internship?.title}
                      </p>
                    </div>
                    <Badge value={app.status} map={APP_STATUS_COLORS} />
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}