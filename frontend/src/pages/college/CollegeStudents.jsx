import React, { useEffect, useState } from "react";
import API from "../../api/api";
import { useNavigate } from "react-router-dom";

export default function CollegeStudents() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editForm, setEditForm] = useState({
    courseName: "",
    specialization: "",
    courseStartYear: "",
    courseEndYear: "",
    Year: "",
    prn: "",
    abcId: "",
    status: "active",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await API.get("/college/students");
      setStudents(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (student) => {
    setEditingStudent(student);
    setEditForm({
      courseName: student.courseName || "",
      specialization: student.specialization || "",
      courseStartYear: student.courseStartYear || "",
      courseEndYear: student.courseEndYear || "",
      Year: student.Year || "",
      prn: student.prn || "",
      abcId: student.abcId || "",
      status: student.status || "active",
    });
  };

  const closeEdit = () => {
    setEditingStudent(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdate = async () => {
    if (!editingStudent) return;
    setSaving(true);
    try {
      await API.patch(`/college/students/${editingStudent._id}`, editForm);
      await fetchStudents();
      closeEdit();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (id) => {
    const ok = window.confirm("Remove student from college?");
    if (!ok) return;
    try {
      await API.delete(`/college/students/${id}`);
      setStudents((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      console.error(err);
      alert("Remove failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center">
        <p className="text-[14px] font-bold text-[#333] animate-pulse">
          Loading Student Records...
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
              College Students
            </h1>
            <p className="text-[13px] font-bold text-[#333] opacity-60 m-0 uppercase tracking-widest">
              Institutional Enrollment List
            </p>
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
                      className="hover:bg-[#f9f9f9] transition-colors duration-200"
                    >
                      <td className="px-5 py-3">
                        <div className="text-[13px] font-bold text-[#333]">
                          {s.fullName}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="text-[13px] font-bold text-[#333] opacity-80">
                          {s.courseName}
                        </div>
                        <div className="text-[11px] font-bold text-[#333] opacity-50 uppercase tracking-tighter">
                          {s.specialization}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-[12px] font-mono text-[#333] opacity-70">
                        {s.prn || "—"}
                      </td>
                      <td className="px-5 py-3 text-[13px] font-bold text-[#333] text-center">
                        {s.Year || "—"}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-[10px] text-[10px] font-black uppercase tracking-widest ${
                            s.status === "active"
                              ? "bg-[#111] text-[#fff]"
                              : "bg-[#fff] border border-[#e5e5e5] text-[#333] opacity-60"
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() =>
                              navigate(`/college/students/${s._id}`)
                            }
                            className="px-3 py-1.5 text-[11px] font-bold text-[#333] bg-[#f9f9f9] border border-[#e5e5e5] rounded-[10px] hover:border-[#333] transition-colors cursor-pointer uppercase tracking-widest"
                          >
                            View
                          </button>
                          <button
                            onClick={() => openEdit(s)}
                            className="px-3 py-1.5 text-[11px] font-bold text-[#fff] bg-[#111] border-none rounded-[10px] hover:opacity-80 transition-opacity cursor-pointer uppercase tracking-widest"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleRemove(s._id)}
                            className="px-3 py-1.5 text-[11px] font-bold text-[#cc0000] bg-[#fff] border border-[#cc0000] rounded-[10px] hover:bg-[#cc0000] hover:text-[#fff] transition-colors cursor-pointer uppercase tracking-widest"
                          >
                            Remove
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
          <div className="w-full max-w-md bg-[#fff] rounded-[20px] shadow-sm border border-[#e5e5e5] p-6 box-border flex flex-col gap-5 max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-[#f9f9f9] pb-3">
              <h3 className="text-[18px] font-black text-[#333] m-0 tracking-tight">
                Edit Student Details
              </h3>
              <button
                onClick={closeEdit}
                className="text-[11px] font-bold text-[#333] opacity-50 uppercase tracking-widest bg-transparent border-none cursor-pointer hover:opacity-100 p-0"
              >
                Close
              </button>
            </div>

            <div className="flex flex-col gap-3 overflow-y-auto no-scrollbar">
              {[
                { label: "Course Name", name: "courseName" },
                { label: "Specialization", name: "specialization" },
                { label: "Start Year", name: "courseStartYear" },
                { label: "End Year", name: "courseEndYear" },
                { label: "Current Year", name: "Year" },
                { label: "PRN Number", name: "prn" },
                { label: "ABC ID", name: "abcId" },
              ].map((field) => (
                <div key={field.name} className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                    {field.label}
                  </label>
                  <input
                    name={field.name}
                    value={editForm[field.name]}
                    onChange={handleChange}
                    placeholder={field.label}
                    className="w-full px-4 py-2.5 text-[13px] text-[#333] bg-[#fff] border border-[#333] rounded-[14px] outline-none"
                  />
                </div>
              ))}

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                  Account Status
                </label>
                <select
                  name="status"
                  value={editForm.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 text-[13px] text-[#333] bg-[#fff] border border-[#333] rounded-[14px] outline-none cursor-pointer"
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="graduated">Graduated</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-[#f9f9f9]">
              <button
                onClick={closeEdit}
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
