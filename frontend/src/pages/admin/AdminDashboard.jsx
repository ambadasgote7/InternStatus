import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../api/api";

export default function AdminDashboard() {
  const { id } = useParams();

  const [college, setCollege] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchCollege();
  }, [id]);

  const fetchCollege = async () => {
    try {
      const res = await API.get(`/college/${id}`);
      setCollege(res.data.data);
    } catch {
      setError("Failed to load college");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCollege((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await API.patch(`/college/${id}`, {
        name: college.name,
        website: college.website,
        phone: college.phone,
        address: college.address,
        description: college.description,
      });
      setCollege(res.data.data);
      setSuccess("College updated successfully!");
    } catch {
      setError("Update failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0B0F19]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-white/10 border-t-fuchsia-500 rounded-full animate-spin"></div>
          <p className="text-fuchsia-400 font-bold tracking-widest uppercase text-[10px] animate-pulse m-0">
            Loading College
          </p>
        </div>
      </div>
    );
  }

  if (!college) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0B0F19]">
        <div className="bg-[#0B0F19]/50 border border-white/10 rounded-3xl p-12 text-center shadow-inner">
          <p className="text-white/40 m-0 text-base font-medium">
            No data found.
          </p>
        </div>
      </div>
    );
  }

  const abbr = (college.name || "C")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#0B0F19] p-4 md:p-8 font-sans text-white selection:bg-fuchsia-500/30 selection:text-fuchsia-200 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-fuchsia-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>

      <div className="relative z-10 max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 md:gap-8">
        <aside className="w-full lg:w-[380px] flex-shrink-0 bg-white/5 backdrop-blur-xl p-6 md:p-8 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] border border-white/10 h-max box-border transition-all duration-300 hover:border-white/20">
          <div className="inline-block px-3 py-1.5 mb-8 text-[10px] font-bold text-violet-300 bg-violet-500/20 border border-violet-500/30 rounded-lg uppercase tracking-widest">
            Admin View
          </div>

          <div className="flex justify-center mb-8 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/30 to-fuchsia-600/30 blur-xl rounded-full scale-110 animate-pulse" />
            <div className="relative w-28 h-28 bg-[#0B0F19] border border-white/10 rounded-full flex items-center justify-center text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-violet-400 to-fuchsia-400 shadow-inner">
              {abbr}
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white/90 text-center mt-0 mb-2 tracking-tight">
            {college.name || "College"}
          </h2>

          {college.website && (
            <div className="text-center mb-8">
              <a
                className="text-xs font-bold text-fuchsia-400 hover:text-fuchsia-300 transition-colors no-underline tracking-wide uppercase"
                href={college.website}
                target="_blank"
                rel="noreferrer"
              >
                {college.website.replace(/^https?:\/\//, "")}
              </a>
            </div>
          )}

          <div className="flex flex-col gap-4 mt-6 pt-6 border-t border-white/10">
            <div className="flex flex-col gap-1.5 bg-[#0B0F19]/30 p-4 rounded-xl border border-white/5">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                College ID
              </span>
              <span className="text-sm font-mono text-white/80 break-all">
                {id}
              </span>
            </div>
            <div className="flex flex-col gap-1.5 bg-[#0B0F19]/30 p-4 rounded-xl border border-white/5">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                Phone
              </span>
              <span className="text-sm font-medium text-white/90">
                {college.phone || "—"}
              </span>
            </div>
            <div className="flex flex-col gap-1.5 bg-[#0B0F19]/30 p-4 rounded-xl border border-white/5">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                Address
              </span>
              <span className="text-sm font-medium text-white/90 leading-relaxed">
                {college.address || "—"}
              </span>
            </div>
          </div>

          {college.description && (
            <div className="mt-6 pt-6 border-t border-white/10 flex flex-col gap-2">
              <span className="text-[10px] font-bold text-fuchsia-400 uppercase tracking-widest">
                About
              </span>
              <p className="text-sm text-white/70 leading-relaxed m-0">
                {college.description}
              </p>
            </div>
          )}
        </aside>

        <main className="flex-1 bg-white/5 backdrop-blur-xl p-6 md:p-10 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] border border-white/10 box-border transition-all duration-300 hover:border-white/20">
          <header className="mb-10 border-b border-white/10 pb-6 flex flex-col gap-2">
            <div className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">
              Admin / Colleges / Edit
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 m-0 tracking-tight">
              Edit College
            </h1>
            <p className="text-sm text-white/40 font-medium m-0">
              Modify this institution's details
            </p>
          </header>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-10">
            {error && (
              <div className="px-5 py-4 text-[11px] font-bold text-white bg-red-500/10 border border-red-500/20 rounded-xl uppercase tracking-widest">
                {error}
              </div>
            )}
            {success && (
              <div className="px-5 py-4 text-[11px] font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-xl uppercase tracking-widest">
                {success}
              </div>
            )}

            <section className="flex flex-col gap-6">
              <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white flex items-center justify-center text-[10px] font-black shadow-lg">
                  01
                </span>
                <h3 className="text-sm font-bold text-white/90 uppercase tracking-widest m-0">
                  Identity
                </h3>
              </div>

              <div className="flex flex-col gap-2">
                <label
                  className="text-[10px] font-bold text-white/60 uppercase tracking-widest"
                  htmlFor="name"
                >
                  College Name
                </label>
                <input
                  id="name"
                  name="name"
                  value={college.name || ""}
                  onChange={handleChange}
                  placeholder="e.g. MIT College of Engineering"
                  required
                  className="w-full px-5 py-4 text-sm text-white bg-[#0B0F19]/50 border border-white/10 rounded-xl outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all placeholder:text-white/20"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label
                    className="text-[10px] font-bold text-white/60 uppercase tracking-widest"
                    htmlFor="website"
                  >
                    Website
                  </label>
                  <input
                    id="website"
                    name="website"
                    value={college.website || ""}
                    onChange={handleChange}
                    placeholder="https://yourcollege.edu"
                    type="url"
                    className="w-full px-5 py-4 text-sm text-white bg-[#0B0F19]/50 border border-white/10 rounded-xl outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all placeholder:text-white/20"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label
                    className="text-[10px] font-bold text-white/60 uppercase tracking-widest"
                    htmlFor="phone"
                  >
                    Phone
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    value={college.phone || ""}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className="w-full px-5 py-4 text-sm text-white bg-[#0B0F19]/50 border border-white/10 rounded-xl outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all placeholder:text-white/20"
                  />
                </div>
              </div>
            </section>

            <section className="flex flex-col gap-6 pt-2">
              <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white flex items-center justify-center text-[10px] font-black shadow-lg">
                  02
                </span>
                <h3 className="text-sm font-bold text-white/90 uppercase tracking-widest m-0">
                  Location
                </h3>
              </div>

              <div className="flex flex-col gap-2">
                <label
                  className="text-[10px] font-bold text-white/60 uppercase tracking-widest"
                  htmlFor="address"
                >
                  Address
                </label>
                <input
                  id="address"
                  name="address"
                  value={college.address || ""}
                  onChange={handleChange}
                  placeholder="123 University Road, City, State"
                  className="w-full px-5 py-4 text-sm text-white bg-[#0B0F19]/50 border border-white/10 rounded-xl outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all placeholder:text-white/20"
                />
              </div>
            </section>

            <section className="flex flex-col gap-6 pt-2">
              <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white flex items-center justify-center text-[10px] font-black shadow-lg">
                  03
                </span>
                <h3 className="text-sm font-bold text-white/90 uppercase tracking-widest m-0">
                  About
                </h3>
              </div>

              <div className="flex flex-col gap-2">
                <label
                  className="text-[10px] font-bold text-white/60 uppercase tracking-widest"
                  htmlFor="description"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={5}
                  value={college.description || ""}
                  onChange={handleChange}
                  placeholder="Write a brief description of the institution..."
                  className="w-full px-5 py-4 text-sm text-white bg-[#0B0F19]/50 border border-white/10 rounded-xl outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all resize-y placeholder:text-white/20"
                />
              </div>
            </section>

            <div className="pt-8 border-t border-white/10 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="w-full md:w-auto px-10 py-4 text-[10px] font-bold text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 border-none rounded-xl cursor-pointer transition-all duration-300 hover:shadow-[0_8px_20px_-6px_rgba(217,70,239,0.5)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest flex items-center justify-center gap-3 outline-none"
              >
                {saving && (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                )}
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}