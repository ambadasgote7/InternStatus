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
      <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center font-sans">
        <p className="text-[14px] font-bold text-[#333] animate-pulse m-0">
          Syncing Student Records...
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
              My Students
            </h1>
            <p className="text-[13px] font-bold text-[#333] opacity-60 m-0 uppercase tracking-widest">
              Institutional Enrollment List
            </p>
          </div>
          <div className="text-[11px] font-black text-[#111] bg-[#fff] border border-[#e5e5e5] px-3 py-1.5 rounded-[10px] uppercase tracking-widest">
            Total Students: {students.length}
          </div>
        </header>

        {students.length === 0 ? (
          <div className="bg-[#fff] border-2 border-dashed border-[#e5e5e5] rounded-[20px] p-10 text-center">
            <p className="text-[13px] font-bold text-[#333] opacity-60 m-0">
              No registered students found.
            </p>
          </div>
        ) : (
          <div className="bg-[#fff] border border-[#e5e5e5] rounded-[20px] shadow-sm overflow-hidden box-border">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead className="bg-[#f9f9f9] border-b border-[#e5e5e5]">
                  <tr>
                    <th className="px-5 py-3 text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                      Name
                    </th>
                    <th className="px-5 py-3 text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                      Course / Spec
                    </th>
                    <th className="px-5 py-3 text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                      PRN
                    </th>
                    <th className="px-5 py-3 text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest text-center">
                      Year
                    </th>
                    <th className="px-5 py-3 text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                      Status
                    </th>
                    <th className="px-5 py-3 text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e5e5]">
                  {students.map((s) => (
                    <tr
                      key={s._id}
                      className="hover:bg-[#fcfcfc] transition-colors"
                    >
                      <td className="px-5 py-3">
                        <div className="text-[13px] font-bold text-[#333]">
                          {s.fullName}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="text-[13px] font-bold text-[#333] opacity-80">
                          {s.courseName || "—"}
                        </div>
                        <div className="text-[11px] font-bold text-[#333] opacity-50 uppercase tracking-tighter">
                          {s.specialization || "—"}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-[12px] font-mono text-[#333] opacity-70">
                        {s.prn || "—"}
                      </td>
                      <td className="px-5 py-3 text-[13px] font-bold text-[#333] text-center">
                        {s.Year || "—"}
                      </td>
                      <td className="px-5 py-3">
                        <span className="inline-block px-2.5 py-1 rounded-[10px] text-[10px] font-black uppercase tracking-widest bg-[#f9f9f9] border border-[#e5e5e5]">
                          {s.status}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() =>
                              navigate(`/faculty/students/${s._id}`)
                            }
                            className="px-3 py-1.5 text-[11px] font-bold text-[#333] bg-[#f9f9f9] border border-[#e5e5e5] rounded-[10px] hover:border-[#333] transition-colors cursor-pointer uppercase tracking-widest"
                          >
                            View
                          </button>
                          <button
                            onClick={() => openEdit(s)}
                            className="px-3 py-1.5 text-[11px] font-bold text-[#fff] bg-[#111] border-none rounded-[10px] hover:opacity-80 transition-opacity cursor-pointer uppercase tracking-widest"
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

      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#333]/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#fff] rounded-[20px] shadow-sm border border-[#e5e5e5] p-6 box-border flex flex-col gap-5">
            <header className="flex items-center justify-between border-b border-[#f9f9f9] pb-3">
              <h3 className="text-[18px] font-black text-[#333] m-0 tracking-tight">
                Update Record
              </h3>
              <button
                onClick={() => setEditingStudent(null)}
                className="text-[11px] font-bold text-[#333] opacity-50 uppercase tracking-widest bg-transparent border-none cursor-pointer hover:opacity-100"
              >
                Close
              </button>
            </header>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold opacity-60 uppercase tracking-widest">
                  Course Start Year
                </label>
                <select
                  name="courseStartYear"
                  value={form.courseStartYear}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 text-[13px] bg-[#fff] border border-[#333] rounded-[14px] outline-none"
                >
                  <option value="">Select Year</option>
                  {Array.from(
                    { length: 10 },
                    (_, i) => CURRENT_YEAR - 5 + i,
                  ).map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold opacity-60 uppercase tracking-widest">
                  Academic Year
                </label>
                <select
                  name="Year"
                  value={form.Year}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 text-[13px] bg-[#fff] border border-[#333] rounded-[14px] outline-none"
                >
                  <option value="">Select Stage</option>
                  {[...Array(COURSE_DURATION)].map((_, i) => (
                    <option key={i} value={i + 1}>
                      Year {i + 1}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold opacity-60 uppercase tracking-widest">
                  PRN Number
                </label>
                <input
                  name="prn"
                  value={form.prn}
                  onChange={handleChange}
                  placeholder="PRN"
                  className="w-full px-4 py-2.5 text-[13px] font-mono border border-[#333] rounded-[14px] outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold opacity-60 uppercase tracking-widest">
                  ABC ID
                </label>
                <input
                  name="abcId"
                  value={form.abcId}
                  onChange={handleChange}
                  placeholder="12 Digit ID"
                  className="w-full px-4 py-2.5 text-[13px] font-mono border border-[#333] rounded-[14px] outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold opacity-60 uppercase tracking-widest">
                  Account Status
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 text-[13px] bg-[#fff] border border-[#333] rounded-[14px] outline-none"
                >
                  <option value="active">Active</option>
                  <option value="graduated">Graduated</option>
                  <option value="inactive">Inactive</option>
                  <option value="unassigned">Unassigned</option>
                </select>
              </div>
            </div>

            <footer className="flex justify-end gap-2 pt-4 border-t border-[#f9f9f9]">
              <button
                onClick={() => setEditingStudent(null)}
                className="px-5 py-2 text-[12px] font-bold text-[#333] bg-[#f9f9f9] border border-[#e5e5e5] rounded-[12px] hover:bg-[#e5e5e5] transition-colors cursor-pointer uppercase tracking-widest"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={saving}
                className="px-6 py-2 text-[12px] font-bold text-[#fff] bg-[#111] border-none rounded-[12px] hover:opacity-80 transition-opacity disabled:opacity-50 cursor-pointer uppercase tracking-widest"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
