import React, { useEffect, useState } from "react";
import API from "../../api/api";

export default function CollegeFacultyList() {
  const [faculty, setFaculty] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCourse, setFilterCourse] = useState("ALL");
  const [filterSpecialization, setFilterSpecialization] = useState("ALL");

  const [editForm, setEditForm] = useState({
    courseName: "",
    department: "",
    designation: "",
    employeeId: "",
    joiningYear: "",
  });

  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchFaculty();
    fetchCourses();
  }, []);

  const fetchFaculty = async () => {
    try {
      const res = await API.get("/college/faculty");
      setFaculty(res.data.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load faculty");
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await API.get("/college/courses");
      setCourses(res.data?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const openEdit = (f) => {
    setError("");
    setSuccess("");
    setSelected(f);
    setEditForm({
      courseName: f.courseName ?? "",
      department: f.department ?? "",
      designation: f.designation ?? "",
      employeeId: f.employeeId ?? "",
      joiningYear: f.joiningYear ?? "",
    });
  };

  const closeEdit = () => setSelected(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "courseName" ? { department: "" } : {}),
    }));
  };

  const handleUpdate = async () => {
    if (!selected) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await API.patch(`/college/faculty/${selected._id}`, editForm);
      setSuccess("Faculty updated successfully");
      await fetchFaculty();
      setTimeout(() => closeEdit(), 1500);
    } catch (err) {
      console.error(err);
      setError("Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (facultyId) => {
    const confirm = window.confirm("Remove this faculty from college?");
    if (!confirm) return;
    setRemovingId(facultyId);
    try {
      await API.delete(`/college/faculty/${facultyId}`);
      setFaculty((prev) => prev.filter((f) => f._id !== facultyId));
    } catch (err) {
      console.error(err);
      alert("Remove failed");
    } finally {
      setRemovingId(null);
    }
  };

  const modalCourse = courses.find(
    (c) => c.name?.trim().toLowerCase() === (editForm.courseName || "").trim().toLowerCase()
  );
  const modalSpecializations = modalCourse?.specializations || [];

  const filterBarCourse = courses.find(
    (c) => c.name?.trim().toLowerCase() === (filterCourse || "").trim().toLowerCase()
  );
  const filterBarSpecializations = filterBarCourse?.specializations || [];

  const uniqueCourses = [
    "ALL",
    ...new Set(faculty.map((f) => f.courseName).filter(Boolean)),
  ];

  const uniqueSpecializations = [
    "ALL",
    ...new Set(filterBarSpecializations.filter(Boolean)),
  ];

  const filteredFaculty = faculty.filter((f) => {
    const matchesSearch =
      (f.fullName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.employeeId || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse =
      filterCourse === "ALL" || f.courseName === filterCourse;
    const matchesSpecialization =
      filterSpecialization === "ALL" || f.specialization === filterSpecialization;
    return matchesSearch && matchesCourse && matchesSpecialization;
  });

  if (loading) {
    return (
      <div className="h-screen bg-[#FFFFFF] flex items-center justify-center font-['Nunito']">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#F5F6FA] border-t-[#6C5CE7] rounded-full animate-spin"></div>
          <p className="text-[16px] font-bold text-[#2D3436] animate-pulse">
            Syncing Faculty Roster...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#2D3436] font-['Nunito'] transition-all duration-500">
      <main className="max-w-7xl mx-auto w-full px-4 md:px-8 py-8 flex flex-col gap-8">
        
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 animate-fadeIn transition-all">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl md:text-4xl font-black text-[#2D3436] tracking-tight">
              College Faculty
            </h1>
          </div>
        </header>

        {/* Filters Bar */}
        {faculty.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#F5F6FA] p-5 rounded-2xl shadow-sm border border-transparent hover:border-[#6C5CE7]/20 transition-all duration-300">
            <div className="relative">
              <input
                type="text"
                placeholder="Search name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-5 py-3.5 text-sm bg-[#FFFFFF] border border-transparent rounded-xl outline-none focus:ring-2 focus:ring-[#6C5CE7]/20 focus:border-[#6C5CE7] transition-all shadow-sm text-[#2D3436]"
              />
            </div>
            <select
              value={filterCourse}
              onChange={(e) => {
                setFilterCourse(e.target.value);
                setFilterSpecialization("ALL");
              }}
              className="w-full px-5 py-3.5 text-xs font-bold text-[#2D3436] bg-[#FFFFFF] border border-transparent rounded-xl outline-none focus:border-[#6C5CE7] transition-all appearance-none uppercase tracking-wider shadow-sm cursor-pointer"
            >
              {uniqueCourses.map((course) => (
                <option key={course} value={course}>
                  {course === "ALL" ? "All Courses" : course}
                </option>
              ))}
            </select>
            <select
              value={filterSpecialization}
              onChange={(e) => setFilterSpecialization(e.target.value)}
              disabled={filterCourse === "ALL"}
              className="w-full px-5 py-3.5 text-xs font-bold text-[#2D3436] bg-[#FFFFFF] border border-transparent rounded-xl outline-none focus:border-[#6C5CE7] transition-all appearance-none uppercase tracking-wider shadow-sm disabled:opacity-40 cursor-pointer"
            >
              {uniqueSpecializations.map((s) => (
                <option key={s} value={s}>
                  {s === "ALL" ? "All Specializations" : s}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Data Table */}
        <div className="w-full overflow-hidden rounded-3xl border border-[#F5F6FA] shadow-xl shadow-[#6C5CE7]/5 animate-slideUp">
          {faculty.length === 0 ? (
            <div className="bg-[#F5F6FA] p-24 text-center border-4 border-dashed border-[#FFFFFF]">
              <p className="text-sm font-bold text-[#2D3436] opacity-40 uppercase tracking-[0.2em]">
                No faculty members found.
              </p>
            </div>
          ) : filteredFaculty.length === 0 ? (
            <div className="bg-[#FFFFFF] p-24 text-center">
              <p className="text-sm font-bold text-[#2D3436] opacity-40 uppercase tracking-[0.2em]">
                No matching results found.
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterCourse("ALL");
                  setFilterSpecialization("ALL");
                }}
                className="mt-6 px-8 py-3 bg-[#6C5CE7] text-[#FFFFFF] text-xs font-black uppercase tracking-widest rounded-xl hover:shadow-lg hover:shadow-[#6C5CE7]/30 transition-all active:scale-95"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto bg-[#FFFFFF]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F5F6FA]">
                    <th className="p-6 text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-[0.15em]">Faculty Profile</th>
                    <th className="p-6 text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-[0.15em]">Academic Domain</th>
                    <th className="p-6 text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-[0.15em]">Credentials</th>
                    <th className="p-6 text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-[0.15em] text-right">Management</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5F6FA]">
                  {filteredFaculty.map((f, idx) => (
                    <tr
                      key={f._id}
                      className="group hover:bg-[#F5F6FA]/50 transition-all duration-300"
                    >
                      <td className="p-6">
                        <div className="flex flex-col">
                          <span className="text-lg font-bold text-[#2D3436] group-hover:text-[#6C5CE7] transition-colors">{f.fullName}</span>
                          <span className="text-sm font-medium text-[#2D3436] opacity-50">{f.email}</span>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex flex-col gap-1">
                          <span className="text-[14px] font-extrabold text-[#2D3436]">{f.designation || "—"}</span>
                          <span className="text-[11px] font-bold text-[#6C5CE7] bg-[#6C5CE7]/5 self-start px-2 py-0.5 rounded-md">
                            {f.courseName || "—"} • {f.department || "—"}
                          </span>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex flex-col gap-2">
                          <span className="text-[12px] font-mono font-bold text-[#2D3436] bg-[#F5F6FA] px-3 py-1 rounded-lg w-fit">
                            #{f.employeeId || "N/A"}
                          </span>
                          <span className="text-[11px] font-bold text-[#2D3436] opacity-40 uppercase tracking-tighter">
                            Joined {f.joiningYear || "—"}
                          </span>
                        </div>
                      </td>
                      <td className="p-6 text-right">
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => openEdit(f)}
                            className="px-5 py-2.5 bg-[#FFFFFF] border border-[#6C5CE7] text-[#6C5CE7] text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-[#6C5CE7] hover:text-[#FFFFFF] transition-all duration-300 shadow-sm active:scale-95"
                          >
                            Edit
                          </button>
                          <button
                            disabled={removingId === f._id}
                            onClick={() => handleRemove(f._id)}
                            className="px-5 py-2.5 bg-[#FFFFFF] border border-[#cc0000]/30 text-[#cc0000] text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-[#cc0000] hover:text-[#FFFFFF] hover:border-[#cc0000] transition-all duration-300 disabled:opacity-30 active:scale-95"
                          >
                            {removingId === f._id ? "..." : "Remove"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modern Modal Overlay */}
      {selected && (
        <div className="fixed inset-0 bg-[#2D3436]/60 backdrop-blur-md flex justify-center items-center z-50 p-6 transition-all duration-300">
          <div className="bg-[#FFFFFF] rounded-[2.5rem] shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] border border-[#F5F6FA] animate-scaleIn">
            <header className="px-8 py-7 border-b border-[#F5F6FA] flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-[#2D3436]">Faculty Settings</h3>
                <p className="text-[11px] font-bold text-[#6C5CE7] uppercase tracking-[0.2em] mt-1">{selected.fullName}</p>
              </div>
              <button
                onClick={closeEdit}
                className="w-10 h-10 rounded-full bg-[#F5F6FA] text-[#2D3436] hover:bg-[#6C5CE7] hover:text-white transition-all flex items-center justify-center font-bold text-lg"
              >
                ×
              </button>
            </header>

            <div className="p-8 overflow-y-auto space-y-5 custom-scrollbar">
              {error && (
                <div className="text-[11px] font-black text-[#cc0000] uppercase tracking-widest bg-red-50 p-4 rounded-2xl border border-red-100 animate-shake">
                  {error}
                </div>
              )}
              {success && (
                <div className="text-[11px] font-black text-green-600 uppercase tracking-widest bg-green-50 p-4 rounded-2xl border border-green-100">
                  {success}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-black text-[#2D3436] opacity-40 uppercase tracking-widest ml-1">Course</label>
                  <select
                    name="courseName"
                    value={editForm.courseName}
                    onChange={handleChange}
                    className="w-full px-5 py-3.5 text-sm font-bold text-[#2D3436] bg-[#F5F6FA] border border-transparent rounded-2xl outline-none focus:border-[#6C5CE7] focus:bg-white transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Select Course</option>
                    {courses.map((c) => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-black text-[#2D3436] opacity-40 uppercase tracking-widest ml-1">Specialization</label>
                  <select
                    name="department"
                    value={editForm.department}
                    onChange={handleChange}
                    disabled={!editForm.courseName}
                    className="w-full px-5 py-3.5 text-sm font-bold text-[#2D3436] bg-[#F5F6FA] border border-transparent rounded-2xl outline-none focus:border-[#6C5CE7] focus:bg-white transition-all appearance-none cursor-pointer disabled:opacity-40"
                  >
                    <option value="">Select Domain</option>
                    {modalSpecializations.map((spec) => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-black text-[#2D3436] opacity-40 uppercase tracking-widest ml-1">Designation</label>
                <input
                  name="designation"
                  value={editForm.designation}
                  onChange={handleChange}
                  placeholder="e.g. Associate Professor"
                  className="w-full px-5 py-3.5 text-sm font-bold text-[#2D3436] bg-[#F5F6FA] border border-transparent rounded-2xl outline-none focus:border-[#6C5CE7] focus:bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-black text-[#2D3436] opacity-40 uppercase tracking-widest ml-1">Employee ID</label>
                  <input
                    name="employeeId"
                    value={editForm.employeeId}
                    onChange={handleChange}
                    className="w-full px-5 py-3.5 text-sm font-mono font-bold text-[#2D3436] bg-[#F5F6FA] border border-transparent rounded-2xl outline-none focus:border-[#6C5CE7] focus:bg-white transition-all"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-black text-[#2D3436] opacity-40 uppercase tracking-widest ml-1">Joining Year</label>
                  <input
                    type="number"
                    name="joiningYear"
                    value={editForm.joiningYear}
                    onChange={handleChange}
                    className="w-full px-5 py-3.5 text-sm font-bold text-[#2D3436] bg-[#F5F6FA] border border-transparent rounded-2xl outline-none focus:border-[#6C5CE7] focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>

            <footer className="p-8 border-t border-[#F5F6FA] flex gap-4">
              <button
                onClick={closeEdit}
                className="flex-1 px-6 py-4 text-xs font-black text-[#2D3436] bg-[#F5F6FA] rounded-2xl hover:bg-[#2D3436] hover:text-white transition-all uppercase tracking-widest active:scale-95"
              >
                Discard
              </button>
              <button
                onClick={handleUpdate}
                disabled={saving}
                className="flex-[2] px-6 py-4 bg-[#6C5CE7] text-[#FFFFFF] text-xs font-black rounded-2xl hover:shadow-xl hover:shadow-[#6C5CE7]/40 transition-all uppercase tracking-widest disabled:opacity-40 active:scale-95"
              >
                {saving ? "Updating..." : "Push Changes"}
              </button>
            </footer>
          </div>
        </div>
      )}
      
      {/* Required Animations */}
      <style jsx="true">{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
        .animate-fadeIn { animation: fadeIn 0.6s ease-out; }
        .animate-slideUp { animation: slideUp 0.8s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-shake { animation: shake 0.4s ease-in-out; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #F5F6FA; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #6C5CE7; border-radius: 10px; }
      `}</style>
    </div>
  );
}