import React, { useEffect, useState } from "react";
import API from "../../api/api";
import { useNavigate } from "react-router-dom";

export default function FacultyStudents() {
  const COURSE_DURATION = 4;
  const CURRENT_YEAR = new Date().getFullYear();
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingStudent, setEditingStudent] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    courseStartYear: "",
    courseEndYear: "",
    Year: "",
    prn: "",
    abcId: "",
    status: "active",
  });

  const fetchStudents = async () => {
    try {
      const res = await API.get("/faculty/students");
      setStudents(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (form.courseStartYear) {
      setForm((prev) => ({
        ...prev,
        courseEndYear: Number(form.courseStartYear) + COURSE_DURATION,
      }));
    }
  }, [form.courseStartYear]);

  const openEdit = (student) => {
    setEditingStudent(student);
    setForm({
      courseStartYear: student.courseStartYear || "",
      courseEndYear: student.courseEndYear || "",
      Year: student.Year || "",
      prn: student.prn || "",
      abcId: student.abcId || "",
      status: student.status || "active",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    if (!editingStudent) return;
    if (form.abcId && !/^\d{12}$/.test(form.abcId)) {
      alert("ABC ID must be exactly 12 digits");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        courseStartYear: form.courseStartYear
          ? Number(form.courseStartYear)
          : undefined,
        courseEndYear: form.courseEndYear
          ? Number(form.courseEndYear)
          : undefined,
        Year: form.Year ? Number(form.Year) : undefined,
        prn: form.prn || undefined,
        abcId: form.abcId || undefined,
        status: form.status,
      };
      await API.patch(`/faculty/students/${editingStudent._id}`, payload);
      await fetchStudents();
      setEditingStudent(null);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] flex items-center justify-center font-['Nunito'] transition-all duration-300">
        <div className="flex flex-col items-center gap-4 animate-in fade-in duration-700">
          <div className="w-12 h-12 border-4 border-[#F5F6FA] border-t-[#6C5CE7] rounded-full animate-spin"></div>
          <p className="text-[11px] font-black text-[#6C5CE7] animate-pulse m-0 uppercase tracking-widest">
            Syncing Student Records...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#2D3436] font-['Nunito'] pb-12 transition-all duration-500 selection:bg-[#6C5CE7]/20 selection:text-[#6C5CE7]">
      <main className="max-w-7xl mx-auto w-full px-4 md:px-8 lg:px-10 py-8 md:py-10 flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#F5F6FA] pb-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl md:text-5xl font-black text-[#2D3436] m-0 tracking-tighter leading-tight uppercase">
              My Students
            </h1>
            <p className="text-[13px] font-black text-[#6C5CE7] opacity-80 m-0 uppercase tracking-[0.2em]">
              Institutional Enrollment List
            </p>
          </div>
          <div className="text-[11px] font-black text-[#2D3436] bg-[#F5F6FA] border border-transparent px-4 py-2.5 rounded-[12px] uppercase tracking-widest shadow-sm">
            Total Enrolled:{" "}
            <span className="text-[#6C5CE7] ml-1">{students.length}</span>
          </div>
        </header>

        {students.length === 0 ? (
          <div className="bg-[#F5F6FA] border-2 border-dashed border-[#6C5CE7]/20 rounded-[32px] p-16 text-center animate-in zoom-in duration-500">
            <p className="text-[13px] font-black text-[#2D3436] opacity-40 m-0 uppercase tracking-[0.15em]">
              No registered students found.
            </p>
          </div>
        ) : (
          <div className="bg-[#FFFFFF] border border-[#F5F6FA] rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden box-border hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] transition-all duration-500">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead className="bg-[#F5F6FA] bg-opacity-50 border-b border-[#F5F6FA]">
                  <tr>
                    <th className="px-8 py-6 text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-[0.15em]">
                      Name
                    </th>
                    <th className="px-8 py-6 text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-[0.15em]">
                      Course / Spec
                    </th>
                    <th className="px-8 py-6 text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-[0.15em]">
                      PRN
                    </th>
                    <th className="px-8 py-6 text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-[0.15em] text-center">
                      Year
                    </th>
                    <th className="px-8 py-6 text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-[0.15em]">
                      Status
                    </th>
                    <th className="px-8 py-6 text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-[0.15em] text-right">
                      Management
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5F6FA]">
                  {students.map((s) => (
                    <tr
                      key={s._id}
                      className="hover:bg-[#F5F6FA]/40 transition-colors duration-300 group"
                    >
                      <td className="px-8 py-5">
                        <div className="text-[14px] font-black text-[#2D3436] group-hover:text-[#6C5CE7] transition-colors duration-300">
                          {s.fullName}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="text-[14px] font-bold text-[#2D3436] opacity-80">
                          {s.courseName || "—"}
                        </div>
                        <div className="text-[10px] font-black text-[#2D3436] opacity-40 uppercase tracking-widest mt-1">
                          {s.specialization || "—"}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-[13px] font-mono font-bold text-[#2D3436] opacity-60 bg-[#F5F6FA] px-2 py-1 rounded-md group-hover:bg-[#FFFFFF] transition-colors">
                          {s.prn || "—"}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-[14px] font-black text-[#2D3436] text-center">
                        {s.Year || "—"}
                      </td>
                      <td className="px-8 py-5">
                        {/* Status colors preserved as requested, integrated with palette */}
                        <span
                          className={`inline-flex items-center px-3 py-1.5 rounded-[12px] text-[9px] font-black uppercase tracking-widest border shadow-sm transition-all duration-300 ${
                            s.status === "completed"
                              ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                              : s.status === "active"
                                ? "bg-blue-50 text-blue-600 border-blue-200"
                                : s.status === "pending"
                                  ? "bg-rose-50 text-rose-600 border-rose-200"
                                  : "bg-[#FFFFFF] text-[#2D3436] border-[#F5F6FA]"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full mr-2 ${
                              s.status === "completed"
                                ? "bg-emerald-500"
                                : s.status === "active"
                                  ? "bg-blue-500"
                                  : s.status === "pending"
                                    ? "bg-rose-500"
                                    : "bg-[#2D3436] opacity-50"
                            }`}
                          ></span>
                          {s.status}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex gap-3 justify-end">
                          <button
                            onClick={() =>
                              navigate(`/faculty/students/${s._id}`)
                            }
                            className="px-4 py-2 text-[10px] font-black text-[#2D3436] bg-[#FFFFFF] border border-[#F5F6FA] rounded-[12px] hover:border-[#6C5CE7] hover:text-[#6C5CE7] hover:shadow-sm transition-all duration-300 cursor-pointer uppercase tracking-widest outline-none transform hover:-translate-y-0.5"
                          >
                            View
                          </button>
                          <button
                            onClick={() => openEdit(s)}
                            className="px-4 py-2 text-[10px] font-black text-[#FFFFFF] bg-[#6C5CE7] border border-[#6C5CE7] rounded-[12px] hover:bg-opacity-90 hover:shadow-md transition-all duration-300 cursor-pointer uppercase tracking-widest outline-none transform hover:-translate-y-0.5"
                          >
                            Modify
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* EDIT MODAL */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D3436]/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-[#FFFFFF] rounded-[32px] shadow-2xl border border-[#F5F6FA] p-8 box-border flex flex-col gap-6 animate-in zoom-in-95 duration-300">
            <header className="flex items-center justify-between border-b border-[#F5F6FA] pb-5">
              <h3 className="text-[22px] font-black text-[#6C5CE7] m-0 tracking-tight uppercase">
                Update Record
              </h3>
              <button
                onClick={() => setEditingStudent(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-[#F5F6FA] text-[#2D3436] opacity-50 hover:opacity-100 hover:bg-[#2D3436] hover:text-[#FFFFFF] transition-all cursor-pointer border-none outline-none"
                aria-label="Close"
              >
                ✕
              </button>
            </header>

            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-[#2D3436] opacity-50 uppercase tracking-widest px-1">
                  Course Start Year
                </label>
                <div className="relative">
                  <select
                    name="courseStartYear"
                    value={form.courseStartYear}
                    onChange={handleChange}
                    className="w-full px-5 py-3.5 text-[14px] font-bold text-[#2D3436] bg-[#F5F6FA] border border-transparent rounded-[16px] outline-none focus:bg-[#FFFFFF] focus:border-[#6C5CE7] focus:ring-4 focus:ring-[#6C5CE7]/10 transition-all duration-300 appearance-none cursor-pointer"
                  >
                    <option
                      value=""
                      disabled
                      className="text-[#2D3436] opacity-40"
                    >
                      Select Year
                    </option>
                    {Array.from(
                      { length: 10 },
                      (_, i) => CURRENT_YEAR - 5 + i,
                    ).map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-[#2D3436] opacity-40 font-black text-[10px]">
                    ▼
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-[#2D3436] opacity-50 uppercase tracking-widest px-1">
                  Academic Year
                </label>
                <div className="relative">
                  <select
                    name="Year"
                    value={form.Year}
                    onChange={handleChange}
                    className="w-full px-5 py-3.5 text-[14px] font-bold text-[#2D3436] bg-[#F5F6FA] border border-transparent rounded-[16px] outline-none focus:bg-[#FFFFFF] focus:border-[#6C5CE7] focus:ring-4 focus:ring-[#6C5CE7]/10 transition-all duration-300 appearance-none cursor-pointer"
                  >
                    <option
                      value=""
                      disabled
                      className="text-[#2D3436] opacity-40"
                    >
                      Select Stage
                    </option>
                    {[...Array(COURSE_DURATION)].map((_, i) => (
                      <option key={i} value={i + 1}>
                        Year {i + 1}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-[#2D3436] opacity-40 font-black text-[10px]">
                    ▼
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-[#2D3436] opacity-50 uppercase tracking-widest px-1">
                  PRN Number
                </label>
                <input
                  name="prn"
                  value={form.prn}
                  onChange={handleChange}
                  placeholder="Enter PRN"
                  className="w-full px-5 py-3.5 text-[14px] font-mono font-bold text-[#2D3436] bg-[#F5F6FA] border border-transparent rounded-[16px] outline-none focus:bg-[#FFFFFF] focus:border-[#6C5CE7] focus:ring-4 focus:ring-[#6C5CE7]/10 transition-all duration-300 placeholder-[#2D3436] placeholder-opacity-30"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-[#2D3436] opacity-50 uppercase tracking-widest px-1">
                  ABC ID
                </label>
                <input
                  name="abcId"
                  value={form.abcId}
                  onChange={handleChange}
                  placeholder="12 Digit ID"
                  className="w-full px-5 py-3.5 text-[14px] font-mono font-bold text-[#2D3436] bg-[#F5F6FA] border border-transparent rounded-[16px] outline-none focus:bg-[#FFFFFF] focus:border-[#6C5CE7] focus:ring-4 focus:ring-[#6C5CE7]/10 transition-all duration-300 placeholder-[#2D3436] placeholder-opacity-30"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-[#2D3436] opacity-50 uppercase tracking-widest px-1">
                  Account Status
                </label>
                <div className="relative">
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full px-5 py-3.5 text-[14px] font-bold text-[#2D3436] bg-[#F5F6FA] border border-transparent rounded-[16px] outline-none focus:bg-[#FFFFFF] focus:border-[#6C5CE7] focus:ring-4 focus:ring-[#6C5CE7]/10 transition-all duration-300 appearance-none cursor-pointer"
                  >
                    <option value="active">Active</option>
                    <option value="graduated">Graduated</option>
                    <option value="inactive">Inactive</option>
                    <option value="unassigned">Unassigned</option>
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-[#2D3436] opacity-40 font-black text-[10px]">
                    ▼
                  </div>
                </div>
              </div>
            </div>

            <footer className="flex justify-end gap-3 pt-6 border-t border-[#F5F6FA] mt-2">
              <button
                onClick={() => setEditingStudent(null)}
                className="px-6 py-3.5 text-[11px] font-black text-[#2D3436] bg-[#F5F6FA] border border-transparent rounded-[14px] hover:border-[#6C5CE7] hover:text-[#6C5CE7] transition-all duration-300 cursor-pointer uppercase tracking-widest outline-none active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={saving}
                className="px-8 py-3.5 text-[11px] font-black text-[#FFFFFF] bg-[#6C5CE7] border-none rounded-[14px] hover:shadow-[0_10px_25px_-5px_rgba(108,92,231,0.4)] transition-all duration-300 disabled:opacity-50 disabled:transform-none cursor-pointer uppercase tracking-widest outline-none active:scale-95 shadow-md flex items-center justify-center min-w-[140px]"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-[#FFFFFF]/30 border-t-[#FFFFFF] rounded-full animate-spin"></div>
                ) : (
                  "Save Changes"
                )}
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
