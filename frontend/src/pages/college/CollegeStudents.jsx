import React, { useEffect, useState } from "react";
import API from "../../api/api";
import { useNavigate } from "react-router-dom";

// ==========================================
// 1. Reusable Status Badge Component
// ==========================================
const StatusBadge = ({ status }) => {
  let cls = "bg-[#f9f9f9] border-[#e5e5e5] text-[#333]";
  if (status === "active") {
    cls = "bg-[#111] text-[#fff] border-[#111]";
  } else if (status === "graduated") {
    cls = "bg-[#f9f9f9] border-[#008000] text-[#008000]";
  } else if (status === "suspended") {
    cls = "bg-[#fff] border-[#cc0000] text-[#cc0000]";
  }

  return (
    <span
      className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest border transition-all duration-300 ${cls}`}
    >
      {status ? status : "UNKNOWN"}
    </span>
  );
};

// ==========================================
// 2. Main College Students Component
// ==========================================
export default function CollegeStudents() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit State
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

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCourse, setFilterCourse] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterSpecialization, setFilterSpecialization] = useState("ALL");

  useEffect(() => {
    fetchStudents();
    fetchCourses();
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

  const fetchCourses = async () => {
    try {
      const res = await API.get("/college/courses");
      setCourses(res.data?.data || []);
    } catch (err) {
      console.error(err);
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
    
    setEditForm((prev) => {
      let updatedForm = { ...prev, [name]: value };

      // Logic: If Course Name changes, reset specialization and recalculate end year
      if (name === "courseName") {
        const selectedCourseObj = courses.find((c) => c.name === value);
        updatedForm.specialization = ""; // Reset specialization on course change
        
        if (selectedCourseObj && prev.courseStartYear) {
          updatedForm.courseEndYear = parseInt(prev.courseStartYear) + parseInt(selectedCourseObj.durationYears);
        }
      }

      // Logic: If Start Year changes, recalculate end year based on selected course duration
      if (name === "courseStartYear") {
        const selectedCourseObj = courses.find((c) => c.name === prev.courseName);
        if (selectedCourseObj && value) {
          updatedForm.courseEndYear = parseInt(value) + parseInt(selectedCourseObj.durationYears);
        }
      }

      return updatedForm;
    });
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

  // Helper for dynamic UI selections in Modal
  const currentSelectedCourse = courses.find(c => c.name === editForm.courseName);

  // Extract unique values for filters
  const uniqueCourses = [
    "ALL",
    ...new Set(students.map((s) => s.courseName).filter(Boolean)),
  ];
  const uniqueStatuses = [
    "ALL",
    ...new Set(students.map((s) => s.status).filter(Boolean)),
  ];

  const selectedFilterCourse = courses.find(
    (c) => c.name?.trim().toLowerCase() === filterCourse.trim().toLowerCase()
  );
  const filterSpecializations = selectedFilterCourse?.specializations || [];
  const uniqueSpecializations = [
    "ALL",
    ...new Set(filterSpecializations.filter(Boolean)),
  ];

  const filteredStudents = students.filter((s) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      (s.fullName || "").toLowerCase().includes(searchLower) ||
      (s.prn || "").toLowerCase().includes(searchLower);

    const matchesCourse =
      filterCourse === "ALL" || s.courseName === filterCourse;
    const matchesStatus = filterStatus === "ALL" || s.status === filterStatus;
    const matchesSpecialization =
      filterSpecialization === "ALL" || s.specialization === filterSpecialization;

    return matchesSearch && matchesCourse && matchesStatus && matchesSpecialization;
  });

  if (loading) {
    return (
      <div className="h-screen bg-[#F5F6FA] flex items-center justify-center font-['Nunito']">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#6C5CE7]/20 border-t-[#6C5CE7] rounded-full animate-spin"></div>
          <p className="text-[14px] font-bold text-[#2D3436] animate-pulse">
            Syncing Student Records...
          </p>
        </div>
      </div>
    );
  }

  console.log(filteredStudents);

  return (
    <div className="min-h-screen bg-[#F5F6FA] text-[#2D3436] font-['Nunito'] overflow-hidden">
      <main className="max-w-7xl mx-auto w-full px-4 md:px-8 py-8 flex flex-col gap-8 h-screen overflow-y-auto no-scrollbar animate-in fade-in duration-700">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#e5e5e5]/50 pb-6 flex-shrink-0">
          <div className="flex flex-col gap-1">
            <h1 className="text-[28px] font-black text-[#2D3436] m-0 tracking-tight leading-tight">
              College <span className="text-[#6C5CE7]">Students</span>
            </h1>
            <p className="text-[12px] font-bold text-[#6C5CE7] opacity-80 m-0 uppercase tracking-[0.2em]">
              Academic Directory Management
            </p>
          </div>
        </header>

        {/* Filters Bar */}
        {students.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-shrink-0">
            <div className="relative group">
              <input
                type="text"
                placeholder="Search by Name or PRN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-5 py-3.5 text-[14px] bg-[#FFFFFF] border border-[#e5e5e5] rounded-2xl outline-none focus:border-[#6C5CE7] focus:ring-4 focus:ring-[#6C5CE7]/10 transition-all shadow-sm group-hover:border-[#6C5CE7]/50"
              />
            </div>
            
            <select
              value={filterCourse}
              onChange={(e) => {
                setFilterCourse(e.target.value);
                setFilterSpecialization("ALL");
              }}
              className="w-full px-5 py-3.5 text-[12px] font-bold text-[#2D3436] bg-[#FFFFFF] border border-[#e5e5e5] rounded-2xl outline-none focus:border-[#6C5CE7] transition-all appearance-none uppercase tracking-wider shadow-sm cursor-pointer"
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
              className="w-full px-5 py-3.5 text-[12px] font-bold text-[#2D3436] bg-[#FFFFFF] border border-[#e5e5e5] rounded-2xl outline-none focus:border-[#6C5CE7] transition-all appearance-none uppercase tracking-wider shadow-sm disabled:opacity-50 disabled:bg-[#f1f1f1] cursor-pointer"
            >
              {uniqueSpecializations.map((spec) => (
                <option key={spec} value={spec}>
                  {spec === "ALL" ? "Specializations" : spec}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-5 py-3.5 text-[12px] font-bold text-[#2D3436] bg-[#FFFFFF] border border-[#e5e5e5] rounded-2xl outline-none focus:border-[#6C5CE7] transition-all appearance-none uppercase tracking-wider shadow-sm cursor-pointer"
            >
              {uniqueStatuses.map((status) => (
                <option key={status} value={status}>
                  {status === "ALL" ? "All Statuses" : status}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1">
          {students.length === 0 ? (
            <div className="bg-[#FFFFFF] border-2 border-dashed border-[#e5e5e5] rounded-3xl p-20 text-center animate-pulse">
              <p className="text-[13px] font-bold text-[#2D3436] opacity-40 m-0 uppercase tracking-widest">
                No registered students found.
              </p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="bg-[#FFFFFF] border border-[#e5e5e5] rounded-3xl p-20 text-center shadow-sm">
              <p className="text-[13px] font-bold text-[#2D3436] opacity-40 m-0 uppercase tracking-widest">
                No students match your criteria.
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterCourse("ALL");
                  setFilterStatus("ALL");
                  setFilterSpecialization("ALL");
                }}
                className="mt-6 px-6 py-3 bg-[#6C5CE7] text-[#FFFFFF] text-[11px] font-black uppercase tracking-widest rounded-xl hover:shadow-lg hover:shadow-[#6C5CE7]/30 transition-all cursor-pointer transform hover:-translate-y-0.5"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="bg-[#FFFFFF] border border-[#e5e5e5] rounded-3xl shadow-sm overflow-hidden mb-10 transition-all duration-500 hover:shadow-md">
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[#F5F6FA] border-b border-[#e5e5e5]">
                    <tr>
                      <th className="p-6 text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-[0.15em]">Student Details</th>
                      <th className="p-6 text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-[0.15em]">Academic Path</th>
                      <th className="p-6 text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-[0.15em]">ID / Year</th>
                      <th className="p-6 text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-[0.15em] text-center">Status</th>
                      <th className="p-6 text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-[0.15em] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F5F6FA]">
                    {filteredStudents.map((s, idx) => (
                      <tr
                        key={s._id}
                        style={{ animationDelay: `${idx * 50}ms` }}
                        className="group hover:bg-[#F5F6FA]/50 transition-colors animate-in fade-in slide-in-from-bottom-2 duration-500"
                      >
                        <td className="p-6 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-[16px] font-extrabold text-[#2D3436] group-hover:text-[#6C5CE7] transition-colors leading-tight">
                              {s.fullName}
                            </span>
                            <span className="text-[12px] font-bold text-[#2D3436] opacity-40 mt-1">
                              {s.user?.email || "—"}
                            </span>
                          </div>
                        </td>
                        <td className="p-6 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            <span className="text-[13px] font-extrabold text-[#2D3436]">
                              {s.courseName || "—"}
                            </span>
                            <span className="text-[10px] font-bold text-[#6C5CE7] uppercase tracking-wider">
                              {s.specialization || "—"}
                            </span>
                          </div>
                        </td>
                        <td className="p-6 whitespace-nowrap">
                          <div className="flex flex-col gap-1.5">
                            <span className="inline-block px-2 py-0.5 rounded bg-[#F5F6FA] text-[11px] font-mono font-bold text-[#2D3436] border border-[#e5e5e5]">
                              {s.prn || "—"}
                            </span>
                            <span className="text-[11px] font-bold opacity-40 uppercase tracking-widest ml-1">
                              Year {s.Year || "—"}
                            </span>
                          </div>
                        </td>
                        <td className="p-6 text-center">
                          <StatusBadge status={s.status} />
                        </td>
                        <td className="p-6 text-right whitespace-nowrap">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => navigate(`/college/students/${s._id}`)}
                              className="px-4 py-2 bg-[#FFFFFF] border border-[#e5e5e5] text-[#2D3436] text-[10px] font-black uppercase tracking-widest rounded-xl hover:border-[#6C5CE7] hover:text-[#6C5CE7] transition-all cursor-pointer"
                            >
                              View
                            </button>
                            <button
                              onClick={() => openEdit(s)}
                              className="px-4 py-2 bg-[#6C5CE7] text-[#FFFFFF] text-[10px] font-black uppercase tracking-widest rounded-xl hover:shadow-lg hover:shadow-[#6C5CE7]/30 transition-all cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleRemove(s._id)}
                              className="p-2 text-[#cc0000] hover:bg-[#cc0000]/10 rounded-xl transition-colors cursor-pointer"
                              title="Remove Student"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
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
        </div>
      </main>

      {/* Edit Student Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D3436]/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-[#FFFFFF] rounded-3xl shadow-2xl border border-[#FFFFFF] flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
            <header className="px-8 py-6 border-b border-[#F5F6FA] flex justify-between items-center">
              <h3 className="text-[20px] font-black text-[#2D3436] m-0 tracking-tight">
                Update <span className="text-[#6C5CE7]">Profile</span>
              </h3>
              <button
                onClick={closeEdit}
                className="p-2 hover:bg-[#F5F6FA] rounded-full transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </header>

            <div className="p-8 flex flex-col gap-5 overflow-y-auto no-scrollbar">
              
              {/* Dropdown for Course */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black text-[#2D3436] opacity-40 uppercase tracking-[0.1em] ml-1">
                  Course Name
                </label>
                <select
                  name="courseName"
                  value={editForm.courseName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-[14px] font-bold text-[#2D3436] bg-[#F5F6FA] border border-[#e5e5e5] rounded-xl outline-none focus:border-[#6C5CE7] cursor-pointer"
                >
                  <option value="">Select Course</option>
                  {courses.map(course => (
                    <option key={course._id} value={course.name}>{course.name}</option>
                  ))}
                </select>
              </div>

              {/* Dropdown for Specialization */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black text-[#2D3436] opacity-40 uppercase tracking-[0.1em] ml-1">
                  Specialization
                </label>
                <select
                  name="specialization"
                  value={editForm.specialization}
                  onChange={handleChange}
                  disabled={!editForm.courseName}
                  className="w-full px-4 py-3 text-[14px] font-bold text-[#2D3436] bg-[#F5F6FA] border border-[#e5e5e5] rounded-xl outline-none focus:border-[#6C5CE7] cursor-pointer disabled:opacity-50"
                >
                  <option value="">Select Specialization</option>
                  {currentSelectedCourse?.specializations?.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-black text-[#2D3436] opacity-40 uppercase tracking-[0.1em] ml-1">
                      Start Year
                    </label>
                    <input
                      type="number"
                      name="courseStartYear"
                      value={editForm.courseStartYear}
                      onChange={handleChange}
                      placeholder="e.g. 2022"
                      className="w-full px-4 py-3 text-[14px] font-bold text-[#2D3436] bg-[#F5F6FA] border border-[#e5e5e5] rounded-xl outline-none focus:border-[#6C5CE7]"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-black text-[#2D3436] opacity-40 uppercase tracking-[0.1em] ml-1">
                      End Year (Auto)
                    </label>
                    <input
                      type="text"
                      name="courseEndYear"
                      value={editForm.courseEndYear}
                      readOnly
                      className="w-full px-4 py-3 text-[14px] font-bold text-[#2D3436] bg-[#F5F6FA] border border-[#e5e5e5] rounded-xl outline-none opacity-70"
                    />
                  </div>
              </div>

              {[
                { label: "Current Year", name: "Year" },
                { label: "PRN Number", name: "prn" },
                { label: "ABC ID", name: "abcId" },
              ].map((field) => (
                <div key={field.name} className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-black text-[#2D3436] opacity-40 uppercase tracking-[0.1em] ml-1">
                    {field.label}
                  </label>
                  <input
                    name={field.name}
                    value={editForm[field.name]}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-[14px] font-bold text-[#2D3436] bg-[#F5F6FA] border border-[#e5e5e5] rounded-xl outline-none focus:border-[#6C5CE7]"
                  />
                </div>
              ))}

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black text-[#2D3436] opacity-40 uppercase tracking-[0.1em] ml-1">
                  Status
                </label>
                <select
                  name="status"
                  value={editForm.status}
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-[14px] font-bold text-[#2D3436] bg-[#F5F6FA] border border-[#e5e5e5] rounded-xl outline-none focus:border-[#6C5CE7] cursor-pointer appearance-none"
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="graduated">Graduated</option>
                </select>
              </div>
            </div>

            <footer className="px-8 py-6 border-t border-[#F5F6FA] flex justify-end gap-3">
              <button
                onClick={closeEdit}
                className="px-6 py-3 text-[11px] font-black text-[#2D3436] bg-[#FFFFFF] border border-[#e5e5e5] rounded-xl hover:border-[#2D3436] transition-all cursor-pointer uppercase tracking-widest"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={saving}
                className="px-8 py-3 text-[11px] font-black text-[#FFFFFF] bg-[#6C5CE7] border-none rounded-xl hover:shadow-lg hover:shadow-[#6C5CE7]/30 transition-all disabled:opacity-50 cursor-pointer uppercase tracking-widest"
              >
                {saving ? "Processing..." : "Commit Changes"}
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}