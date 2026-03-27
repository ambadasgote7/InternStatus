import React, { useEffect, useState } from "react";
import API from "../../api/api";

export default function InviteFaculty() {
  const [form, setForm] = useState({
    email: "",
    fullName: "",
    courseName: "",
    specialization: "",
    designation: "",
  });

  const [courses, setCourses] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await API.get("/college/courses");
      setCourses(res.data?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleCourseChange = (e) => {
    const courseName = e.target.value;
    const selected = courses.find((c) => c.name === courseName);

    setForm({
      ...form,
      courseName,
      specialization: "",
    });

    setSpecializations(selected?.specializations || []);
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await API.post("/users/faculty/invite", form);
      alert("Faculty invited successfully");
      setForm({
        email: "",
        fullName: "",
        courseName: "",
        specialization: "",
        designation: "",
      });
      setSpecializations([]);
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Expert UI Theme Classes (Using your palette)
  const inputClass =
    "w-full px-5 py-4 text-[14px] font-bold text-[#2D3436] bg-[#F5F6FA] border-2 border-transparent rounded-[20px] outline-none transition-all duration-300 focus:border-[#6C5CE7] focus:bg-white placeholder:text-[#2D3436]/40";
  
  const labelClass =
    "text-[12px] font-black text-[#2D3436] opacity-60 uppercase tracking-[0.15em] mb-2 ml-1 block";

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-[#FFFFFF] p-4 md:p-8 font-['Nunito'] box-border text-[#2D3436]">
      <div className="w-full max-w-xl bg-white p-8 md:p-12 rounded-[40px] shadow-2xl shadow-[#6C5CE7]/10 border border-[#F5F6FA] box-border animate-in fade-in zoom-in duration-500">
        
        <div className="text-center mb-12">
          <div className="w-16 h-1.5 bg-[#6C5CE7] rounded-full mx-auto mb-6"></div>
          <h2 className="text-[32px] font-black text-[#2D3436] m-0 tracking-tight">
            Invite Faculty
          </h2>
          <p className="text-[12px] font-black text-[#6C5CE7] opacity-80 uppercase tracking-[0.25em] mt-3 m-0">
            Institution Management
          </p>
        </div>

        <form onSubmit={submit} className="space-y-6">
          <div className="animate-in slide-in-from-bottom-2 duration-300 delay-75">
            <label className={labelClass}>Email Address</label>
            <input
              name="email"
              type="email"
              placeholder="professor@college.edu"
              value={form.email}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>

          <div className="animate-in slide-in-from-bottom-2 duration-300 delay-100">
            <label className={labelClass}>Full Name</label>
            <input
              name="fullName"
              placeholder="Dr. Jane Doe"
              value={form.fullName}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-2 duration-300 delay-150">
            <div className="relative">
              <label className={labelClass}>Course</label>
              <select
                name="courseName"
                value={form.courseName}
                onChange={handleCourseChange}
                className={`${inputClass} appearance-none cursor-pointer pr-10`}
              >
                <option value="">Select Course</option>
                {courses.map((c) => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
              <div className="absolute right-5 top-[52px] pointer-events-none text-[#6C5CE7] text-xs">▼</div>
            </div>

            <div className="relative">
              <label className={labelClass}>Specialization</label>
              <select
                name="specialization"
                value={form.specialization}
                onChange={handleChange}
                disabled={!form.courseName}
                className={`${inputClass} appearance-none cursor-pointer pr-10 disabled:opacity-40 disabled:bg-[#F5F6FA] disabled:cursor-not-allowed`}
              >
                <option value="">Select Specialization</option>
                {specializations.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <div className="absolute right-5 top-[52px] pointer-events-none text-[#6C5CE7] text-xs">▼</div>
            </div>
          </div>

          <div className="animate-in slide-in-from-bottom-2 duration-300 delay-200">
            <label className={labelClass}>Designation</label>
            <input
              name="designation"
              placeholder="Associate Professor"
              value={form.designation}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div className="pt-6 animate-in slide-in-from-bottom-2 duration-300 delay-300">
            <button
              disabled={loading}
              className="w-full py-5 text-[14px] font-black text-white bg-[#6C5CE7] rounded-[22px] shadow-xl shadow-[#6C5CE7]/20 hover:shadow-[#6C5CE7]/40 hover:-translate-y-1 active:translate-y-0 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-[0.2em] flex items-center justify-center gap-3 outline-none"
            >
              {loading && (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              )}
              {loading ? "Processing..." : "Invite Faculty"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}