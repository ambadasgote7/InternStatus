import React, { useState } from "react";
import API from "../../api/api";

export default function InviteMentor() {
  const [form, setForm] = useState({
    email: "",
    fullName: "",
    designation: "",
    department: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await API.post("/users/mentor/invite", form);
      alert("Mentor invited successfully. Setup email sent.");
      setForm({
        email: "",
        fullName: "",
        designation: "",
        department: "",
      });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to invite mentor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f9f9f9] p-4 md:p-6 font-sans text-[#333]">
      <div className="w-full max-w-lg bg-[#fff] p-6 md:p-10 rounded-[20px] shadow-sm border border-[#e5e5e5] box-border">
        <header className="mb-8 border-b border-[#e5e5e5] pb-4">
          <h2 className="text-[24px] font-black m-0 tracking-tight text-[#333] text-center">
            Invite Mentor
          </h2>
          <p className="text-[13px] font-bold text-[#333] opacity-60 m-0 mt-1 uppercase tracking-widest text-center">
            Organizational Access Request
          </p>
        </header>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
              Full Name
            </label>
            <input
              name="fullName"
              placeholder="Mentor Full Name"
              value={form.fullName}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 text-[13px] text-[#333] bg-[#fff] border border-[#333] rounded-[14px] outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
              Corporate Email
            </label>
            <input
              name="email"
              type="email"
              placeholder="email@company.com"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 text-[13px] text-[#333] bg-[#fff] border border-[#333] rounded-[14px] outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                Designation
              </label>
              <input
                name="designation"
                placeholder="e.g. Senior Lead"
                value={form.designation}
                onChange={handleChange}
                className="w-full px-4 py-3 text-[13px] text-[#333] bg-[#fff] border border-[#333] rounded-[14px] outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                Department
              </label>
              <input
                name="department"
                placeholder="e.g. Engineering"
                value={form.department}
                onChange={handleChange}
                className="w-full px-4 py-3 text-[13px] text-[#333] bg-[#fff] border border-[#333] rounded-[14px] outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#e5e5e5] mt-2">
            <button
              disabled={loading}
              className="w-full py-3.5 text-[12px] font-black text-[#fff] bg-[#111] border-none rounded-[14px] cursor-pointer transition-opacity hover:opacity-80 disabled:opacity-30 uppercase tracking-widest flex items-center justify-center gap-2 outline-none"
            >
              {loading ? "Processing..." : "Send Invitation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
