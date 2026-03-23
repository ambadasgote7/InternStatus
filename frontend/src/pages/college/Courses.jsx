import React, { useEffect, useState } from "react";
import API from "../../api/api";

export default function Courses() {

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    durationYears: "",
    credits: ""
  });

  const [specializationInput, setSpecializationInput] = useState("");
  const [specializations, setSpecializations] = useState([]);
  const [editingCourse, setEditingCourse] = useState(null);

  // ================= FETCH =================
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

  // ================= SPECIALIZATION =================
  const addSpecialization = () => {
    const value = specializationInput.trim();

    if (!value) return;

    // ❌ prevent duplicates
    if (specializations.includes(value)) {
      setSpecializationInput("");
      return;
    }

    setSpecializations(prev => [...prev, value]);
    setSpecializationInput("");
  };

  const removeSpecialization = (i) => {
    setSpecializations(prev => prev.filter((_, idx) => idx !== i));
  };

  // ================= VALIDATION =================
  const validateForm = () => {
    if (!form.name.trim()) {
      return "Course name is required";
    }

    if (!form.durationYears || Number(form.durationYears) <= 0) {
      return "Valid duration required";
    }

    if (
      form.credits === "" ||
      isNaN(Number(form.credits)) ||
      Number(form.credits) < 0
    ) {
      return "Valid credits required";
    }

    return null;
  };

  // ================= SUBMIT =================
  const handleSubmit = async () => {

    const error = validateForm();
    if (error) {
      return alert(error);
    }

    // ✅ CLEAN PAYLOAD (IMPORTANT)
    const payload = {
      name: form.name.trim(),
      durationYears: Number(form.durationYears),
      credits: Number(form.credits),
      specializations
    };

    try {

      if (editingCourse) {

        if (!editingCourse?._id) {
          return alert("Invalid course selected");
        }

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

  // ================= DELETE =================
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

  // ================= EDIT =================
  const startEdit = (c) => {

    if (!c?._id) {
      return alert("Invalid course data");
    }

    setEditingCourse(c);

    setForm({
      name: c.name || "",
      durationYears: c.durationYears || "",
      credits: c.credits ?? ""
    });

    setSpecializations(c.specializations || []);
  };

  // ================= RESET =================
  const resetForm = () => {
    setForm({ name: "", durationYears: "", credits: "" });
    setSpecializations([]);
    setEditingCourse(null);
  };

  if (loading) return <div className="p-10">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 text-white">

      {/* ================= FORM ================= */}
      <div className="bg-gray-900 p-6 rounded-xl mb-6">

        <h2 className="text-xl mb-4">
          {editingCourse ? "Edit Course" : "Add Course"}
        </h2>

        <div className="grid grid-cols-3 gap-3">

          <input
            placeholder="Course Name"
            value={form.name}
            onChange={(e) =>
              setForm(prev => ({ ...prev, name: e.target.value }))
            }
            className="p-2 bg-black border rounded"
          />

          <input
            type="number"
            placeholder="Duration (Years)"
            value={form.durationYears}
            onChange={(e) =>
              setForm(prev => ({
                ...prev,
                durationYears: e.target.value
              }))
            }
            className="p-2 bg-black border rounded"
          />

          <input
            type="number"
            placeholder="Credits (e.g. 4)"
            value={form.credits}
            onChange={(e) =>
              setForm(prev => ({
                ...prev,
                credits: e.target.value
              }))
            }
            className="p-2 bg-black border rounded"
          />

        </div>

        {/* SPECIALIZATION */}
        <div className="flex gap-2 mt-4">
          <input
            placeholder="Add Specialization"
            value={specializationInput}
            onChange={(e) => setSpecializationInput(e.target.value)}
            className="flex-1 p-2 bg-black border rounded"
          />
          <button
            onClick={addSpecialization}
            className="bg-blue-600 px-4"
          >
            Add
          </button>
        </div>

        <div className="flex gap-2 mt-3 flex-wrap">
          {specializations.map((s, i) => (
            <span key={i} className="bg-gray-700 px-2 py-1 rounded">
              {s}
              <button
                onClick={() => removeSpecialization(i)}
                className="ml-2"
              >
                x
              </button>
            </span>
          ))}
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={handleSubmit}
            className="bg-green-600 px-4 py-2"
          >
            {editingCourse ? "Update Course" : "Add Course"}
          </button>

          {editingCourse && (
            <button
              onClick={resetForm}
              className="bg-gray-600 px-4 py-2"
            >
              Cancel
            </button>
          )}
        </div>

      </div>

      {/* ================= TABLE ================= */}
      <table className="w-full border text-sm">

        <thead className="bg-gray-800">
          <tr>
            <th className="p-2">Course</th>
            <th className="p-2">Duration</th>
            <th className="p-2">Credits</th>
            <th className="p-2">Specializations</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>

        <tbody>
          {courses.map(c => (
            <tr key={c._id} className="border">

              <td className="p-2">{c.name}</td>
              <td className="p-2">{c.durationYears} yrs</td>
              <td className="p-2 font-semibold text-green-400">
                {c.credits}
              </td>
              <td className="p-2">
                {c.specializations?.join(", ")}
              </td>

              <td className="p-2 flex gap-2">
                <button
                  onClick={() => startEdit(c)}
                  className="bg-blue-500 px-2"
                >
                  Edit
                </button>

                <button
                  onClick={() => deleteCourse(c._id)}
                  className="bg-red-500 px-2"
                >
                  Delete
                </button>
              </td>

            </tr>
          ))}
        </tbody>

      </table>

    </div>
  );
}