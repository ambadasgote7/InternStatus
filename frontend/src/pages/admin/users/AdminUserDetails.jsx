import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../api/api";

const ROLE_COLORS = {
  admin: "bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30",
  college: "bg-violet-500/20 text-violet-300 border border-violet-500/30",
  faculty: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
  student: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
  company: "bg-rose-500/20 text-rose-300 border border-rose-500/30",
  mentor: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
};

const STATUS_COLORS = {
  active: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
  suspended: "bg-red-500/10 text-red-400 border border-red-500/20",
  deleted: "bg-white/5 text-white/40 border border-white/10",
  inactive: "bg-white/10 text-white/60 border border-white/20",
  unassigned: "bg-transparent text-white/40 border border-white/10",
  completed: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
  pending: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
  graduated: "bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30"
};

const APP_STATUS_COLORS = {
  applied: "bg-white/10 text-white/80 border border-white/20",
  shortlisted: "bg-violet-500/20 text-violet-300 border border-violet-500/30",
  selected: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
  offer_accepted: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
  rejected: "bg-red-500/10 text-red-400 border border-red-500/20",
  withdrawn: "bg-white/5 text-white/40 border border-white/10",
  ongoing: "bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30",
  completed: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
  terminated: "bg-red-500/10 text-red-400 border border-red-500/20",
};

