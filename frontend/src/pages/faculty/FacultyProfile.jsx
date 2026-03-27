import React, { useEffect, useState } from "react";
import API from "../../api/api";

export default function FacultyProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await API.get("/faculty/profile");
      setProfile(res.data.data);
    } catch {
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const payload = {
        fullName: profile.fullName || "",
        phoneNo: profile.phoneNo || "",
        designation: profile.designation || "",
        bio: profile.bio || "",
      };
      const res = await API.get("/faculty/profile", payload);
      setProfile(res.data.data);
      setSuccess("Profile updated successfully");
    } catch {
      setError("Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] flex items-center justify-center font-['Nunito'] transition-colors duration-300">
        <div className="flex flex-col items-center gap-4 animate-in fade-in duration-700">
          <div className="w-12 h-12 border-4 border-[#F5F6FA] border-t-[#6C5CE7] rounded-full animate-spin"></div>
          <p className="text-[12px] font-black text-[#6C5CE7] animate-pulse m-0 uppercase tracking-widest">
            Loading Faculty Data...
          </p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] flex items-center justify-center p-4 font-['Nunito'] transition-colors duration-300">
        <div className="bg-[#F5F6FA] border-2 border-dashed border-[#A29BFE]/30 rounded-[32px] p-16 text-center animate-in zoom-in duration-500 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <p className="text-[14px] font-black text-[#2D3436] opacity-40 m-0 uppercase tracking-widest">
            No profile data found
          </p>
        </div>
      </div>
    );
  }

  const initials = (profile.fullName || "F")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#2D3436] font-['Nunito'] pb-12 transition-colors duration-500 selection:bg-[#6C5CE7]/20 selection:text-[#6C5CE7]">
      <main className="max-w-6xl mx-auto w-full px-4 md:px-8 py-8 flex flex-col md:flex-row gap-8 lg:gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* ASIDE: Identity Card */}
        <aside className="w-full md:w-[340px] flex-shrink-0 flex flex-col gap-6">
          <div className="bg-[#FFFFFF] border border-[#F5F6FA] rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(108,92,231,0.08)] hover:border-[#6C5CE7]/30 flex flex-col items-center text-center transition-all duration-500 transform hover:-translate-y-1 group">
            <div className="w-28 h-28 bg-[#F5F6FA] border border-transparent rounded-[24px] flex items-center justify-center text-[36px] font-black mb-6 text-[#6C5CE7] shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:rotate-3">
              {initials}
            </div>
            <h2 className="text-[24px] font-black text-[#2D3436] m-0 leading-tight mb-2 group-hover:text-[#6C5CE7] transition-colors duration-300">
              {profile.fullName}
            </h2>
            <p className="text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-widest m-0 bg-[#F5F6FA] px-3 py-1.5 rounded-lg">
              {profile.college?.name || "Institution"}
            </p>
          </div>

          <div className="bg-[#FFFFFF] border border-[#F5F6FA] rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] flex flex-col gap-5 transition-all duration-500">
            <h3 className="text-[11px] font-black text-[#6C5CE7] uppercase tracking-widest m-0 border-b border-[#F5F6FA] pb-3 flex items-center">
              Academic Credentials
            </h3>
            {[
              { label: "Employee ID", value: profile.employeeId },
              { label: "Joining Year", value: profile.joiningYear },
              { label: "Course", value: profile.courseName },
              { label: "Department", value: profile.department },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col p-3 bg-[#F5F6FA] rounded-[16px] border border-transparent hover:border-[#6C5CE7]/20 transition-colors duration-300"
              >
                <span className="text-[10px] font-black text-[#2D3436] opacity-40 uppercase tracking-widest mb-1">
                  {item.label}
                </span>
                <span className="text-[14px] font-bold text-[#2D3436]">
                  {item.value || "—"}
                </span>
              </div>
            ))}
          </div>
        </aside>

        {/* MAIN: Edit Form */}
        <section className="flex-1">
          <div className="bg-[#FFFFFF] border border-[#F5F6FA] rounded-[32px] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] transition-all duration-500">
            <header className="mb-10 border-b border-[#F5F6FA] pb-6">
              <h1 className="text-[28px] md:text-3xl font-black text-[#6C5CE7] m-0 tracking-tight leading-tight">
                Edit Profile
              </h1>
              <p className="text-[12px] font-black text-[#2D3436] opacity-40 m-0 mt-2 uppercase tracking-widest">
                Professional Details Management
              </p>
            </header>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {/* Feedback Alerts */}
              {error && (
                <div className="px-6 py-4 text-[12px] font-black text-rose-600 bg-rose-50 border border-rose-200 rounded-[16px] uppercase tracking-widest text-center shadow-sm animate-in fade-in zoom-in duration-300">
                  {error}
                </div>
              )}
              {success && (
                <div className="px-6 py-4 text-[12px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-[16px] uppercase tracking-widest text-center shadow-sm animate-in fade-in zoom-in duration-300">
                  {success}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-widest px-1">
                    Full Name
                  </label>
                  <input
                    name="fullName"
                    value={profile.fullName || ""}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="w-full px-5 py-4 text-[14px] font-bold text-[#2D3436] bg-[#F5F6FA] border border-transparent rounded-[16px] outline-none transition-all duration-300 focus:bg-[#FFFFFF] focus:border-[#6C5CE7] focus:ring-4 focus:ring-[#6C5CE7]/10 placeholder-[#2D3436] placeholder-opacity-30 shadow-sm"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-widest px-1">
                    Phone Number
                  </label>
                  <input
                    name="phoneNo"
                    value={profile.phoneNo || ""}
                    onChange={handleChange}
                    placeholder="+91"
                    className="w-full px-5 py-4 text-[14px] font-bold text-[#2D3436] bg-[#F5F6FA] border border-transparent rounded-[16px] outline-none transition-all duration-300 focus:bg-[#FFFFFF] focus:border-[#6C5CE7] focus:ring-4 focus:ring-[#6C5CE7]/10 placeholder-[#2D3436] placeholder-opacity-30 shadow-sm"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-widest px-1">
                  Designation
                </label>
                <input
                  name="designation"
                  value={profile.designation || ""}
                  onChange={handleChange}
                  placeholder="e.g. Associate Professor"
                  className="w-full px-5 py-4 text-[14px] font-bold text-[#2D3436] bg-[#F5F6FA] border border-transparent rounded-[16px] outline-none transition-all duration-300 focus:bg-[#FFFFFF] focus:border-[#6C5CE7] focus:ring-4 focus:ring-[#6C5CE7]/10 placeholder-[#2D3436] placeholder-opacity-30 shadow-sm"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-widest px-1">
                  Professional Bio
                </label>
                <textarea
                  name="bio"
                  rows={5}
                  value={profile.bio || ""}
                  onChange={handleChange}
                  placeholder="Summarize your professional background..."
                  className="w-full px-5 py-4 text-[14px] font-bold text-[#2D3436] bg-[#F5F6FA] border border-transparent rounded-[16px] outline-none resize-none transition-all duration-300 focus:bg-[#FFFFFF] focus:border-[#6C5CE7] focus:ring-4 focus:ring-[#6C5CE7]/10 placeholder-[#2D3436] placeholder-opacity-30 shadow-sm"
                />
              </div>

              <div className="pt-8 border-t border-[#F5F6FA] flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full md:w-auto px-10 py-4 text-[12px] font-black text-[#FFFFFF] bg-[#6C5CE7] border-none rounded-[16px] cursor-pointer hover:bg-opacity-90 hover:shadow-[0_10px_25px_-5px_rgba(108,92,231,0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-[0.15em] outline-none shadow-md transform hover:-translate-y-1 active:scale-95 flex items-center justify-center min-w-[200px]"
                >
                  {saving ? (
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 border-2 border-[#FFFFFF]/30 border-t-[#FFFFFF] rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </div>
                  ) : (
                    "Save Profile"
                  )}
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
