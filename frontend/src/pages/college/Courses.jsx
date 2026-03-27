import React, { useEffect, useState, useRef } from "react";
import API from "../../api/api";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  // Track which dropdown is currently open by ID
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const dropdownRef = useRef(null);

  const [form, setForm] = useState({ name: "", durationYears: "", credits: "" });
  const [specializationInput, setSpecializationInput] = useState("");
  const [specializations, setSpecializations] = useState([]);
  const [editingCourse, setEditingCourse] = useState(null);

  useEffect(() => {
    fetchCourses();
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const filtered = courses.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCourses(filtered);
  }, [searchTerm, courses]);

  const fetchCourses = async () => {
    try {
      const res = await API.get("/college/courses");
      const data = res.data?.data || [];
      setCourses(data);
      setFilteredCourses(data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const toggleDropdown = (id) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  const addSpecialization = () => {
    const value = specializationInput.trim();
    if (!value || specializations.includes(value)) return setSpecializationInput("");
    setSpecializations((prev) => [...prev, value]);
    setSpecializationInput("");
  };

  const removeSpecialization = (i) => {
    setSpecializations((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async () => {
    const payload = {
      name: form.name.trim(),
      durationYears: Number(form.durationYears),
      credits: Number(form.credits),
      specializations,
    };
    try {
      if (editingCourse) {
        await API.patch(`/college/courses/${editingCourse._id}`, payload);
      } else {
        await API.post("/college/courses", payload);
      }
      closeForm();
      fetchCourses();
    } catch (err) { alert(err.response?.data?.message || "Error"); }
  };

  const deleteCourse = async (id) => {
    if (!window.confirm("Delete this course?")) return;
    try {
      await API.delete(`/college/courses/${id}`);
      fetchCourses();
    } catch (err) { alert("Delete failed"); }
  };

  const startEdit = (c) => {
    setEditingCourse(c);
    setForm({ name: c.name, durationYears: c.durationYears, credits: c.credits });
    setSpecializations(c.specializations || []);
    setIsAdding(true);
  };

  const closeForm = () => {
    setForm({ name: "", durationYears: "", credits: "" });
    setSpecializations([]);
    setEditingCourse(null);
    setIsAdding(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center font-['Nunito']">
      <div className="w-10 h-10 border-4 border-[#6C5CE7]/20 border-t-[#6C5CE7] rounded-full animate-spin"></div>
    </div>
  );

  const inputClass = "w-full px-6 py-4 text-[14px] font-bold text-[#2D3436] bg-[#F5F6FA] border-2 border-transparent rounded-[20px] outline-none transition-all focus:border-[#6C5CE7] focus:bg-white placeholder:text-[#2D3436]/30";
  const labelClass = "text-[11px] font-black text-[#2D3436] opacity-40 uppercase tracking-[0.2em] mb-2 ml-1 block";

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#2D3436] font-['Nunito'] pb-12">
      <main className="max-w-7xl mx-auto w-full px-4 md:px-8 py-8">
        
        {!isAdding ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <h1 className="text-[36px] font-black tracking-tight text-[#2D3436]">Academic Catalog</h1>
                <p className="text-[#6C5CE7] font-black text-[12px] uppercase tracking-[0.25em] mt-1">Institutional Program Management</p>
              </div>
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <input 
                  type="text" 
                  placeholder="Search programs..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-6 py-3 bg-[#F5F6FA] border-2 border-transparent rounded-full text-[13px] font-bold outline-none focus:border-[#6C5CE7] transition-all w-full md:w-64"
                />
                <button 
                  onClick={() => setIsAdding(true)}
                  className="bg-[#6C5CE7] text-white px-8 py-4 rounded-[20px] font-black text-[14px] uppercase tracking-widest shadow-xl shadow-[#6C5CE7]/20 hover:-translate-y-1 transition-all w-full md:w-auto cursor-pointer"
                >
                  + Add Program
                </button>
              </div>
            </header>

            <div className="bg-[#F5F6FA] p-1 rounded-[32px] overflow-visible">
              <div className="bg-white rounded-[30px] overflow-visible shadow-sm">
                <div className="overflow-x-auto no-scrollbar" ref={dropdownRef}>
                  <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead>
                      <tr className="bg-[#F5F6FA]/50 border-b border-[#F5F6FA]">
                        <th className="px-8 py-6 text-[11px] font-black text-[#2D3436] opacity-40 uppercase tracking-[0.2em]">Course Name</th>
                        <th className="px-8 py-6 text-[11px] font-black text-[#2D3436] opacity-40 uppercase tracking-[0.2em]">Duration</th>
                        <th className="px-8 py-6 text-[11px] font-black text-[#2D3436] opacity-40 uppercase tracking-[0.2em] text-center">Credits</th>
                        <th className="px-8 py-6 text-[11px] font-black text-[#2D3436] opacity-40 uppercase tracking-[0.2em]">Specializations</th>
                        <th className="px-8 py-6 text-[11px] font-black text-[#2D3436] opacity-40 uppercase tracking-[0.2em] text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F5F6FA]">
                      {filteredCourses.map((c) => (
                        <tr key={c._id} className="group hover:bg-[#F5F6FA]/30 transition-all duration-300">
                          <td className="px-8 py-6 text-[15px] font-black text-[#2D3436]">{c.name}</td>
                          <td className="px-8 py-6">
                            <span className="bg-[#6C5CE7]/10 text-[#6C5CE7] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter">
                              {c.durationYears} Year Plan
                            </span>
                          </td>
                          <td className="px-8 py-6 text-[14px] font-bold text-[#2D3436] text-center">{c.credits}</td>
                          <td className="px-8 py-6 relative">
                            {/* ✅ CLICK-TO-TOGGLE DROPDOWN */}
                            <div className="relative inline-block">
                              <button 
                                onClick={() => toggleDropdown(c._id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                                  openDropdownId === c._id ? 'bg-[#6C5CE7] text-white' : 'bg-[#F5F6FA] hover:bg-[#6C5CE7]/10 text-[#2D3436]'
                                }`}
                              >
                                {c.specializations?.length || 0} Specializations 
                                <span className={`text-[8px] transition-transform duration-300 ${openDropdownId === c._id ? 'rotate-180' : ''}`}>▼</span>
                              </button>
                              
                              {openDropdownId === c._id && (
                                <div className="absolute left-0 mt-3 w-64 bg-white border-2 border-[#F5F6FA] rounded-[24px] shadow-2xl shadow-[#6C5CE7]/20 p-5 z-[100] animate-in fade-in zoom-in-95 duration-200">
                                  <div className="flex flex-col gap-2.5 max-h-56 overflow-y-auto pr-2 custom-scrollbar">
                                    {c.specializations?.length > 0 ? (
                                      c.specializations.map((s, idx) => (
                                        <div key={idx} className="text-[12px] font-bold text-[#2D3436] p-3 bg-[#F5F6FA] rounded-xl border-l-4 border-[#6C5CE7]">
                                          {s}
                                        </div>
                                      ))
                                    ) : (
                                      <span className="text-[11px] font-bold opacity-30 text-center py-4">No fields listed</span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex gap-4 justify-end">
                              <button onClick={() => startEdit(c)} className="text-[11px] font-black text-[#6C5CE7] hover:tracking-widest transition-all uppercase tracking-widest cursor-pointer">Edit</button>
                              <button onClick={() => deleteCourse(c._id)} className="text-[11px] font-black text-red-400 hover:text-red-600 transition-all uppercase tracking-widest cursor-pointer">Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* --- ADD/EDIT VIEW (Remains same for focused entry) --- */
          <div className="max-w-3xl mx-auto animate-in fade-in zoom-in duration-500">
            <button onClick={closeForm} className="mb-8 text-[12px] font-black text-[#6C5CE7] uppercase tracking-widest flex items-center gap-2 hover:gap-4 transition-all cursor-pointer">
              ← Back to Catalog
            </button>
            <div className="bg-white border-2 border-[#F5F6FA] p-10 md:p-14 rounded-[45px] shadow-2xl shadow-[#6C5CE7]/5">
              <h2 className="text-[32px] font-black mb-10 tracking-tight">
                {editingCourse ? "Update Program" : "New Program"}
              </h2>
              <div className="space-y-8">
                <div>
                  <label className={labelClass}>Course Name</label>
                  <input placeholder="e.g. B.Tech Computer Science" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className={inputClass} />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>Duration (Years)</label>
                    <input type="number" value={form.durationYears} onChange={(e) => setForm({...form, durationYears: e.target.value})} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Credits</label>
                    <input type="number" value={form.credits} onChange={(e) => setForm({...form, credits: e.target.value})} className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Add Specializations</label>
                  <div className="flex gap-3 mb-4">
                    <input placeholder="Press Enter to add" value={specializationInput} onChange={(e) => setSpecializationInput(e.target.value)} onKeyPress={(e) => e.key === "Enter" && addSpecialization()} className={inputClass} />
                    <button onClick={addSpecialization} className="bg-[#2D3436] text-white px-8 rounded-[20px] font-black text-[12px] uppercase tracking-widest hover:bg-[#6C5CE7] transition-all cursor-pointer">Add</button>
                  </div>
                  <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                    {specializations.map((s, i) => (
                      <span key={i} className="bg-[#F5F6FA] px-4 py-2 rounded-[14px] text-[11px] font-black flex items-center gap-3 border-2 border-transparent hover:border-[#6C5CE7]/30 transition-all animate-in fade-in slide-in-from-left-2">
                        {s}
                        <button onClick={() => removeSpecialization(i)} className="text-red-400 hover:text-red-600 font-black cursor-pointer">✕</button>
                      </span>
                    ))}
                  </div>
                </div>
                <div className="pt-10 flex gap-4">
                  <button onClick={handleSubmit} className="flex-1 bg-[#6C5CE7] text-white py-5 rounded-[25px] font-black uppercase tracking-widest shadow-lg shadow-[#6C5CE7]/20 hover:-translate-y-1 transition-all cursor-pointer">
                    {editingCourse ? "Update Program" : "Save Program"}
                  </button>
                  <button onClick={closeForm} className="px-10 py-5 border-2 border-[#F5F6FA] rounded-[25px] font-black uppercase tracking-widest hover:bg-[#F5F6FA] transition-all cursor-pointer">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}