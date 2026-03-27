import React, { useEffect, useState } from "react";
import API from "../../api/api";

export default function CollegeProfile() {
  const [college, setCollege] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchCollege();
  }, []);

  // ✅ Auto-hide success message after 2 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess("");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const fetchCollege = async () => {
    try {
      const res = await API.get("/college/profile");
      setCollege(res.data.data);
    } catch {
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCollege((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!college.name?.trim()) return "College name is required";
    if (college.emailDomain && !/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(college.emailDomain)) {
      return "Invalid email domain (e.g. mit.edu)";
    }
    if (college.website && !/^https?:\/\/.+/.test(college.website)) {
      return "Website must start with http:// or https://";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      setSaving(false);
      return;
    }

    try {
      const res = await API.patch("/college/profile", {
        name: college.name,
        website: college.website,
        phone: college.phone,
        address: college.address,
        description: college.description,
        emailDomain: college.emailDomain,
      });

      setCollege(res.data.data);
      setSuccess("Profile updated successfully!");
    } catch {
      setError("Update failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] flex items-center justify-center font-['Nunito']">
        <div className="w-10 h-10 border-4 border-[#6C5CE7] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const abbr = (college?.name || "C")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#2D3436] font-['Nunito'] pb-12 transition-all">
      <div className="max-w-6xl mx-auto p-4 md:p-8 flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Sidebar: FIXED/STICKY CARD */}
        <aside className="w-full lg:w-[320px] lg:sticky lg:top-8 bg-[#F5F6FA] p-8 rounded-[32px] border border-[#F5F6FA] shadow-sm flex flex-col gap-6 animate-in slide-in-from-left duration-700">
          <div className="flex flex-col items-center gap-4">
            <div className="w-24 h-24 bg-[#6C5CE7] rounded-[24px] shadow-lg shadow-[#6C5CE7]/20 flex items-center justify-center text-[32px] font-black text-white">
              {abbr}
            </div>

            <div className="text-center">
              <h2 className="text-[19px] font-extrabold text-[#2D3436] leading-tight">
                {college.name || "College Name"}
              </h2>
              {college.website && (
                <p className="text-[12px] font-bold text-[#6C5CE7] mt-1 break-all opacity-80">
                  {college.website.replace(/^https?:\/\//, "")}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-5 pt-6 border-t border-[#2D3436]/5">
            <div>
              <label className="text-[10px] font-black text-[#6C5CE7] uppercase tracking-widest block mb-1">Phone</label>
              <p className="text-[13px] font-bold">{college.phone || "—"}</p>
            </div>
            <div>
              <label className="text-[10px] font-black text-[#6C5CE7] uppercase tracking-widest block mb-1">Address</label>
              <p className="text-[13px] font-bold leading-relaxed">{college.address || "—"}</p>
            </div>
            <div>
              <label className="text-[10px] font-black text-[#6C5CE7] uppercase tracking-widest block mb-1">Domain</label>
              <p className="text-[13px] font-bold">{college.emailDomain || "—"}</p>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-white p-6 md:p-10 rounded-[32px] border border-[#F5F6FA] shadow-xl shadow-[#2D3436]/5">
          <header className="mb-10">
            <h1 className="text-[28px] font-black text-[#2D3436]">Institution Profile</h1>
            <div className="h-1.5 w-12 bg-[#6C5CE7] rounded-full mt-3"></div>
          </header>

          <form onSubmit={handleSubmit} className="space-y-7">
            {error && (
              <div className="p-4 text-[14px] font-bold text-red-600 bg-red-50 rounded-[18px] border border-red-100 animate-pulse">
                {error}
              </div>
            )}

            {/* ✅ SUCCESS POPUP WITH FADE-OUT ANIMATION */}
            {success && (
              <div className="p-4 text-[14px] font-bold text-green-600 bg-green-50 rounded-[18px] border border-green-100 animate-in fade-in zoom-in duration-300">
                {success}
              </div>
            )}

            <div className="space-y-6">
              <div className="group">
                <label className="text-[13px] font-black mb-2 block group-focus-within:text-[#6C5CE7] transition-colors">Full College Name</label>
                <input
                  name="name"
                  value={college.name || ""}
                  onChange={handleChange}
                  className="w-full p-4 bg-[#F5F6FA] border-2 border-transparent rounded-[20px] outline-none focus:border-[#6C5CE7] focus:bg-white transition-all font-bold text-[#2D3436]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="text-[13px] font-black mb-2 block group-focus-within:text-[#6C5CE7]">Website URL</label>
                  <input
                    name="website"
                    value={college.website || ""}
                    onChange={handleChange}
                    className="w-full p-4 bg-[#F5F6FA] border-2 border-transparent rounded-[20px] outline-none focus:border-[#6C5CE7] focus:bg-white transition-all font-bold"
                  />
                </div>
                <div className="group">
                  <label className="text-[13px] font-black mb-2 block group-focus-within:text-[#6C5CE7]">Contact Number</label>
                  <input
                    name="phone"
                    value={college.phone || ""}
                    onChange={handleChange}
                    className="w-full p-4 bg-[#F5F6FA] border-2 border-transparent rounded-[20px] outline-none focus:border-[#6C5CE7] focus:bg-white transition-all font-bold"
                  />
                </div>
              </div>

              <div className="group">
                <label className="text-[13px] font-black mb-2 block group-focus-within:text-[#6C5CE7]">Authorised Email Domain</label>
                <input
                  name="emailDomain"
                  value={college.emailDomain || ""}
                  onChange={handleChange}
                  placeholder="e.g. nbnscoe.edu.in"
                  className="w-full p-4 bg-[#F5F6FA] border-2 border-transparent rounded-[20px] outline-none focus:border-[#6C5CE7] focus:bg-white transition-all font-bold"
                />
              </div>

              <div className="group">
                <label className="text-[13px] font-black mb-2 block group-focus-within:text-[#6C5CE7]">Physical Address</label>
                <input
                  name="address"
                  value={college.address || ""}
                  onChange={handleChange}
                  className="w-full p-4 bg-[#F5F6FA] border-2 border-transparent rounded-[20px] outline-none focus:border-[#6C5CE7] focus:bg-white transition-all font-bold"
                />
              </div>

              <div className="group">
                <label className="text-[13px] font-black mb-2 block group-focus-within:text-[#6C5CE7]">Institutional Description</label>
                <textarea
                  name="description"
                  value={college.description || ""}
                  onChange={handleChange}
                  rows={6}
                  className="w-full p-5 bg-[#F5F6FA] border-2 border-transparent rounded-[24px] outline-none focus:border-[#6C5CE7] focus:bg-white transition-all font-bold resize-none leading-relaxed"
                />
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={saving}
                className="w-full md:w-auto px-12 py-4 bg-[#6C5CE7] text-white rounded-[22px] font-black text-[16px] shadow-xl shadow-[#6C5CE7]/20 hover:shadow-[#6C5CE7]/40 hover:-translate-y-1 transition-all disabled:opacity-50 active:translate-y-0"
              >
                {saving ? "Updating Profile..." : "Confirm & Save Changes"}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}