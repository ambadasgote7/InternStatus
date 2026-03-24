import React, { useEffect, useState } from "react";
import API from "../../api/api";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    durationYears: "",
    credits: "",
  });
  const [specializationInput, setSpecializationInput] = useState("");
  const [specializations, setSpecializations] = useState([]);
  const [editingCourse, setEditingCourse] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await API.get("/college/courses");
      setCourses(res.data?.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const addSpecialization = () => {
    const value = specializationInput.trim();
    if (!value) return;
    if (specializations.includes(value)) {
      setSpecializationInput("");
      return;
    }
    setSpecializations((prev) => [...prev, value]);
    setSpecializationInput("");
  };

  const removeSpecialization = (i) => {
    setSpecializations((prev) => prev.filter((_, idx) => idx !== i));
  };

  const validateForm = () => {
    if (!form.name.trim()) return "Course name is required";
    if (!form.durationYears || Number(form.durationYears) <= 0)
      return "Valid duration required";
    if (
      form.credits === "" ||
      isNaN(Number(form.credits)) ||
      Number(form.credits) < 0
    )
      return "Valid credits required";
    return null;
  };

  const handleSubmit = async () => {
    const error = validateForm();
    if (error) return alert(error);

    const payload = {
      name: form.name.trim(),
      durationYears: Number(form.durationYears),
      credits: Number(form.credits),
      specializations,
    };

    try {
      if (editingCourse) {
        if (!editingCourse?._id) return alert("Invalid course selected");
        await API.patch(`/college/courses/${editingCourse._id}`, payload);
      } else {
        await API.post("/college/courses", payload);
      }
      resetForm();
      fetchCourses();
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  const deleteCourse = async (id) => {
    if (!id) return alert("Invalid course id");
    if (!window.confirm("Delete this course?")) return;
    try {
      await API.delete(`/college/courses/${id}`);
      fetchCourses();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  const startEdit = (c) => {
    if (!c?._id) return alert("Invalid course data");
    setEditingCourse(c);
    setForm({
      name: c.name || "",
      durationYears: c.durationYears || "",
      credits: c.credits ?? "",
    });
    setSpecializations(c.specializations || []);
  };

  const resetForm = () => {
    setForm({ name: "", durationYears: "", credits: "" });
    setSpecializations([]);
    setEditingCourse(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center">
        <p className="text-[14px] font-bold text-[#333] animate-pulse">
          Loading Course Data...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#333] font-sans pb-10">
      <main className="max-w-7xl mx-auto w-full px-4 md:px-6 py-6 flex flex-col gap-6">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#e5e5e5] pb-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-[23px] font-black text-[#333] m-0 tracking-tight leading-tight">
              Course Catalog
            </h1>
            <p className="text-[13px] font-bold text-[#333] opacity-60 m-0 uppercase tracking-widest">
              Manage Institutional Academic Programs
            </p>
          </div>
        </header>

        <div className="bg-[#fff] border border-[#e5e5e5] p-6 rounded-[20px] shadow-sm">
          <h2 className="text-[11px] font-bold text-[#333] opacity-50 m-0 uppercase tracking-widest border-b border-[#f9f9f9] pb-3 mb-5">
            {editingCourse ? "Edit Course Details" : "Add New Program"}
          </h2>

          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5 md:col-span-1">
                <label className="text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                  Name
                </label>
                <input
                  placeholder="e.g. Bachelor of Technology"
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full px-4 py-3 text-[13px] text-[#333] bg-[#fff] border border-[#333] rounded-[14px] outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                  Duration (Years)
                </label>
                <input
                  type="number"
                  placeholder="4"
                  value={form.durationYears}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      durationYears: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 text-[13px] text-[#333] bg-[#fff] border border-[#333] rounded-[14px] outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                  Total Credits
                </label>
                <input
                  type="number"
                  placeholder="160"
                  value={form.credits}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, credits: e.target.value }))
                  }
                  className="w-full px-4 py-3 text-[13px] text-[#333] bg-[#fff] border border-[#333] rounded-[14px] outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                Specializations
              </label>
              <div className="flex gap-2">
                <input
                  placeholder="Type a field (e.g. Data Science)"
                  value={specializationInput}
                  onChange={(e) => setSpecializationInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addSpecialization()}
                  className="flex-1 px-4 py-3 text-[13px] text-[#333] bg-[#fff] border border-[#333] rounded-[14px] outline-none"
                />
                <button
                  onClick={addSpecialization}
                  className="px-6 py-3 bg-[#f9f9f9] border border-[#333] text-[#333] text-[12px] font-bold rounded-[14px] hover:bg-[#333] hover:text-[#fff] transition-all cursor-pointer uppercase tracking-widest"
                >
                  Add
                </button>
              </div>

              <div className="flex gap-1.5 mt-1 flex-wrap">
                {specializations.map((s, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center px-3 py-1.5 bg-[#f9f9f9] border border-[#e5e5e5] text-[11px] font-bold rounded-[10px] uppercase tracking-wider"
                  >
                    {s}
                    <button
                      onClick={() => removeSpecialization(i)}
                      className="ml-2 text-[#cc0000] border-none bg-transparent cursor-pointer font-black hover:scale-110 transition-transform"
                    >
                      Delete
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-[#f9f9f9]">
              <button
                onClick={handleSubmit}
                className="px-8 py-3.5 bg-[#111] text-[#fff] text-[13px] font-bold rounded-[14px] hover:opacity-80 transition-opacity cursor-pointer uppercase tracking-widest"
              >
                {editingCourse ? "Update Course" : "Save Course"}
              </button>

              {editingCourse && (
                <button
                  onClick={resetForm}
                  className="px-8 py-3.5 bg-[#fff] border border-[#e5e5e5] text-[#333] text-[13px] font-bold rounded-[14px] hover:bg-[#f9f9f9] transition-colors cursor-pointer uppercase tracking-widest"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="bg-[#fff] border border-[#e5e5e5] rounded-[20px] shadow-sm overflow-hidden box-border">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead className="bg-[#f9f9f9] border-b border-[#e5e5e5]">
                <tr>
                  <th className="px-5 py-3 text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                    Course Name
                  </th>
                  <th className="px-5 py-3 text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                    Duration
                  </th>
                  <th className="px-5 py-3 text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest text-center">
                    Credits
                  </th>
                  <th className="px-5 py-3 text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                    Specializations
                  </th>
                  <th className="px-5 py-3 text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e5e5]">
                {courses.map((c) => (
                  <tr
                    key={c._id}
                    className="hover:bg-[#f9f9f9] transition-colors duration-200"
                  >
                    <td className="px-5 py-3 text-[13px] font-bold text-[#333]">
                      {c.name}
                    </td>
                    <td className="px-5 py-3 text-[13px] font-bold text-[#333] opacity-70">
                      {c.durationYears}y Program
                    </td>
                    <td className="px-5 py-3 text-[13px] font-black text-[#111] text-center">
                      {c.credits}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1 max-w-xs md:max-w-md">
                        {c.specializations?.map((spec, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-bold bg-[#f9f9f9] px-2 py-0.5 rounded-[6px] border border-[#e5e5e5]"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => startEdit(c)}
                          className="px-3 py-1.5 text-[11px] font-bold text-[#333] bg-[#f9f9f9] border border-[#e5e5e5] rounded-[10px] hover:border-[#333] transition-colors cursor-pointer uppercase tracking-widest"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteCourse(c._id)}
                          className="px-3 py-1.5 text-[11px] font-bold text-[#cc0000] bg-[#fff] border border-[#cc0000] rounded-[10px] hover:bg-[#cc0000] hover:text-[#fff] transition-colors cursor-pointer uppercase tracking-widest"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
