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
      setError("Failed to load. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

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
      setSuccess("Profile updated!");
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Update failed.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-white flex flex-col items-center justify-center font-['Nunito']">
        <div className="w-8 h-8 border-4 border-[#F5F6FA] border-t-[#6C5CE7] rounded-full animate-spin mb-3" />
        <p className="text-[14px] font-bold text-[#2D3436] opacity-50">Loading profile...</p>
      </div>
    );
  }

  const initials = (profile?.fullName || "M")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-white text-[#2D3436] font-['Nunito'] overflow-hidden">
      {/* Added some global CSS to hide the scrollbar for a clean look */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <main className="max-w-6xl mx-auto flex flex-col lg:flex-row h-screen p-4 lg:p-10 gap-8">
        
        {/* LEFT CARD - THIS IS NOW PROPERLY FIXED */}
        <aside className="w-full lg:w-[320px] flex-shrink-0">
          <div className="lg:sticky lg:top-0 bg-[#F5F6FA] rounded-[30px] p-8 flex flex-col items-center text-center border border-white shadow-sm">
            <div className="w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center text-[32px] font-black text-[#6C5CE7] mb-5 border-2 border-white">
              {initials}
            </div>

            <h2 className="text-[22px] font-black mb-1">{profile?.fullName}</h2>
            <p className="text-[12px] font-bold text-[#6C5CE7] uppercase tracking-wider mb-8">
              {profile?.company?.name || "Member"}
            </p>

            <div className="w-full space-y-3">
              <div className="bg-white/60 p-4 rounded-2xl text-left border border-white">
                <span className="text-[10px] font-bold opacity-30 uppercase block">Employee ID</span>
                <span className="text-[14px] font-bold">{profile?.employeeId || "—"}</span>
              </div>
              <div className="bg-white/60 p-4 rounded-2xl text-left border border-white">
                <span className="text-[10px] font-bold opacity-30 uppercase block">Role Status</span>
                <span className="text-[12px] font-black text-[#008000] uppercase">Verified</span>
              </div>
            </div>
          </div>
        </aside>

        {/* RIGHT CARD - THIS WILL SCROLL */}
        <section className="flex-1 h-full overflow-y-auto no-scrollbar pb-20">
          <div className="bg-white border-2 border-[#F5F6FA] rounded-[40px] p-6 lg:p-12 shadow-sm">
            <div className="mb-10">
              <h1 className="text-[30px] font-black tracking-tight">Profile Settings</h1>
              <p className="text-[14px] font-bold opacity-40">Keep your details up to date.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {success && (
                <div className="bg-[#008000]/10 border border-[#008000]/20 text-[#008000] text-[13px] font-bold py-4 px-6 rounded-2xl text-center animate-bounce">
                  {success}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[12px] font-bold opacity-50 ml-1">Mobile Number</label>
                  <input
                    name="phoneNo"
                    value={profile?.phoneNo || ""}
                    onChange={handleChange}
                    className="w-full px-6 py-4 bg-[#F5F6FA] border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#6C5CE7]/30 transition-all font-bold"
                    placeholder="Enter phone"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[12px] font-bold opacity-50 ml-1">Designation</label>
                  <input
                    name="designation"
                    value={profile?.designation || ""}
                    onChange={handleChange}
                    className="w-full px-6 py-4 bg-[#F5F6FA] border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#6C5CE7]/30 transition-all font-bold"
                    placeholder="e.g. Mentor"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[12px] font-bold opacity-50 ml-1">Department</label>
                <input
                  name="department"
                  value={profile?.department || ""}
                  onChange={handleChange}
                  className="w-full px-6 py-4 bg-[#F5F6FA] border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#6C5CE7]/30 transition-all font-bold"
                  placeholder="e.g. Computer Science"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[12px] font-bold opacity-50 ml-1">About Me</label>
                <textarea
                  name="bio"
                  rows={6}
                  value={profile?.bio || ""}
                  onChange={handleChange}
                  className="w-full px-6 py-4 bg-[#F5F6FA] border-2 border-transparent rounded-[24px] outline-none focus:bg-white focus:border-[#6C5CE7]/30 transition-all font-bold resize-none leading-relaxed"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="pt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full md:w-auto px-16 py-4 bg-[#6C5CE7] text-white text-[14px] font-black rounded-2xl shadow-xl shadow-[#6C5CE7]/20 hover:scale-105 transition-transform active:scale-95 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}