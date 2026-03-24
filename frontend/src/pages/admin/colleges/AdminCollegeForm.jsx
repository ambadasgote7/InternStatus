import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../../api/api";

export default function AdminCollegeForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    website: "",
    emailDomain: "",
    description: "",
    courses: [],
  });

  const fetchCollege = async () => {
    try {
      const res = await API.get(`/admin/colleges/${id}`);
      setForm(res.data?.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load college");
    }
  };

  useEffect(() => {
    if (isEdit) fetchCollege();
  }, [id]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const addCourse = () => {
    setForm({
      ...form,
      courses: [
        ...form.courses,
        {
          name: "",
          durationYears: "",
          specializations: [],
        },
      ],
    });
  };

  const updateCourse = (index, field, value) => {
    const updated = [...form.courses];
    updated[index][field] = value;
    setForm({
      ...form,
      courses: updated,
    });
  };

  const addSpecialization = (index) => {
    const updated = [...form.courses];
    updated[index].specializations.push("");
    setForm({
      ...form,
      courses: updated,
    });
  };

  const updateSpecialization = (cIndex, sIndex, value) => {
    const updated = [...form.courses];
    updated[cIndex].specializations[sIndex] = value;
    setForm({
      ...form,
      courses: updated,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      if (isEdit) {
        await API.put(`/admin/colleges/${id}`, form);
      } else {
        await API.post(`/admin/colleges`, form);
      }

      navigate("/admin/colleges");
    } catch (err) {
      console.error(err);
      alert("Save failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f9f9] p-4 md:p-8 font-sans text-[#111]">
      <div className="max-w-4xl mx-auto bg-[#fff] p-6 md:p-10 rounded-[24px] border border-[#e5e5e5] shadow-sm transition-all duration-300 hover:border-[#ccc]">
        <header className="mb-10 border-b border-[#e5e5e5] pb-6">
          <h2 className="text-3xl font-black m-0 tracking-tight text-[#111]">
            {isEdit ? "Edit College Profile" : "Add New College"}
          </h2>
        </header>

        <form onSubmit={handleSubmit} className="flex flex-col gap-10">
          <div className="flex flex-col gap-6">
            <h3 className="text-sm font-bold text-[#111] m-0 uppercase tracking-widest">
              Basic Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                  College Name
                </label>
                <input
                  name="name"
                  placeholder="e.g. Pune Institute of Technology"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full px-5 py-4 text-sm text-[#111] bg-[#fff] border border-[#e5e5e5] rounded-[14px] outline-none transition-all duration-300 focus:border-[#111] focus:ring-1 focus:ring-[#111] placeholder:text-[#999]"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                  Email Domain
                </label>
                <input
                  name="emailDomain"
                  placeholder="e.g. pit.edu.in"
                  value={form.emailDomain || ""}
                  onChange={handleChange}
                  className="w-full px-5 py-4 text-sm text-[#111] bg-[#fff] border border-[#e5e5e5] rounded-[14px] outline-none transition-all duration-300 focus:border-[#111] focus:ring-1 focus:ring-[#111] placeholder:text-[#999]"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                  Phone Number
                </label>
                <input
                  name="phone"
                  placeholder="e.g. +91 9876543210"
                  value={form.phone || ""}
                  onChange={handleChange}
                  className="w-full px-5 py-4 text-sm text-[#111] bg-[#fff] border border-[#e5e5e5] rounded-[14px] outline-none transition-all duration-300 focus:border-[#111] focus:ring-1 focus:ring-[#111] placeholder:text-[#999]"
                />
              </div>

              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                  Website
                </label>
                <input
                  name="website"
                  placeholder="e.g. https://www.pit.edu.in"
                  value={form.website || ""}
                  onChange={handleChange}
                  className="w-full px-5 py-4 text-sm text-[#111] bg-[#fff] border border-[#e5e5e5] rounded-[14px] outline-none transition-all duration-300 focus:border-[#111] focus:ring-1 focus:ring-[#111] placeholder:text-[#999]"
                />
              </div>

              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                  Address
                </label>
                <input
                  name="address"
                  placeholder="Full physical address"
                  value={form.address || ""}
                  onChange={handleChange}
                  className="w-full px-5 py-4 text-sm text-[#111] bg-[#fff] border border-[#e5e5e5] rounded-[14px] outline-none transition-all duration-300 focus:border-[#111] focus:ring-1 focus:ring-[#111] placeholder:text-[#999]"
                />
              </div>

              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                  Description
                </label>
                <textarea
                  name="description"
                  placeholder="Brief overview of the institution"
                  value={form.description || ""}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-5 py-4 text-sm text-[#111] bg-[#fff] border border-[#e5e5e5] rounded-[14px] outline-none transition-all duration-300 focus:border-[#111] focus:ring-1 focus:ring-[#111] placeholder:text-[#999] resize-y"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6 pt-8 border-t border-[#e5e5e5]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="text-sm font-bold text-[#111] m-0 uppercase tracking-widest">
                Course Catalog
              </h3>
              <button
                type="button"
                onClick={addCourse}
                className="px-5 py-3 text-[10px] font-bold text-[#111] bg-[#f9f9f9] border border-[#e5e5e5] rounded-[14px] hover:bg-[#e5e5e5] hover:border-[#ccc] hover:-translate-y-0.5 transition-all duration-300 whitespace-nowrap cursor-pointer uppercase tracking-widest"
              >
                Add Course
              </button>
            </div>

            <div className="flex flex-col gap-5">
              {form.courses.length === 0 && (
                <div className="p-10 text-center bg-[#f9f9f9] border border-dashed border-[#e5e5e5] rounded-[24px]">
                  <p className="text-sm text-[#999] font-medium m-0">
                    No courses added yet.
                  </p>
                </div>
              )}

              {form.courses.map((course, index) => (
                <div
                  key={index}
                  className="bg-[#fff] border border-[#e5e5e5] p-6 rounded-[24px] flex flex-col gap-6 box-border transition-all hover:border-[#111]"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                        Course Name
                      </label>
                      <input
                        placeholder="e.g. Bachelor of Technology"
                        value={course.name}
                        onChange={(e) =>
                          updateCourse(index, "name", e.target.value)
                        }
                        className="w-full px-5 py-3.5 text-sm text-[#111] bg-[#fff] border border-[#e5e5e5] rounded-[14px] outline-none transition-all duration-300 focus:border-[#111] focus:ring-1 focus:ring-[#111] placeholder:text-[#999]"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                        Duration (Years)
                      </label>
                      <input
                        placeholder="e.g. 4"
                        type="number"
                        min="1"
                        value={course.durationYears}
                        onChange={(e) =>
                          updateCourse(index, "durationYears", e.target.value)
                        }
                        className="w-full px-5 py-3.5 text-sm text-[#111] bg-[#fff] border border-[#e5e5e5] rounded-[14px] outline-none transition-all duration-300 focus:border-[#111] focus:ring-1 focus:ring-[#111] placeholder:text-[#999]"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 pt-5 border-t border-[#e5e5e5]">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-[#111] uppercase tracking-widest">
                        Specializations
                      </span>
                      <button
                        type="button"
                        onClick={() => addSpecialization(index)}
                        className="text-[10px] font-bold text-[#111] bg-transparent border-none cursor-pointer hover:underline transition-all p-0 uppercase tracking-widest"
                      >
                        Add Specialization
                      </button>
                    </div>

                    <div className="flex flex-col gap-3">
                      {course.specializations.length === 0 && (
                        <p className="text-xs text-[#999] italic m-0">
                          None added
                        </p>
                      )}

                      {course.specializations.map((sp, sIndex) => (
                        <input
                          key={sIndex}
                          placeholder="e.g. Computer Science"
                          value={sp}
                          onChange={(e) =>
                            updateSpecialization(index, sIndex, e.target.value)
                          }
                          className="w-full px-5 py-3.5 text-sm text-[#111] bg-[#fff] border border-[#e5e5e5] rounded-[14px] outline-none transition-all duration-300 focus:border-[#111] focus:ring-1 focus:ring-[#111] placeholder:text-[#999]"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-8 border-t border-[#e5e5e5]">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 text-xs font-bold text-[#fff] bg-[#111] border border-[#111] rounded-[14px] cursor-pointer transition-all duration-300 hover:bg-[#333] hover:border-[#333] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest flex items-center justify-center gap-3"
            >
              {loading && (
                <span className="w-4 h-4 border-2 border-[#fff]/30 border-t-[#fff] rounded-full animate-spin"></span>
              )}
              {loading ? "Saving College..." : "Save College Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
