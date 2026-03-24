import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api/api";

export default function EditInternship() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locked, setLocked] = useState(false);
  const [closed, setClosed] = useState(false);
  const [selectedCount, setSelectedCount] = useState(0);

  const [form, setForm] = useState({
    title: "",
    description: "",
    positions: "",
    maxApplicants: "",
    applicationDeadline: "",
    mode: "remote",
    stipendType: "paid",
    stipendAmount: "",
  });

  const fetchInternship = async () => {
    try {
      const res = await API.get(`/internships/${id}`);
      const data = res.data.data;

      setForm({
        title: data.title || "",
        description: data.description || "",
        positions: data.positions || "",
        maxApplicants: data.maxApplicants || "",
        applicationDeadline: data.applicationDeadline
          ? data.applicationDeadline.substring(0, 10)
          : "",
        mode: data.mode || "remote",
        stipendType: data.stipendType || "paid",
        stipendAmount: data.stipendAmount || "",
      });

      setSelectedCount(data.selectedCount || 0);

      if (data.applicationsCount > 0) {
        setLocked(true);
      }

      if (data.status === "closed") {
        setClosed(true);
      }
    } catch (err) {
      alert(err.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInternship();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (closed) {
      alert("Cannot edit closed internship");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        ...form,
        positions: Number(form.positions),
        maxApplicants: form.maxApplicants ? Number(form.maxApplicants) : null,
        stipendAmount: form.stipendAmount ? Number(form.stipendAmount) : null,
      };

      await API.patch(`/internships/${id}`, payload);
      alert("Internship updated successfully");
      navigate("/company/internships");
    } catch (err) {
      alert(err.response?.data?.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center">
        <p className="text-[14px] font-bold text-[#333] animate-pulse m-0">
          Loading Details...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#333] font-sans pb-10">
      <main className="max-w-3xl mx-auto w-full px-4 md:px-6 py-6 flex flex-col gap-6">
        <div className="bg-[#fff] border border-[#e5e5e5] p-6 md:p-8 rounded-[20px] shadow-sm">
          <header className="mb-8 border-b border-[#e5e5e5] pb-4">
            <h2 className="text-[23px] font-black m-0 tracking-tight">
              Edit Internship Listing
            </h2>
            <p className="text-[13px] font-bold opacity-60 m-0 mt-1 uppercase tracking-widest">
              Modify Active Opportunity
            </p>
          </header>

          {closed && (
            <div className="mb-6 px-4 py-3 text-[12px] font-bold text-[#cc0000] bg-[#fff] border border-[#cc0000] rounded-[14px] uppercase tracking-widest leading-relaxed">
              This internship is closed and cannot be edited.
            </div>
          )}

          {locked && !closed && (
            <div className="mb-6 px-4 py-3 text-[12px] font-bold text-[#b45309] bg-[#fff] border border-[#b45309] rounded-[14px] uppercase tracking-widest leading-relaxed">
              Applications active. Restricted fields: Positions must be at least{" "}
              {selectedCount}. Stipend cannot be decreased.
            </div>
          )}

          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold opacity-60 uppercase tracking-widest">
                Title
              </label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                disabled={closed}
                className="w-full px-4 py-3 text-[13px] text-[#333] bg-[#fff] border border-[#333] rounded-[14px] outline-none disabled:opacity-40"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold opacity-60 uppercase tracking-widest">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                disabled={closed}
                rows={4}
                className="w-full px-4 py-3 text-[13px] text-[#333] bg-[#fff] border border-[#333] rounded-[14px] outline-none resize-y disabled:opacity-40"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold opacity-60 uppercase tracking-widest">
                  Positions
                </label>
                <input
                  type="number"
                  min={selectedCount || 1}
                  name="positions"
                  value={form.positions}
                  onChange={handleChange}
                  disabled={closed}
                  className="w-full px-4 py-3 text-[13px] text-[#333] bg-[#fff] border border-[#333] rounded-[14px] outline-none disabled:opacity-40"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold opacity-60 uppercase tracking-widest">
                  Max Applicants
                </label>
                <input
                  type="number"
                  min="1"
                  name="maxApplicants"
                  value={form.maxApplicants}
                  onChange={handleChange}
                  disabled={closed}
                  className="w-full px-4 py-3 text-[13px] text-[#333] bg-[#fff] border border-[#333] rounded-[14px] outline-none disabled:opacity-40"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold opacity-60 uppercase tracking-widest">
                Application Deadline
              </label>
              <input
                type="date"
                name="applicationDeadline"
                value={form.applicationDeadline}
                onChange={handleChange}
                disabled={closed}
                className="w-full px-4 py-3 text-[13px] text-[#333] bg-[#fff] border border-[#333] rounded-[14px] outline-none disabled:opacity-40 uppercase tracking-widest"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold opacity-60 uppercase tracking-widest">
                  Mode
                </label>
                <select
                  name="mode"
                  value={form.mode}
                  onChange={handleChange}
                  disabled={locked || closed}
                  className="w-full px-4 py-3 text-[13px] text-[#333] bg-[#fff] border border-[#333] rounded-[14px] outline-none cursor-pointer disabled:opacity-40 appearance-none"
                >
                  <option value="remote">Remote</option>
                  <option value="onsite">Onsite</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold opacity-60 uppercase tracking-widest">
                  Stipend Type
                </label>
                <select
                  name="stipendType"
                  value={form.stipendType}
                  onChange={handleChange}
                  disabled={locked || closed}
                  className="w-full px-4 py-3 text-[13px] text-[#333] bg-[#fff] border border-[#333] rounded-[14px] outline-none cursor-pointer disabled:opacity-40 appearance-none"
                >
                  <option value="paid">Paid</option>
                  <option value="unpaid">Unpaid</option>
                  <option value="performance_based">Performance Based</option>
                </select>
              </div>
            </div>

            {form.stipendType === "paid" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold opacity-60 uppercase tracking-widest">
                  Stipend Amount (INR/mo)
                </label>
                <input
                  type="number"
                  min="0"
                  name="stipendAmount"
                  value={form.stipendAmount}
                  onChange={handleChange}
                  disabled={closed}
                  className="w-full px-4 py-3 text-[13px] text-[#333] bg-[#fff] border border-[#333] rounded-[14px] outline-none disabled:opacity-40"
                />
              </div>
            )}

            <div className="pt-6 border-t border-[#f9f9f9] mt-2 flex justify-between items-center">
              <button
                type="button"
                onClick={() => navigate("/company/internships")}
                className="px-6 py-3 text-[12px] font-bold text-[#333] bg-[#f9f9f9] border border-[#e5e5e5] rounded-[14px] hover:bg-[#e5e5e5] transition-colors uppercase tracking-widest cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={saving || closed}
                className="px-8 py-3 text-[12px] font-black text-[#fff] bg-[#111] border-none rounded-[14px] cursor-pointer hover:opacity-80 transition-opacity disabled:opacity-30 uppercase tracking-widest"
              >
                {saving ? "Processing..." : "Update Listing"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
