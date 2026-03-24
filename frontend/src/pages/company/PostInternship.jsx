import React, { useState } from "react";
import API from "../../api/api";

export default function PostInternship() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    startDate: "",
    applicationDeadline: "",
    durationMonths: 1,
    mode: "remote",
    skillsRequired: "",
    locations: "",
    positions: 1,
    maxApplicants: "",
    stipendType: "paid",
    stipendAmount: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        ...form,
        durationMonths: Number(form.durationMonths),
        positions: Number(form.positions),
        maxApplicants: form.maxApplicants ? Number(form.maxApplicants) : null,
        skillsRequired: form.skillsRequired
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        locations:
          form.mode === "remote"
            ? []
            : form.locations
                .split(",")
                .map((l) => l.trim())
                .filter(Boolean),
      };

      const res = await API.post("/internships", payload);
      setSuccess(res.data.message || "Internship listing published.");

      setForm({
        title: "",
        description: "",
        startDate: "",
        applicationDeadline: "",
        durationMonths: 1,
        mode: "remote",
        skillsRequired: "",
        locations: "",
        positions: 1,
        maxApplicants: "",
        stipendType: "paid",
        stipendAmount: "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to post internship.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#333] flex flex-col font-sans pb-10">
      <main className="max-w-4xl mx-auto w-full p-4 md:p-6 flex flex-col gap-6">
        <div className="bg-[#fff] border border-[#e5e5e5] p-6 md:p-10 rounded-[20px] shadow-sm">
          <header className="mb-8 border-b border-[#e5e5e5] pb-4">
            <h2 className="text-[23px] font-black m-0 tracking-tight text-[#333]">
              Post Internship
            </h2>
            <p className="text-[13px] font-bold text-[#333] opacity-60 m-0 mt-1 uppercase tracking-widest">
              Create New Opportunity
            </p>
          </header>

          {error && (
            <div className="mb-6 px-4 py-3 text-[12px] font-bold text-[#cc0000] bg-[#fff] border border-[#cc0000] rounded-[14px] uppercase tracking-widest text-center">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 px-4 py-3 text-[12px] font-bold text-[#008000] bg-[#fff] border border-[#008000] rounded-[14px] uppercase tracking-widest text-center">
              {success}
            </div>
          )}

          <form
            className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5"
            onSubmit={handleSubmit}
          >
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                Internship Title
              </label>
              <input
                name="title"
                placeholder="Software Development Intern"
                value={form.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 text-[13px] text-[#333] bg-[#fff] border border-[#333] rounded-[14px] outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                Job Description
              </label>
              <textarea
                name="description"
                placeholder="Roles, responsibilities and expectations..."
                value={form.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-3 text-[13px] text-[#333] bg-[#fff] border border-[#333] rounded-[14px] outline-none resize-y"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 text-[13px] text-[#333] bg-[#fff] border border-[#333] rounded-[14px] outline-none uppercase"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                Application Deadline
              </label>
              <input
                type="date"
                name="applicationDeadline"
                value={form.applicationDeadline}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 text-[13px] text-[#333] bg-[#fff] border border-[#333] rounded-[14px] outline-none uppercase"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                Duration
              </label>
              <select
                name="durationMonths"
                value={form.durationMonths}
                onChange={handleChange}
                className="w-full px-4 py-3 text-[13px] text-[#333] bg-[#fff] border border-[#333] rounded-[14px] outline-none cursor-pointer appearance-none"
              >
                {[1, 2, 3, 4, 5, 6, 9, 12].map((m) => (
                  <option key={m} value={m}>
                    {m} Month{m > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                Mode
              </label>
              <select
                name="mode"
                value={form.mode}
                onChange={handleChange}
                className="w-full px-4 py-3 text-[13px] text-[#333] bg-[#fff] border border-[#333] rounded-[14px] outline-none cursor-pointer appearance-none"
              >
                <option value="remote">Remote</option>
                <option value="onsite">Onsite</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            {form.mode !== "remote" && (
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                  Office Locations
                </label>
                <input
                  name="locations"
                  placeholder="Pune, Mumbai, Bangalore"
                  value={form.locations}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 text-[13px] text-[#333] bg-[#fff] border border-[#333] rounded-[14px] outline-none"
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                Required Skills
              </label>
              <input
                name="skillsRequired"
                placeholder="React, Node.js, SQL"
                value={form.skillsRequired}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 text-[13px] text-[#333] bg-[#fff] border border-[#333] rounded-[14px] outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                Positions
              </label>
              <input
                type="number"
                name="positions"
                min="1"
                value={form.positions}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 text-[13px] text-[#333] bg-[#fff] border border-[#333] rounded-[14px] outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                Max Applicants
              </label>
              <input
                type="number"
                name="maxApplicants"
                min="1"
                placeholder="Optional"
                value={form.maxApplicants}
                onChange={handleChange}
                className="w-full px-4 py-3 text-[13px] text-[#333] bg-[#fff] border border-[#333] rounded-[14px] outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                Stipend Type
              </label>
              <select
                name="stipendType"
                value={form.stipendType}
                onChange={handleChange}
                className="w-full px-4 py-3 text-[13px] text-[#333] bg-[#fff] border border-[#333] rounded-[14px] outline-none cursor-pointer appearance-none"
              >
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
                <option value="performance_based">Performance Based</option>
              </select>
            </div>

            {form.stipendType === "paid" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                  Monthly Stipend (INR)
                </label>
                <input
                  type="number"
                  name="stipendAmount"
                  min="0"
                  placeholder="15000"
                  value={form.stipendAmount}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 text-[13px] text-[#333] bg-[#fff] border border-[#333] rounded-[14px] outline-none"
                />
              </div>
            )}

            <div className="md:col-span-2 pt-6 border-t border-[#f9f9f9] mt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 text-[14px] font-black text-[#fff] bg-[#111] border-none rounded-[14px] cursor-pointer hover:opacity-80 transition-opacity disabled:opacity-30 uppercase tracking-widest flex items-center justify-center gap-2"
              >
                {loading ? "Processing..." : "Publish Internship"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
