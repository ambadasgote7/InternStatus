import React, { useEffect, useState } from "react";
import API from "../../api/api";

export default function MentorProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await API.get("/mentor/profile");
      setProfile(res.data.data);
    } catch {
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

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
        phoneNo: profile.phoneNo || "",
        designation: profile.designation || "",
        department: profile.department || "",
        bio: profile.bio || "",
      };

      const res = await API.patch("/mentor/profile", payload);
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
      <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center font-sans">
        <p className="text-[14px] font-bold text-[#333] animate-pulse m-0">
          Syncing Profile Data...
        </p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center p-4 font-sans">
        <div className="bg-[#fff] border-2 border-dashed border-[#e5e5e5] rounded-[20px] p-10 text-center">
          <p className="text-[13px] font-bold text-[#333] opacity-60 m-0">
            No profile data found
          </p>
        </div>
      </div>
    );
  }

  const initials = (profile.fullName || "M")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#333] font-sans pb-10">
      <main className="max-w-6xl mx-auto w-full px-4 md:px-6 py-6 flex flex-col md:flex-row gap-6">
        <aside className="w-full md:w-[320px] flex-shrink-0 flex flex-col gap-6">
          <div className="bg-[#fff] border border-[#e5e5e5] rounded-[20px] p-6 shadow-sm flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-[#f9f9f9] border border-[#e5e5e5] rounded-full flex items-center justify-center text-[28px] font-black mb-4">
              {initials}
            </div>
            <h2 className="text-[20px] font-black m-0 leading-tight mb-1">
              {profile.fullName}
            </h2>
            <p className="text-[12px] font-bold opacity-50 uppercase tracking-widest m-0 mb-4">
              {profile.company?.name || "Corporate Associate"}
            </p>
            <span className="px-3 py-1 rounded-[10px] text-[10px] font-black uppercase tracking-widest bg-[#f9f9f9] border border-[#008000] text-[#008000]">
              {profile.profileStatus || "Active"}
            </span>
          </div>

          <div className="bg-[#fff] border border-[#e5e5e5] rounded-[20px] p-5 shadow-sm flex flex-col gap-4">
            <div className="flex flex-col border-b border-[#f9f9f9] pb-2 last:pb-0 last:border-0">
              <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">
                Employee Identifier
              </span>
              <span className="text-[13px] font-mono font-bold text-[#111]">
                {profile.employeeId || "—"}
              </span>
            </div>
          </div>
        </aside>

        <section className="flex-1">
          <div className="bg-[#fff] border border-[#e5e5e5] rounded-[20px] p-6 md:p-8 shadow-sm">
            <header className="mb-8 border-b border-[#e5e5e5] pb-4">
              <h1 className="text-[23px] font-black m-0 tracking-tight">
                Edit Professional Profile
              </h1>
              <p className="text-[13px] font-bold opacity-60 m-0 mt-1 uppercase tracking-widest">
                Credentials & Bio Management
              </p>
            </header>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {error && (
                <div className="px-4 py-3 text-[12px] font-bold text-[#cc0000] bg-[#fff] border border-[#cc0000] rounded-[14px] uppercase tracking-widest text-center">
                  {error}
                </div>
              )}
              {success && (
                <div className="px-4 py-3 text-[12px] font-bold text-[#008000] bg-[#fff] border border-[#008000] rounded-[14px] uppercase tracking-widest text-center">
                  {success}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold opacity-60 uppercase tracking-widest">
                    Phone Number
                  </label>
                  <input
                    name="phoneNo"
                    value={profile.phoneNo || ""}
                    onChange={handleChange}
                    placeholder="+91"
                    className="w-full px-4 py-3 text-[13px] text-[#333] bg-[#fff] border border-[#333] rounded-[14px] outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold opacity-60 uppercase tracking-widest">
                    Designation
                  </label>
                  <input
                    name="designation"
                    value={profile.designation || ""}
                    onChange={handleChange}
                    placeholder="e.g. Lead Engineer"
                    className="w-full px-4 py-3 text-[13px] text-[#333] bg-[#fff] border border-[#333] rounded-[14px] outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold opacity-60 uppercase tracking-widest">
                  Department
                </label>
                <input
                  name="department"
                  value={profile.department || ""}
                  onChange={handleChange}
                  placeholder="e.g. Core Systems"
                  className="w-full px-4 py-3 text-[13px] text-[#333] bg-[#fff] border border-[#333] rounded-[14px] outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold opacity-60 uppercase tracking-widest">
                  Professional Bio
                </label>
                <textarea
                  name="bio"
                  rows={4}
                  value={profile.bio || ""}
                  onChange={handleChange}
                  placeholder="Tell us about your expertise..."
                  className="w-full px-4 py-3 text-[13px] text-[#333] bg-[#fff] border border-[#333] rounded-[14px] outline-none resize-none"
                />
              </div>

              <div className="pt-6 border-t border-[#f9f9f9] flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full md:w-auto px-12 py-3.5 text-[13px] font-bold text-[#fff] bg-[#111] border-none rounded-[14px] cursor-pointer hover:opacity-80 transition-opacity disabled:opacity-30 uppercase tracking-widest"
                >
                  {saving ? "Saving Changes..." : "Save Profile"}
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
