import React, { useEffect, useState } from "react";
import API from "../../api/api";

export default function CollegeFacultyList() {
  const [faculty, setFaculty] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  // New Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCourse, setFilterCourse] = useState("");

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

  const closeEdit = () => {
    setSelected(null);
  };

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
      closeEdit();
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

  const selectedCourse = courses.find(
    (c) =>
      c.name?.trim().toLowerCase() ===
      (editForm.courseName || "").trim().toLowerCase(),
  );

  const specializations = selectedCourse?.specializations || [];

  // Filter Logic
  const filteredFaculty = faculty.filter((f) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      (f.fullName || "").toLowerCase().includes(searchLower) ||
      (f.employeeId || "").toLowerCase().includes(searchLower);
    const matchesCourse = filterCourse ? f.courseName === filterCourse : true;

    return matchesSearch && matchesCourse;
  });

  // Unique courses for the filter dropdown
  const uniqueFacultyCourses = [
    ...new Set(faculty.map((f) => f.courseName).filter(Boolean)),
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f9f9f9]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#e5e5e5] border-t-[#111] rounded-full animate-spin"></div>
          <p className="text-[#111] font-bold tracking-widest uppercase text-[10px] animate-pulse m-0">
            Loading Faculty Roster
          </p>
        </div>
      </div>
    );
  }

  // Common Theme Classes
  const inputClass =
    "w-full px-5 py-3.5 text-[13px] font-medium text-[#111] bg-[#fff] border border-[#e5e5e5] rounded-[14px] outline-none transition-all duration-300 focus:border-[#111] focus:ring-1 focus:ring-[#111] placeholder:text-[#999]";
  const labelClass =
    "text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-[0.15em] mb-1.5 ml-1 block";

  return (
    <div className="min-h-screen bg-[#f9f9f9] p-4 md:p-8 font-sans text-[#111]">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        {/* Header & Filters */}
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-[#e5e5e5] pb-6">
          <div>
            <div className="text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-[0.2em] mb-2">
              Institution Management
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-[#111] m-0 tracking-tighter uppercase">
              College Faculty
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
            <input
              type="text"
              placeholder="Search Name or Emp ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 px-4 py-3 text-[12px] font-medium text-[#111] bg-[#fff] border border-[#e5e5e5] rounded-[12px] outline-none focus:border-[#111] shadow-sm"
            />

            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="w-full sm:w-48 px-4 py-3 text-[12px] font-bold text-[#111] bg-[#fff] border border-[#e5e5e5] rounded-[12px] outline-none cursor-pointer uppercase tracking-widest hover:border-[#ccc] shadow-sm appearance-none"
            >
              <option value="">All Courses</option>
              {uniqueFacultyCourses.map((course, idx) => (
                <option key={idx} value={course}>
                  {course}
                </option>
              ))}
            </select>
          </div>
        </header>

        {/* Table/Empty State */}
        {faculty.length === 0 ? (
          <div className="bg-[#fff] border border-dashed border-[#e5e5e5] rounded-[24px] p-16 text-center shadow-sm">
            <p className="text-[#999] m-0 text-[12px] font-bold uppercase tracking-widest">
              No faculty members found.
            </p>
          </div>
        ) : filteredFaculty.length === 0 ? (
          <div className="bg-[#fff] border border-dashed border-[#e5e5e5] rounded-[24px] p-16 text-center shadow-sm">
            <p className="text-[#999] m-0 text-[12px] font-bold uppercase tracking-widest">
              No results match your filters.
            </p>
          </div>
        ) : (
          <div className="bg-[#fff] border border-[#e5e5e5] rounded-[24px] overflow-hidden shadow-sm transition-all duration-300 hover:border-[#ccc]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead className="bg-[#f9f9f9] border-b border-[#e5e5e5]">
                  <tr>
                    <th className="px-6 py-5 text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                      Name
                    </th>
                    <th className="px-6 py-5 text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                      Course
                    </th>
                    <th className="px-6 py-5 text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                      Specialization
                    </th>
                    <th className="px-6 py-5 text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                      Designation
                    </th>
                    <th className="px-6 py-5 text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                      Employee ID
                    </th>
                    <th className="px-6 py-5 text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-widest text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e5e5]">
                  {filteredFaculty.map((f) => (
                    <tr
                      key={f._id}
                      className="hover:bg-[#fcfcfc] transition-colors duration-300 group"
                    >
                      <td className="px-6 py-5 text-[13px] font-black text-[#111] uppercase tracking-wide">
                        {f.fullName}
                      </td>
                      <td className="px-6 py-5 text-[13px] text-[#555] font-medium">
                        {f.courseName || "—"}
                      </td>
                      <td className="px-6 py-5 text-[13px] text-[#111] font-bold">
                        {f.department || "—"}
                      </td>
                      <td className="px-6 py-5 text-[13px] text-[#555]">
                        {f.designation || "—"}
                      </td>
                      <td className="px-6 py-5 text-[12px] text-[#555] font-mono font-bold tracking-widest bg-[#f9f9f9] inline-block mt-3 ml-6 px-2 py-1 rounded border border-[#e5e5e5]">
                        {f.employeeId || "—"}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            className="px-4 py-2 text-[10px] font-black text-[#fff] bg-[#111] border border-[#111] rounded-[10px] hover:bg-[#333] hover:border-[#333] transition-all duration-300 cursor-pointer uppercase tracking-[0.15em] outline-none hover:-translate-y-0.5"
                            onClick={() => openEdit(f)}
                          >
                            Edit
                          </button>
                          <button
                            className="px-4 py-2 text-[10px] font-black text-[#991b1b] bg-[#fff] border border-[#fecaca] rounded-[10px] hover:bg-[#fef2f2] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer uppercase tracking-[0.15em] outline-none hover:-translate-y-0.5"
                            disabled={removingId === f._id}
                            onClick={() => handleRemove(f._id)}
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
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111]/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#fff] rounded-[24px] shadow-2xl border border-[#e5e5e5] p-8 box-border flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between mb-8 border-b border-[#e5e5e5] pb-6 shrink-0">
              <h3 className="text-[22px] font-black text-[#111] m-0 tracking-tighter uppercase">
                Edit Faculty
              </h3>
              <button
                onClick={closeEdit}
                className="text-[10px] font-black text-[#999] hover:text-[#111] uppercase tracking-[0.2em] bg-transparent border-none cursor-pointer transition-colors outline-none p-0"
              >
                Close
              </button>
            </div>

            <div className="overflow-y-auto pr-2 flex-1">
              {error && (
                <div className="mb-6 px-4 py-3 text-[11px] font-bold text-[#991b1b] bg-[#fef2f2] border border-[#fecaca] rounded-[12px] uppercase tracking-widest">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-6 px-4 py-3 text-[11px] font-bold text-[#166534] bg-[#f0fdf4] border border-[#bbf7d0] rounded-[12px] uppercase tracking-widest">
                  {success}
                </div>
              )}

              <div className="flex flex-col gap-5">
                <div>
                  <label className={labelClass}>Course</label>
                  <select
                    name="courseName"
                    value={editForm.courseName}
                    onChange={handleChange}
                    className={`${inputClass} appearance-none cursor-pointer`}
                  >
                    <option value="">Select Course</option>
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
                    name="department"
                    value={editForm.department}
                    onChange={handleChange}
                    disabled={!editForm.courseName}
                    className={`${inputClass} appearance-none cursor-pointer disabled:opacity-50 disabled:bg-[#f9f9f9]`}
                  >
                    <option value="">Select Specialization</option>
                    {specializations.map((spec) => (
                      <option key={spec} value={spec}>
                        {spec}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Designation</label>
                  <input
                    name="designation"
                    value={editForm.designation}
                    onChange={handleChange}
                    placeholder="e.g. Associate Professor"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Employee ID</label>
                  <input
                    name="employeeId"
                    value={editForm.employeeId}
                    onChange={handleChange}
                    placeholder="e.g. EMP12345"
                    className={`${inputClass} font-mono`}
                  />
                </div>

                <div>
                  <label className={labelClass}>Joining Year</label>
                  <input
                    name="joiningYear"
                    value={editForm.joiningYear}
                    onChange={handleChange}
                    placeholder="e.g. 2021"
                    type="number"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-[#e5e5e5] shrink-0">
              <button
                onClick={closeEdit}
                className="px-6 py-3.5 text-[10px] font-black text-[#111] bg-[#f9f9f9] border border-[#e5e5e5] rounded-[12px] hover:bg-[#e5e5e5] transition-colors duration-300 cursor-pointer uppercase tracking-[0.15em] outline-none"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={saving}
                className="px-8 py-3.5 text-[10px] font-black text-[#fff] bg-[#111] border border-[#111] rounded-[12px] hover:bg-[#333] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer uppercase tracking-[0.15em] outline-none hover:-translate-y-0.5 flex items-center gap-2"
              >
                {saving && (
                  <span className="w-3.5 h-3.5 border-2 border-[#fff]/30 border-t-[#fff] rounded-full animate-spin"></span>
                )}
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