function Badge({ value, map, className = "" }) {
  const cls = (map && map[value]) || "bg-white/5 border border-white/10 text-white/60";
  return (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest ${cls} ${className}`}>
      {value?.replace(/_/g, " ")}
    </span>
  );
}

function Spinner({ size = 5 }) {
  return (
    <div className={`animate-spin h-${size} w-${size} rounded-full border-2 border-white/10 border-t-fuchsia-500`}></div>
  );
}

function InfoRow({ label, value }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1.5 sm:gap-4 py-3 border-b border-white/5 last:border-0">
      <span className="text-[10px] text-white/40 sm:w-40 shrink-0 font-bold uppercase tracking-widest mt-0.5">{label}</span>
      <span className="text-sm font-bold text-white/90 break-words">{String(value)}</span>
    </div>
  );
}

function Section({ title, children, action }) {
  return (
    <div className="bg-[#0B0F19]/30 rounded-2xl border border-white/5 overflow-hidden shadow-inner">
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/5">
        <h3 className="text-[11px] font-bold text-violet-400 uppercase tracking-widest m-0">{title}</h3>
        {action}
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

function StatCard({ label, value, accent = "primary" }) {
  const colors = {
    primary: "bg-white/5 border border-white/10 text-white",
    secondary: "bg-violet-500/10 border border-violet-500/20 text-violet-300",
    accent: "bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-fuchsia-500/30 text-fuchsia-300",
    dark: "bg-[#0B0F19]/50 border border-white/5 text-white/80",
    light: "bg-white/10 border border-white/20 text-white/90",
  };
  return (
    <div className={`rounded-2xl p-5 shadow-sm transition-all hover:-translate-y-0.5 ${colors[accent]}`}>
      <p className="text-3xl font-black m-0 tracking-tight">{value ?? "–"}</p>
      <p className="text-[10px] font-bold mt-2 uppercase tracking-widest opacity-60">
        {label}
      </p>
    </div>
  );
}

// ✅ Certificate Viewer Modal
function CertificateModal({ url, onClose }) {
  if (!url) return null;

  return (
    <div className="fixed inset-0 bg-[#0B0F19]/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#0B0F19]/90 backdrop-blur-2xl rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] border border-white/10 w-full max-w-4xl max-h-[90vh] flex flex-col font-sans box-border">
        <div className="px-8 py-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 m-0 tracking-tight">Certificate</h2>
          <button onClick={onClose} className="text-[10px] font-bold text-white/40 uppercase tracking-widest bg-transparent border-none cursor-pointer hover:text-white transition-colors outline-none p-0">
            Close
          </button>
        </div>
        <div className="flex-1 overflow-auto bg-[#0B0F19]/50">
          {url?.endsWith('.pdf') ? (
            <iframe
              src={url}
              className="w-full h-full border-none"
              title="Certificate PDF"
            />
          ) : (
            <div className="flex items-center justify-center p-8">
              <img
                src={url}
                alt="Certificate"
                className="max-w-full max-h-full object-contain rounded-xl"
              />
            </div>
          )}
        </div>
        <div className="px-8 py-6 border-t border-white/10 flex gap-4 justify-end bg-white/5">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 border-none rounded-xl hover:shadow-[0_4px_15px_-3px_rgba(217,70,239,0.5)] cursor-pointer transition-all uppercase tracking-widest outline-none"
          >
            Download
          </a>
          <button
            onClick={onClose}
            className="px-6 py-3 text-xs font-bold text-white/80 bg-transparent border border-white/10 rounded-xl hover:bg-white/10 transition-colors cursor-pointer uppercase tracking-widest outline-none"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

const TABS_BY_ROLE = {
  student: ["Overview", "Profile", "Applications", "Reports", "History", "Organization"],
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
    <div className="fixed inset-0 bg-[#0B0F19]/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#0B0F19]/90 backdrop-blur-2xl rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] border border-white/10 w-full max-w-lg max-h-[90vh] flex flex-col font-sans box-border">
        <div className="px-8 py-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 m-0 tracking-tight">Edit Profile</h2>
          <button onClick={onClose} className="text-[10px] font-bold text-white/40 uppercase tracking-widest bg-transparent border-none cursor-pointer hover:text-white transition-colors outline-none p-0">
            Close
          </button>
        </div>
        <div className="px-8 py-6 overflow-y-auto space-y-5 flex-1">
          {fields.map(({ key, label, type }) => (
            <div key={key} className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-white/60 uppercase tracking-widest">{label}</label>
              {type === "textarea" ? (
                <textarea
                  value={form[key] || ""}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3.5 text-sm text-white bg-white/5 border border-white/10 rounded-xl outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 resize-y transition-all"
                />
              ) : (
                <input
                  type={type}
                  value={form[key] || ""}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="w-full px-4 py-3.5 text-sm text-white bg-white/5 border border-white/10 rounded-xl outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                />
              )}
            </div>
          ))}
        </div>
        <div className="px-8 py-6 border-t border-white/10 flex gap-4 justify-end bg-white/5">
          <button onClick={onClose} className="px-6 py-3 text-xs font-bold text-white/80 bg-transparent border border-white/10 rounded-xl hover:bg-white/10 transition-colors cursor-pointer uppercase tracking-widest outline-none">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-6 py-3 text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 border-none rounded-xl hover:shadow-[0_4px_15px_-3px_rgba(217,70,239,0.5)] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer transition-all uppercase tracking-widest outline-none hover:-translate-y-0.5"
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
      const errorMsg = err?.response?.data?.message || err?.message || "Failed to load user";
      console.error("Fetch error:", { status: err?.response?.status, message: errorMsg, error: err });
      showToast(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setActionLoading((p) => ({ ...p, status: true }));
    try {
      const res = await api.patch(`/admin/users/${id}/status`, { accountStatus: newStatus });
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
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <Spinner size={10} />
          <p className="text-fuchsia-400 font-bold tracking-widest uppercase text-[10px] animate-pulse m-0">
            Loading User
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center font-sans">
        <div className="bg-[#0B0F19]/50 border border-white/10 rounded-3xl p-12 text-center shadow-inner">
          <p className="text-white/40 m-0 text-base font-medium">
            User not found.
          </p>
        </div>
      </div>
    );
  }

  const { user, profile, organization, analytics, applications, history, related } = data;
  const tabs = TABS_BY_ROLE[user.role] || ["Overview"];

  return (
    <div className="min-h-screen bg-[#0B0F19] font-sans box-border text-white selection:bg-fuchsia-500/30 selection:text-fuchsia-200 pb-12">
      
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-6 py-4 rounded-xl shadow-2xl text-[10px] font-bold tracking-widest uppercase border backdrop-blur-md transition-all
          ${toast.type === "error" ? "bg-red-500/20 text-red-300 border-red-500/30" : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"}`}>
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

      {/* ✅ Certificate Modal */}
      {showCertificateUrl && (
        <CertificateModal
          url={showCertificateUrl}
          onClose={() => setShowCertificateUrl(null)}
        />
      )}

      <div className="bg-white/5 backdrop-blur-xl border-b border-white/10 pt-8 px-4 md:px-8 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto">
          
          <button
            onClick={() => navigate("/admin/users")}
            className="flex items-center text-[10px] font-bold text-white/40 uppercase tracking-widest hover:text-fuchsia-400 mb-6 transition-colors bg-transparent border-none cursor-pointer p-0 outline-none"
          >
            Back to Users
          </button>

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-white font-black text-2xl shadow-lg shrink-0 border border-white/20">
                {user.email[0].toUpperCase()}
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/80 m-0 leading-none tracking-tight">
                    {profile?.fullName || profile?.name || user.email}
                  </h1>
                  <Badge value={user.role} map={ROLE_COLORS} />
                  <Badge value={user.accountStatus} map={STATUS_COLORS} />
                </div>
                <p className="text-sm text-fuchsia-400 font-bold tracking-wide m-0 leading-none">{user.email}</p>
                <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                  <span>ID: {user._id}</span>
                  <span className="opacity-30">|</span>
                  <span>Joined {new Date(user.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
                  {user.lastLoginAt && (
                    <>
                      <span className="opacity-30">|</span>
                      <span>Seen {new Date(user.lastLoginAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
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
                  className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer transition-all outline-none hover:-translate-y-0.5"
                >
                  {actionLoading.invite ? <Spinner size={3} /> : "Resend Invite"}
                </button>
              )}

              {user.accountStatus !== "deleted" && (
                <>
                  {user.accountStatus === "active" ? (
                    <button
                      onClick={() => handleStatusChange("suspended")}
                      disabled={actionLoading.status}
                      className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500/20 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer transition-all outline-none hover:-translate-y-0.5"
                    >
                      {actionLoading.status ? <Spinner size={3} /> : "Suspend User"}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStatusChange("active")}
                      disabled={actionLoading.status}
                      className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl hover:bg-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer transition-all outline-none hover:-translate-y-0.5 shadow-sm"
                    >
                      {actionLoading.status ? <Spinner size={3} /> : "Activate User"}
                    </button>
                  )}
                </>
              )}

              {user.role !== "admin" && (
                <button
                  onClick={() => setShowEditModal(true)}
                  className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest bg-gradient-to-r from-violet-600 to-fuchsia-600 border-none text-white rounded-xl hover:shadow-[0_4px_15px_-3px_rgba(217,70,239,0.5)] flex items-center gap-2 cursor-pointer transition-all outline-none hover:-translate-y-0.5"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {tabs.map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActiveTab(i)}
                className={`px-6 py-4 text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap border-none cursor-pointer outline-none rounded-t-xl ${
                  activeTab === i
                    ? "bg-white/5 text-fuchsia-400 border-b-2 border-fuchsia-500 shadow-[inset_0_-1px_0_rgba(217,70,239,1)]"
                    : "bg-transparent text-white/40 hover:text-white/80 hover:bg-white/5"
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
          <div className="flex flex-col gap-8">
            {analytics && Object.keys(analytics).length > 0 && (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
                <h2 className="text-[11px] font-bold text-violet-400 uppercase tracking-widest mb-6 m-0 border-b border-white/10 pb-4">Analytics Dashboard</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {user.role === "student" && analytics && <>
                    <StatCard label="Total Apps" value={analytics.totalApplications} accent="dark" />
                    <StatCard label="Applied" value={analytics.applied} accent="primary" />
                    <StatCard label="Shortlisted" value={analytics.shortlisted} accent="secondary" />
                    <StatCard label="Selected" value={analytics.selected} accent="accent" />
                    <StatCard label="Ongoing" value={analytics.ongoing} accent="primary" />
                    <StatCard label="Completed" value={analytics.completed} accent="light" />
                    <StatCard label="Rejected" value={analytics.rejected} accent="primary" />
                  </>}
                  {user.role === "faculty" && analytics && <>
                    <StatCard label="College Students" value={analytics.students} accent="accent" />
                    <StatCard label="College Faculty" value={analytics.faculty} accent="secondary" />
                  </>}
                  {user.role === "mentor" && analytics && <>
                    <StatCard label="Ongoing Interns" value={analytics.ongoing} accent="dark" />
                    <StatCard label="Completed Interns" value={analytics.completed} accent="accent" />
                  </>}
                  {user.role === "college" && analytics && <>
                    <StatCard label="Total Faculty" value={analytics.faculty} accent="secondary" />
                    <StatCard label="Total Students" value={analytics.students} accent="light" />
                  </>}
                  {user.role === "company" && analytics && <>
                    <StatCard label="Total Internships" value={analytics.totalInternships} accent="dark" />
                    <StatCard label="Total Applications" value={analytics.totalApplications} accent="accent" />
                  </>}
                  {user.role === "admin" && <>
                    <StatCard label="Admin User" value="–" accent="primary" />
                  </>}
                </div>
              </div>
            )}

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
              <Section title="Account System Details">
                <div className="flex flex-col">
                  <InfoRow label="System ID" value={user._id} />
                  <InfoRow label="Email Address" value={user.email} />
                  <InfoRow label="Assigned Role" value={user.role} />
                  <InfoRow label="Account State" value={user.accountStatus} />
                  <InfoRow label="Email Verified" value={user.isVerified ? "Yes" : "No"} />
                  <InfoRow label="Profile Setup" value={user.isRegistered ? "Completed" : "Pending"} />
                  <InfoRow label="Ref Model" value={user.referenceModel} />
                  <InfoRow label="Creation Date" value={new Date(user.createdAt).toLocaleString("en-IN")} />
                  {user.lastLoginAt && <InfoRow label="Last Active" value={new Date(user.lastLoginAt).toLocaleString("en-IN")} />}
                </div>
              </Section>
            </div>
          </div>
        )}

        {tabs[activeTab] === "Profile" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
              <Section title="Profile Data">
                {profile ? (
                  <div className="flex flex-col">
                    {["fullName", "name"].map((k) => profile[k] && <InfoRow key={k} label="Name" value={profile[k]} />)}
                    <InfoRow label="Designation" value={profile.designation} />
                    <InfoRow label="Department" value={profile.department} />
                    <InfoRow label="Phone" value={profile.phoneNo || profile.phone} />
                    <InfoRow label="Biography" value={profile.bio} />
                    <InfoRow label="Employee ID" value={profile.employeeId} />
                    <InfoRow label="PRN Number" value={profile.prn} />
                    <InfoRow label="Course" value={profile.courseName} />
                    <InfoRow label="Specialization" value={profile.specialization} />
                    <InfoRow label="Joining Year" value={profile.joiningYear} />
                    <InfoRow label="Profile Status" value={profile.profileStatus} />
                    <InfoRow label="Current Status" value={profile.status} />
                    {profile.website && <InfoRow label="Website" value={profile.website} />}
                    {profile.industry && <InfoRow label="Industry" value={profile.industry} />}
                    {profile.companySize && <InfoRow label="Company Size" value={profile.companySize} />}
                    {profile.address && <InfoRow label="Address" value={profile.address} />}
                    {profile.description && <InfoRow label="Description" value={profile.description} />}
                    {profile.skills?.length > 0 && (
                      <div className="flex flex-col sm:flex-row sm:items-start gap-1.5 sm:gap-4 py-4 border-b border-white/5 last:border-0">
                        <span className="text-[10px] text-white/40 sm:w-40 shrink-0 font-bold uppercase tracking-widest mt-1">Skills</span>
                        <div className="flex flex-wrap gap-2">
                          {profile.skills.map((s) => (
                            <span key={s} className="px-3 py-1.5 bg-white/5 border border-white/10 text-white/80 text-[11px] font-bold rounded-lg tracking-wide">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="py-8 text-sm text-white/40 font-medium text-center m-0">No profile data available.</p>
                )}
              </Section>
            </div>

            <div className="flex flex-col gap-6">
              {user.role === "college" && profile?.courses?.length > 0 && (
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
                  <Section title="Offered Courses">
                    <div className="flex flex-col gap-4">
                      {profile.courses.map((c, i) => (
                        <div key={i} className="p-5 bg-[#0B0F19]/30 border border-white/5 rounded-2xl transition-all hover:border-white/10">
                          <p className="text-base font-bold text-white/90 m-0">{c.name}</p>
                          <p className="text-[10px] font-bold text-fuchsia-400 uppercase tracking-widest mt-1 mb-0">{c.durationYears} years</p>
                          {c.specializations?.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/5">
                              {c.specializations.map((s) => (
                                <span key={s} className="px-3 py-1.5 bg-white/5 border border-white/10 text-white/80 text-[10px] font-bold rounded-lg uppercase tracking-widest">{s}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </Section>
                </div>
              )}

              {(user.role === "company" || user.role === "mentor") && organization?.locations?.length > 0 && (
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
                  <Section title="Registered Locations">
                    <div className="flex flex-col gap-3">
                      {organization.locations.map((l, i) => (
                        <div key={i} className="p-4 bg-[#0B0F19]/30 border border-white/5 rounded-xl text-sm font-bold text-white/80 transition-all hover:border-white/10">
                          {[l.city, l.state, l.country].filter(Boolean).join(", ")}
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
          <div className="flex flex-col gap-5">
            {applications?.length === 0 ? (
              <div className="bg-[#0B0F19]/50 border border-white/10 rounded-3xl py-16 text-center text-white/40 shadow-inner">
                <p className="font-medium text-base m-0">No applications on record</p>
              </div>
            ) : (
              applications.map((app) => (
                <div key={app._id} className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 md:p-8 hover:border-white/20 hover:-translate-y-1 transition-all duration-300 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
                  <div className="flex flex-col md:flex-row items-start justify-between gap-5">
                    <div className="flex-1 flex flex-col gap-3">
                      <div className="flex items-center gap-4 flex-wrap">
                        <h3 className="font-bold text-white/90 text-xl m-0">{app.internship?.title}</h3>
                        <Badge value={app.status} map={APP_STATUS_COLORS} />
                      </div>
                      <p className="text-sm font-bold text-fuchsia-400 uppercase tracking-widest m-0">{app.company?.name}</p>
                      
                      <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">
                        <span>Applied: {new Date(app.appliedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
                        {app.internship?.mode && (
                          <>
                            <span className="opacity-30">|</span>
                            <span>{app.internship.mode}</span>
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
                            <span className="text-emerald-400">₹{app.internship.stipendAmount.toLocaleString()}</span>
                          </>
                        )}
                      </div>

                      {(app.mentor || app.faculty) && (
                        <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-white/5">
                          {app.mentor && (
                            <p className="text-xs text-white/80 m-0"><span className="font-bold text-white/40 uppercase tracking-widest mr-2">Mentor:</span> {app.mentor.fullName}</p>
                          )}
                          {app.faculty && (
                            <p className="text-xs text-white/80 m-0"><span className="font-bold text-white/40 uppercase tracking-widest mr-2">Faculty:</span> {app.faculty.fullName}</p>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col md:items-end gap-2 text-[10px] font-bold uppercase tracking-widest text-white/80 bg-[#0B0F19]/30 border border-white/5 p-5 rounded-2xl w-full md:w-auto">
                      {app.internshipStartDate && <p className="m-0"><span className="text-violet-400 mr-2">Start:</span> {new Date(app.internshipStartDate).toLocaleDateString("en-IN")}</p>}
                      {app.internshipEndDate && <p className="m-0"><span className="text-violet-400 mr-2">End:</span> {new Date(app.internshipEndDate).toLocaleDateString("en-IN")}</p>}
                      {app.evaluationScore != null && (
                        <p className="font-black text-fuchsia-400 text-sm mt-3 mb-0 bg-fuchsia-500/10 px-3 py-1.5 rounded-lg border border-fuchsia-500/20 w-max">Score: {app.evaluationScore}/100</p>
                      )}
                      {/* ✅ NEW: Certificate Button */}
                      {app.certificate && (
                        <button
                          onClick={() => setShowCertificateUrl(app.certificate)}
                          className="mt-3 px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-lg hover:bg-emerald-500/30 transition-colors cursor-pointer whitespace-nowrap"
                        >
                          View Certificate
                        </button>
                      )}
                    </div>
                  </div>
                  {(app.mentorFeedback || app.facultyFeedback) && (
                    <div className="mt-6 pt-5 border-t border-white/10 flex flex-col gap-3">
                      {app.mentorFeedback && <p className="text-xs leading-relaxed text-white/70 m-0 bg-white/5 p-4 rounded-xl border border-white/5"><span className="font-bold text-fuchsia-400 uppercase tracking-widest block mb-1">Mentor Feedback:</span> {app.mentorFeedback}</p>}
                      {app.facultyFeedback && <p className="text-xs leading-relaxed text-white/70 m-0 bg-white/5 p-4 rounded-xl border border-white/5"><span className="font-bold text-violet-400 uppercase tracking-widest block mb-1">Faculty Feedback:</span> {app.facultyFeedback}</p>}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {tabs[activeTab] === "Reports" && (
          <div className="flex flex-col gap-5">
            {!applications?.length ? (
              <div className="bg-[#0B0F19]/50 border border-white/10 rounded-3xl py-16 text-center text-white/40 shadow-inner">
                <p className="font-medium text-base m-0">No internship reports</p>
              </div>
            ) : (
              applications.map((app) => 
                app.report ? (
                  <div key={app._id} className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 md:p-8 hover:border-white/20 transition-all duration-300 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-3 flex-wrap justify-between">
                        <h3 className="font-bold text-white/90 text-lg m-0">{app.internship?.title} - {app.company?.name}</h3>
                        <Badge value={app.report.status} map={STATUS_COLORS} />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-[#0B0F19]/30 border border-white/5 p-4 rounded-xl">
                          <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest m-0">Total Tasks</p>
                          <p className="text-2xl font-black text-fuchsia-400 m-0 mt-2">{app.report.totalTasks}</p>
                        </div>
                        <div className="bg-[#0B0F19]/30 border border-white/5 p-4 rounded-xl">
                          <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest m-0">Completed</p>
                          <p className="text-2xl font-black text-emerald-400 m-0 mt-2">{app.report.tasksCompleted}</p>
                        </div>
                        <div className="bg-[#0B0F19]/30 border border-white/5 p-4 rounded-xl">
                          <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest m-0">Completion Rate</p>
                          <p className="text-2xl font-black text-violet-400 m-0 mt-2">{app.report.completionRate}%</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-[#0B0F19]/30 border border-white/5 p-3 rounded-xl">
                          <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest m-0">Mentor Score</p>
                          <p className="text-xl font-black text-fuchsia-400 m-0 mt-1">{app.report.mentorScore}/10</p>
                        </div>
                        <div className="bg-[#0B0F19]/30 border border-white/5 p-3 rounded-xl">
                          <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest m-0">Faculty Score</p>
                          <p className="text-xl font-black text-violet-400 m-0 mt-1">{app.report.facultyScore}/10</p>
                        </div>
                      </div>

                      {app.report.technologies?.length > 0 && (
                        <div className="bg-[#0B0F19]/30 border border-white/5 p-4 rounded-xl">
                          <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest m-0 mb-2">Technologies</p>
                          <div className="flex flex-wrap gap-2">
                            {app.report.technologies.map((tech) => (
                              <span key={tech} className="px-3 py-1.5 bg-violet-500/20 border border-violet-500/30 text-violet-300 text-[10px] font-bold rounded-lg">{tech}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {app.report.facultyRemarks && (
                        <div className="bg-[#0B0F19]/30 border border-white/5 p-4 rounded-xl">
                          <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest m-0 mb-2">Faculty Remarks</p>
                          <p className="text-sm text-white/80 m-0">{app.report.facultyRemarks}</p>
                        </div>
                      )}

                      {app.report.reportUrl && (
                        <a 
                          href={app.report.reportUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl hover:shadow-[0_4px_15px_-3px_rgba(217,70,239,0.5)] transition-all text-center cursor-pointer"
                        >
                          View Full Report
                        </a>
                      )}
                    </div>
                  </div>
                ) : null
              )
            )}
          </div>
        )}

        {tabs[activeTab] === "History" && (
          <div className="flex flex-col gap-5">
            {history?.length === 0 ? (
              <div className="bg-[#0B0F19]/50 border border-white/10 rounded-3xl py-16 text-center text-white/40 shadow-inner">
                <p className="font-medium text-base m-0">No academic history</p>
              </div>
            ) : (
              history.map((h) => (
                <div key={h._id} className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 md:p-8 hover:border-white/20 hover:-translate-y-1 transition-all duration-300 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-5 border-b border-white/10 pb-5">
                    <h3 className="font-bold text-white/90 text-xl m-0">{h.college?.name}</h3>
                    <Badge value={h.status} map={{ active: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30", ended: "bg-white/5 text-white/50 border border-white/10" }} />
                  </div>
                  <div className="flex flex-col gap-2.5 text-sm text-white/80">
                    {h.courseName && <p className="font-bold text-fuchsia-400 m-0">{h.courseName}{h.specialization ? ` — ${h.specialization}` : ""}</p>}
                    <p className="font-bold text-[10px] uppercase tracking-widest text-white/40 m-0">{new Date(h.startDate).toLocaleDateString("en-IN")} → {h.endDate ? new Date(h.endDate).toLocaleDateString("en-IN") : "Present"}</p>
                    {h.college?.address && <p className="opacity-60 m-0 text-xs mt-1">{h.college.address}</p>}
                    {h.remarks && <p className="italic bg-[#0B0F19]/50 p-4 rounded-xl border border-white/5 mt-3 mb-0 text-xs text-white/60">{h.remarks}</p>}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tabs[activeTab] === "Employment" && (
          <div className="flex flex-col gap-5">
            {history?.length === 0 ? (
              <div className="bg-[#0B0F19]/50 border border-white/10 rounded-3xl py-16 text-center text-white/40 shadow-inner">
                <p className="font-medium text-base m-0">No employment history</p>
              </div>
            ) : (
              history.map((h) => (
                <div key={h._id} className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 md:p-8 hover:border-white/20 hover:-translate-y-1 transition-all duration-300 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-5 border-b border-white/10 pb-5">
                    <div className="flex flex-col gap-1.5">
                      <h3 className="font-bold text-white/90 text-xl m-0">
                        {h.college?.name || h.company?.name}
                      </h3>
                      {(h.designation || h.department) && (
                        <p className="text-[11px] font-bold text-fuchsia-400 uppercase tracking-widest m-0">{[h.designation, h.department].filter(Boolean).join(" · ")}</p>
                      )}
                    </div>
                    <Badge value={h.status} map={{ active: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30", ended: "bg-white/5 text-white/50 border border-white/10" }} />
                  </div>
                  <div className="flex flex-col gap-2.5 text-sm text-white/80 font-medium">
                    {h.courseName && <p className="m-0 text-violet-400 font-bold">{h.courseName}{h.specialization ? ` — ${h.specialization}` : ""}</p>}
                    <p className="font-bold text-[10px] uppercase tracking-widest text-white/40 m-0">{new Date(h.startDate).toLocaleDateString("en-IN")} → {h.endDate ? new Date(h.endDate).toLocaleDateString("en-IN") : "Present"}</p>
                    {h.remarks && <p className="italic bg-[#0B0F19]/50 p-4 rounded-xl border border-white/5 mt-3 mb-0 text-xs text-white/60">{h.remarks}</p>}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tabs[activeTab] === "Organization" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {organization ? (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
                <Section title={user.role === "student" || user.role === "faculty" ? "College Details" : "Company Details"}>
                  <div className="flex flex-col">
                    <InfoRow label="Name" value={organization.name} />
                    <InfoRow label="Website" value={organization.website} />
                    <InfoRow label="Email Domain" value={organization.emailDomain} />
                    <InfoRow label="Industry" value={organization.industry} />
                    <InfoRow label="Address" value={organization.address} />
                    {organization.locations?.map((l, i) => (
                      <InfoRow key={i} label={`Location ${i + 1}`} value={[l.city, l.state, l.country].filter(Boolean).join(", ")} />
                    ))}
                    <InfoRow label="System Status" value={organization.status} />
                  </div>
                </Section>
              </div>
            ) : (
              <div className="bg-[#0B0F19]/50 border border-white/10 rounded-3xl py-16 text-center text-white/40 shadow-inner col-span-full">
                <p className="font-medium text-base m-0">Not assigned to any organization</p>
              </div>
            )}
          </div>
        )}

        {/* ✅ Students Tab for Faculty */}
        {tabs[activeTab] === "Students" && user.role === "faculty" && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] overflow-hidden">
            {!related?.students?.length ? (
              <div className="py-16 text-center text-white/40 font-medium text-base bg-[#0B0F19]/30">
                <p className="m-0">No students in your college</p>
              </div>
            ) : (
              <div className="overflow-x-auto bg-[#0B0F19]/30 shadow-inner">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="px-6 py-5 text-[10px] font-bold text-violet-400 uppercase tracking-widest">Name</th>
                      <th className="px-6 py-5 text-[10px] font-bold text-violet-400 uppercase tracking-widest">PRN</th>
                      <th className="px-6 py-5 text-[10px] font-bold text-violet-400 uppercase tracking-widest">Course</th>
                      <th className="px-6 py-5 text-[10px] font-bold text-violet-400 uppercase tracking-widest">Specialization</th>
                      <th className="px-6 py-5 text-[10px] font-bold text-violet-400 uppercase tracking-widest">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {related.students.map((student) => (
                      <tr key={student._id} className="hover:bg-white/5 transition-colors duration-300 group">
                        <td className="px-6 py-5 text-sm font-bold text-white/90 group-hover:text-fuchsia-300">{student.fullName}</td>
                        <td className="px-6 py-5 text-xs text-white/60 font-mono">{student.prn || "–"}</td>
                        <td className="px-6 py-5 text-xs text-violet-400 font-bold tracking-wide">{student.courseName || "–"}</td>
                        <td className="px-6 py-5 text-xs text-white/70">{student.specialization || "–"}</td>
                        <td className="px-6 py-5"><Badge value={student.status} map={STATUS_COLORS} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ✅ Mentors Tab for Company */}
        {tabs[activeTab] === "Mentors" && user.role === "company" && (
          <div className="flex flex-col gap-5">
            {!related?.mentors?.length ? (
              <div className="bg-[#0B0F19]/50 border border-white/10 rounded-3xl py-16 text-center text-white/40 shadow-inner">
                <p className="font-medium text-base m-0">No mentors assigned to your company</p>
              </div>
            ) : (
              related.mentors.map((mentor) => (
                <div key={mentor._id} className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 md:p-8 hover:border-white/20 transition-all duration-300 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex flex-col gap-2">
                      <p className="font-bold text-white/90 text-lg m-0">{mentor.fullName}</p>
                      <p className="text-xs text-fuchsia-400 font-bold uppercase tracking-widest m-0">{mentor.designation || "–"}</p>
                      {mentor.department && <p className="text-xs text-white/60 m-0">{mentor.department}</p>}
                    </div>
                    <Badge value={mentor.status} map={STATUS_COLORS} />
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ✅ Internships Tab for Company */}
        {tabs[activeTab] === "Internships" && user.role === "company" && (
          <div className="flex flex-col gap-5">
            {!related?.internships?.length ? (
              <div className="bg-[#0B0F19]/50 border border-white/10 rounded-3xl py-16 text-center text-white/40 shadow-inner">
                <p className="font-medium text-base m-0">No internships posted</p>
              </div>
            ) : (
              related.internships.map((internship) => (
                <div key={internship._id} className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 md:p-8 hover:border-white/20 transition-all duration-300 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
                  <div className="flex flex-col gap-6">
                    {/* Internship Header */}
                    <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                      <div className="flex-1 flex flex-col gap-3">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="font-bold text-white/90 text-xl m-0">{internship.title}</h3>
                          <Badge value={internship.status} map={{ open: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30", closed: "bg-red-500/10 text-red-400 border border-red-500/20" }} />
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold text-white/50 uppercase tracking-widest bg-[#0B0F19]/50 p-3.5 rounded-xl border border-white/5 w-max">
                          {internship.mode && <span className="text-violet-400">{internship.mode}</span>}
                          {internship.durationMonths && (
                            <>
                              <span className="opacity-30">|</span>
                              <span className="text-white/80">{internship.durationMonths} mos</span>
                            </>
                          )}
                          {internship.stipendType && (
                            <>
                              <span className="opacity-30">|</span>
                              <span className="text-emerald-400">{internship.stipendType}</span>
                            </>
                          )}
                          {internship.stipendAmount && (
                            <>
                              <span className="opacity-30">|</span>
                              <span className="text-emerald-400">₹{internship.stipendAmount.toLocaleString()}/mo</span>
                            </>
                          )}
                        </div>

                        {internship.skillsRequired?.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {internship.skillsRequired.map((s) => (
                              <span key={s} className="px-3 py-1.5 bg-white/5 border border-white/10 text-white/80 text-[10px] font-bold uppercase tracking-widest rounded-lg">{s}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="bg-[#0B0F19]/30 border border-fuchsia-500/20 p-5 rounded-2xl text-center min-w-[140px] shadow-[0_0_15px_rgba(217,70,239,0.1)]">
                        <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-violet-400 to-fuchsia-400 m-0">{internship.applicantCount}</p>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-2 mb-0">Applicants</p>
                      </div>
                    </div>

                    {/* ✅ Applicants List */}
                    {internship.applicants?.length > 0 && (
                      <div className="border-t border-white/10 pt-6">
                        <h4 className="text-[11px] font-bold text-violet-400 uppercase tracking-widest mb-4">Applicants</h4>
                        <div className="space-y-3">
                          {internship.applicants.map((applicant) => (
                            <div key={applicant._id} className="bg-[#0B0F19]/30 border border-white/5 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                              <div className="flex-1">
                                <p className="font-bold text-white/90 m-0">{applicant.student?.fullName}</p>
                                <p className="text-[10px] text-white/50 font-mono m-0 mt-1">{applicant.student?.prn}</p>
                              </div>
                              <div className="flex items-center gap-3">
                                <Badge value={applicant.status} map={APP_STATUS_COLORS} />
                                <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest whitespace-nowrap">
                                  {new Date(applicant.appliedAt).toLocaleDateString("en-IN")}
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

        {/* ✅ Students Tab for College */}
        {tabs[activeTab] === "Students" && user.role === "college" && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] overflow-hidden">
            {!related?.students?.length ? (
              <div className="py-16 text-center text-white/40 font-medium text-base bg-[#0B0F19]/30">No students found</div>
            ) : (
              <div className="overflow-x-auto bg-[#0B0F19]/30 shadow-inner">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="px-6 py-5 text-[10px] font-bold text-violet-400 uppercase tracking-widest">Name</th>
                      <th className="px-6 py-5 text-[10px] font-bold text-violet-400 uppercase tracking-widest">PRN</th>
                      <th className="px-6 py-5 text-[10px] font-bold text-violet-400 uppercase tracking-widest">Course</th>
                      <th className="px-6 py-5 text-[10px] font-bold text-violet-400 uppercase tracking-widest">Specialization</th>
                      <th className="px-6 py-5 text-[10px] font-bold text-violet-400 uppercase tracking-widest">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {related.students.map((student) => (
                      <tr key={student._id} className="hover:bg-white/5 transition-colors duration-300 group">
                        <td className="px-6 py-5 text-sm font-bold text-white/90 group-hover:text-fuchsia-300">{student.fullName}</td>
                        <td className="px-6 py-5 text-xs text-white/60 font-mono">{student.prn || "–"}</td>
                        <td className="px-6 py-5 text-xs text-violet-400 font-bold tracking-wide">{student.courseName || "–"}</td>
                        <td className="px-6 py-5 text-xs text-white/70">{student.specialization || "–"}</td>
                        <td className="px-6 py-5"><Badge value={student.status} map={STATUS_COLORS} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ✅ Faculty Tab for College */}
        {tabs[activeTab] === "Faculty" && user.role === "college" && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] overflow-hidden">
            {!related?.faculty?.length ? (
              <div className="py-16 text-center text-white/40 font-medium text-base bg-[#0B0F19]/30">No faculty found</div>
            ) : (
              <div className="overflow-x-auto bg-[#0B0F19]/30 shadow-inner">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="px-6 py-5 text-[10px] font-bold text-violet-400 uppercase tracking-widest">Name</th>
                      <th className="px-6 py-5 text-[10px] font-bold text-violet-400 uppercase tracking-widest">Designation</th>
                      <th className="px-6 py-5 text-[10px] font-bold text-violet-400 uppercase tracking-widest">Department</th>
                      <th className="px-6 py-5 text-[10px] font-bold text-violet-400 uppercase tracking-widest">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {related.faculty.map((member) => (
                      <tr key={member._id} className="hover:bg-white/5 transition-colors duration-300 group">
                        <td className="px-6 py-5 text-sm font-bold text-white/90 group-hover:text-fuchsia-300">{member.fullName}</td>
                        <td className="px-6 py-5 text-xs text-white/70">{member.designation || "–"}</td>
                        <td className="px-6 py-5 text-xs text-violet-400 font-bold tracking-wide">{member.department || "–"}</td>
                        <td className="px-6 py-5"><Badge value={member.status} map={STATUS_COLORS} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ✅ Interns Tab for Mentor */}
        {tabs[activeTab] === "Interns" && user.role === "mentor" && (
          <div className="flex flex-col gap-5">
            {applications?.length === 0 ? (
              <div className="bg-[#0B0F19]/50 border border-white/10 rounded-3xl py-16 text-center text-white/40 shadow-inner">
                <p className="font-medium text-base m-0">No interns assigned</p>
              </div>
            ) : (
              applications.map((app) => (
                <div key={app._id} className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 md:p-8 hover:border-white/20 hover:-translate-y-1 transition-all duration-300 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
                  <div className="flex flex-col md:flex-row items-start justify-between gap-5">
                    <div className="flex flex-col gap-2">
                      <p className="font-bold text-white/90 text-xl m-0">
                        {app.student?.fullName}
                      </p>
                      {app.student && (
                        <p className="text-[10px] font-bold text-fuchsia-400 uppercase tracking-widest m-0 bg-[#0B0F19]/50 px-3 py-1.5 rounded-lg border border-white/5 w-max mt-1">
                          {app.student?.prn}
                        </p>
                      )}
                      <p className="text-sm font-medium text-white/70 m-0 mt-2">{app.internship?.title}</p>
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