import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../api/api";
import AdminNavBar from "../../components/navbars/AdminNavBar"; // Added assuming it fits here

export default function AdminCollegeProfile() {
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
      <div className="min-h-screen bg-[#f9f9f9] flex flex-col">
        <AdminNavBar />
        <div className="flex-grow flex items-center justify-center">
          <p className="text-[14px] font-bold text-[#333] animate-pulse m-0">
            Loading College...
          </p>
        </div>
      </div>
    );
  }

  if (!college) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] flex flex-col">
        <AdminNavBar />
        <div className="flex-grow flex items-center justify-center p-4">
          <div className="bg-[#fff] border-2 border-dashed border-[#e5e5e5] rounded-[20px] p-10 text-center">
            <p className="text-[13px] font-bold text-[#333] opacity-60 m-0">
              College not found.
            </p>
          </div>
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
    <div className="min-h-screen bg-[#f9f9f9] text-[#333] flex flex-col">
      <AdminNavBar />

      <div className="max-w-6xl mx-auto w-full p-4 md:p-6 flex flex-col md:flex-row gap-4">
        {/* Tighter Sidebar Profile Info */}
        <aside className="w-full md:w-[300px] flex-shrink-0 bg-[#fff] p-6 rounded-[20px] shadow-sm border border-[#e5e5e5] h-max flex flex-col gap-4">
          <div className="flex flex-col items-center gap-3">
            <div className="w-20 h-20 bg-[#f9f9f9] border border-[#e5e5e5] rounded-full flex items-center justify-center text-[24px] font-black text-[#333]">
              {abbr}
            </div>

            <div className="text-center">
              <h2 className="text-[18px] font-black text-[#333] m-0 mb-1 leading-tight">
                {college.name || "College"}
              </h2>
              {college.website && (
                <a
                  className="text-[13px] font-bold text-[#111] underline hover:opacity-70 transition-opacity"
                  href={college.website}
                  target="_blank"
                  rel="noreferrer"
                >
                  {college.website.replace(/^https?:\/\//, "")}
                </a>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-4 border-t border-[#e5e5e5]">
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-[#333] opacity-50 uppercase tracking-widest">
                College ID
              </span>
              <span className="text-[13px] font-mono font-bold text-[#333] break-all">
                {id}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-[#333] opacity-50 uppercase tracking-widest">
                Phone
              </span>
              <span className="text-[13px] font-bold text-[#333]">
                {college.phone || "—"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-[#333] opacity-50 uppercase tracking-widest">
                Address
              </span>
              <span className="text-[13px] font-bold text-[#333] leading-snug">
                {college.address || "—"}
              </span>
            </div>
          </div>

          {college.description && (
            <div className="pt-4 border-t border-[#e5e5e5] flex flex-col gap-1">
              <span className="text-[11px] font-bold text-[#333] opacity-50 uppercase tracking-widest">
                About
              </span>
              <p className="text-[13px] text-[#333] leading-snug m-0 opacity-80">
                {college.description}
              </p>
            </div>
          )}
        </aside>

        {/* Tighter Main Form */}
        <main className="flex-1 bg-[#fff] p-6 md:p-8 rounded-[20px] shadow-sm border border-[#e5e5e5]">
          <header className="mb-6 flex flex-col gap-1 border-b border-[#e5e5e5] pb-4">
            <h1 className="text-[23px] font-black text-[#333] m-0 tracking-tight">
              Edit College
            </h1>
            <p className="text-[13px] text-[#333] opacity-70 m-0">
              Modify this institution's details
            </p>
          </header>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="flex flex-col gap-5"
          >
            {error && (
              <div className="px-4 py-3 text-[13px] font-bold text-[#cc0000] bg-[#fff] border border-[#cc0000] rounded-[14px]">
                {error}
              </div>
            )}
            {success && (
              <div className="px-4 py-3 text-[13px] font-bold text-[#008000] bg-[#fff] border border-[#008000] rounded-[14px]">
                {success}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label
                className="text-[13px] font-bold text-[#333]"
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
                className="w-full px-4 py-3 text-[13px] text-[#333] bg-[#fff] border border-[#333] rounded-[14px] outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label
                  className="text-[13px] font-bold text-[#333]"
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
                  className="w-full px-4 py-3 text-[13px] text-[#333] bg-[#fff] border border-[#333] rounded-[14px] outline-none"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label
                  className="text-[13px] font-bold text-[#333]"
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
                  className="w-full px-4 py-3 text-[13px] text-[#333] bg-[#fff] border border-[#333] rounded-[14px] outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                className="text-[13px] font-bold text-[#333]"
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
                className="w-full px-4 py-3 text-[13px] text-[#333] bg-[#fff] border border-[#333] rounded-[14px] outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                className="text-[13px] font-bold text-[#333]"
                htmlFor="description"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={college.description || ""}
                onChange={handleChange}
                placeholder="Write a brief description of the institution..."
                className="w-full px-4 py-3 text-[13px] text-[#333] bg-[#fff] border border-[#333] rounded-[14px] outline-none resize-y"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="w-full md:w-auto px-8 py-3 text-[14px] font-bold text-[#fff] bg-[#111] border-none rounded-[14px] cursor-pointer hover:opacity-80 transition-opacity disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
