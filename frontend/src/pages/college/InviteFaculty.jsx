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

  // Reusable theme classes
  const inputClass =
    "w-full px-5 py-4 text-[13px] font-medium text-[#111] bg-[#fff] border border-[#e5e5e5] rounded-[14px] outline-none transition-all duration-300 focus:border-[#111] focus:ring-1 focus:ring-[#111] placeholder:text-[#999]";
  const labelClass =
    "text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-[0.15em] mb-1.5 ml-1 block";

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-[#f9f9f9] p-4 md:p-8 font-sans box-border text-[#111]">
      <div className="w-full max-w-lg bg-[#fff] p-8 md:p-12 rounded-[24px] shadow-sm border border-[#e5e5e5] box-border transition-all duration-300 hover:border-[#ccc]">
        <div className="text-center mb-10">
          <h2 className="text-[28px] font-black text-[#111] m-0 tracking-tighter uppercase">
            Invite Faculty
          </h2>
          <p className="text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-[0.2em] mt-2 m-0">
            Institution Management
          </p>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-5">
          <div>
            <label className={labelClass}>Email Address</label>
            <input
              name="email"
              placeholder="e.g. professor@college.edu"
              value={form.email}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Full Name</label>
            <input
              name="fullName"
              placeholder="e.g. Dr. Jane Doe"
              value={form.fullName}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Course</label>
            <select
              name="courseName"
              value={form.courseName}
              onChange={handleCourseChange}
              className={`${inputClass} appearance-none cursor-pointer`}
            >
              <option value="" className="text-[#999]">
                Select Course
              </option>
              {courses.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Specialization</label>
            <select
              name="specialization"
              value={form.specialization}
              onChange={handleChange}
              disabled={!form.courseName}
              className={`${inputClass} appearance-none cursor-pointer disabled:opacity-50 disabled:bg-[#f9f9f9] disabled:cursor-not-allowed`}
            >
              <option value="" className="text-[#999]">
                Select Specialization
              </option>
              {specializations.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Designation</label>
            <input
              name="designation"
              placeholder="e.g. Associate Professor"
              value={form.designation}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <button
            disabled={loading}
            className="w-full mt-4 py-4 text-[12px] font-black text-[#fff] bg-[#111] border border-[#111] rounded-[14px] cursor-pointer transition-all duration-300 hover:bg-[#333] hover:border-[#333] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-[0.2em] flex items-center justify-center gap-3 outline-none"
          >
            {loading && (
              <span className="w-4 h-4 border-2 border-[#fff]/30 border-t-[#fff] rounded-full animate-spin"></span>
            )}
            {loading ? "Inviting..." : "Invite Faculty"}
          </button>
        </form>
      </div>
    </div>
  );
}
