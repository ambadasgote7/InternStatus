import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import Papa from "papaparse";
import API from "../../api/api";

const STORAGE_KEY = "invite_students_state";

export default function InviteStudent() {
  const currentUser = useSelector((state) => state.user.user);
  const profile = useSelector((state) => state.user.profile);

  const isFaculty = currentUser?.role === "faculty";

  const [courses, setCourses] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [coursesLoaded, setCoursesLoaded] = useState(false);
  const hasRestored = useRef(false);

  const [form, setForm] = useState({
    courseName: "",
    specialization: "",
    courseStartYear: "",
    courseEndYear: "",
    Year: "",
  });

  const [mode, setMode] = useState("count");
  const [count, setCount] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const [progress, setProgress] = useState({
    total: 0,
    sent: 0,
    success: 0,
    failed: 0,
  });

  const [fileName, setFileName] = useState("");

  const startYearOptions = Array.from({ length: 11 }).map((_, i) => 2020 + i);

  const selectedCourse = courses.find((c) => c.name === form.courseName);
  const duration = selectedCourse?.duration || 4;

  const YearOptions = Array.from({ length: duration }, (_, i) => i + 1);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateRows = (data) => {
    const seen = new Set();

    return data.map((row) => {
      const errors = {};
      const email = row.email?.trim() || "";
      const fullName = row.fullName?.trim() || "";

      if (!email) errors.email = "Required";
      else if (!isValidEmail(email)) errors.email = "Invalid Format";

      if (!fullName) errors.fullName = "Required";

      if (email) {
        const lower = email.toLowerCase();
        if (seen.has(lower)) errors.email = "Duplicate";
        else seen.add(lower);
      }

      return { email, fullName, errors };
    });
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await API.get("/college/courses");
      setCourses(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setCoursesLoaded(true);
    }
  };

  useEffect(() => {
    if (!coursesLoaded || hasRestored.current) return;
    hasRestored.current = true;

    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);
      setForm(parsed.form || {});
      setRows(parsed.rows || []);
      setMode(parsed.mode || "count");
      setCount(parsed.count || "");
      setFileName(parsed.fileName || "");
    } catch (err) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [coursesLoaded]);

  useEffect(() => {
    if (!hasRestored.current) return;
    const data = { rows, form, mode, count, fileName };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [rows, form, mode, count, fileName]);

  useEffect(() => {
    if (!form.courseName) return;
    const selected = courses.find((c) => c.name === form.courseName);
    setSpecializations(selected?.specializations || []);
  }, [form.courseName, courses]);

  useEffect(() => {
    if (isFaculty && profile && !form.courseName) {
      setForm((prev) => ({
        ...prev,
        courseName: profile.courseName || "",
        specialization: profile.department || "",
      }));
    }
  }, [isFaculty, profile]);

  const handleCourseChange = (courseName) => {
    const selected = courses.find((c) => c.name === courseName);
    setForm((prev) => ({
      ...prev,
      courseName,
      specialization: "",
      courseStartYear: "",
      courseEndYear: "",
      Year: "",
    }));
    setSpecializations(selected?.specializations || []);
  };

  const handleStartYearChange = (year) => {
    const start = Number(year);
    const end = start + duration;
    setForm((prev) => ({
      ...prev,
      courseStartYear: start,
      courseEndYear: end,
    }));
  };

  const generateRows = () => {
    const num = Number(count);
    if (!num || num <= 0) return;
    const arr = Array.from({ length: num }, () => ({
      email: "",
      fullName: "",
    }));
    setRows(validateRows(arr));
  };

  const updateRow = (i, field, value) => {
    const updated = [...rows];
    updated[i] = { ...updated[i], [field]: value };
    setRows(validateRows(updated));
  };

  const removeRow = (i) => {
    const updated = rows.filter((_, idx) => idx !== i);
    setRows(validateRows(updated));
  };

  const downloadTemplate = () => {
    const csv = "email,full name\nstudent@example.com,John Doe";
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "student_invite_template.csv";
    link.click();
  };

  const handleCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().toLowerCase(),
      complete: (results) => {
        const formatted = results.data.map((r) => ({
          email: r.email || "",
          fullName: r["full name"] || r.fullname || r.name || "",
        }));
        setRows(validateRows(formatted));
      },
    });
  };

  const removeFile = () => {
    setRows([]);
    setFileName("");
  };

  const submitBulk = async () => {
    const Year = parseInt(form.Year, 10);
    const courseStartYear = parseInt(form.courseStartYear, 10);
    const courseEndYear = parseInt(form.courseEndYear, 10);

    if (!form.courseName) {
      alert("Select a course");
      return;
    }
    if (!courseStartYear || isNaN(courseStartYear)) {
      alert("Select course start year");
      return;
    }
    if (!Year || isNaN(Year) || Year <= 0) {
      alert("Select academic year");
      return;
    }

    const hasErrors = rows.some((r) => Object.keys(r.errors || {}).length > 0);
    if (hasErrors) {
      alert("Fix all errors");
      return;
    }

    try {
      setLoading(true);

      const payload = rows.map((r) => ({
        email: r.email.trim(),
        fullName: r.fullName.trim(),
        courseName: form.courseName,
        specialization: form.specialization || undefined,
        courseStartYear,
        courseEndYear,
        Year,
      }));

      setProgress({
        total: payload.length,
        sent: payload.length,
        success: 0,
        failed: 0,
      });

      const res = await API.post("/users/student/invite", payload);

      const successCount = res.data?.successCount || payload.length;
      const failedCount = payload.length - successCount;

      setProgress((prev) => ({
        ...prev,
        success: successCount,
        failed: failedCount,
      }));

      alert("Invite completed");
      setRows([]);
      setCount("");
      setFileName("");
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      alert(err.response?.data?.message || "Invite failed");
    } finally {
      setLoading(false);
    }
  };

  const errorRows = rows.filter(
    (r) => Object.keys(r.errors || {}).length > 0,
  ).length;
  const progressPercent =
    progress.total === 0
      ? 0
      : Math.round((progress.success / progress.total) * 100);

  return (
    <div className="min-h-screen bg-[#FFFFFF] p-4 md:p-12 font-['Nunito'] box-border text-[#2D3436] transition-all duration-300 selection:bg-[#6C5CE7]/20 selection:text-[#6C5CE7]">
      <div className="max-w-5xl mx-auto bg-[#FFFFFF] p-8 md:p-12 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-[#F5F6FA] transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
        <header className="mb-12 text-center md:text-left border-b border-[#F5F6FA] pb-8">
          <div className="text-[11px] font-black text-[#6C5CE7] uppercase tracking-[0.2em] mb-3">
            Provisioning Terminal
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-[#2D3436] m-0 tracking-tighter uppercase">
            Invite Students
          </h2>
        </header>

        {/* --- ACADEMIC CONTEXT --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 group">
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-[0.15em] px-1">
              Academic Program
            </label>
            {isFaculty ? (
              <input
                className="w-full px-5 py-4 text-[14px] font-bold text-[#2D3436] opacity-60 bg-[#F5F6FA] border border-transparent rounded-[16px] outline-none cursor-not-allowed italic"
                value={form.courseName}
                disabled
              />
            ) : (
              <div className="relative">
                <select
                  className="w-full px-5 py-4 text-[14px] font-bold text-[#2D3436] bg-[#F5F6FA] border border-transparent rounded-[16px] outline-none transition-all duration-300 focus:bg-[#FFFFFF] focus:border-[#6C5CE7] focus:ring-4 focus:ring-[#6C5CE7]/10 shadow-sm cursor-pointer appearance-none hover:border-[#6C5CE7]/30"
                  value={form.courseName}
                  onChange={(e) => handleCourseChange(e.target.value)}
                >
                  <option value="" className="text-[#2D3436] opacity-40">
                    Select Course
                  </option>
                  {courses.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-[#2D3436] opacity-40 font-black text-[10px]">
                  ▼
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-[0.15em] px-1">
              Specialization
            </label>
            {isFaculty ? (
              <input
                className="w-full px-5 py-4 text-[14px] font-bold text-[#2D3436] opacity-60 bg-[#F5F6FA] border border-transparent rounded-[16px] outline-none cursor-not-allowed italic"
                value={form.specialization}
                disabled
              />
            ) : (
              <div className="relative">
                <select
                  className="w-full px-5 py-4 text-[14px] font-bold text-[#2D3436] bg-[#F5F6FA] border border-transparent rounded-[16px] outline-none transition-all duration-300 focus:bg-[#FFFFFF] focus:border-[#6C5CE7] focus:ring-4 focus:ring-[#6C5CE7]/10 shadow-sm cursor-pointer appearance-none hover:border-[#6C5CE7]/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-transparent"
                  value={form.specialization}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      specialization: e.target.value,
                    }))
                  }
                  disabled={!form.courseName}
                >
                  <option value="" className="text-[#2D3436] opacity-40">
                    Select Specialization
                  </option>
                  {specializations.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-[#2D3436] opacity-40 font-black text-[10px]">
                  ▼
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-[0.15em] px-1">
              Cycle Start
            </label>
            <div className="relative">
              <select
                className="w-full px-5 py-4 text-[14px] font-bold text-[#2D3436] bg-[#F5F6FA] border border-transparent rounded-[16px] outline-none transition-all duration-300 focus:bg-[#FFFFFF] focus:border-[#6C5CE7] focus:ring-4 focus:ring-[#6C5CE7]/10 shadow-sm cursor-pointer appearance-none hover:border-[#6C5CE7]/30"
                value={form.courseStartYear}
                onChange={(e) => handleStartYearChange(e.target.value)}
              >
                <option value="" className="text-[#2D3436] opacity-40">
                  Start Year
                </option>
                {startYearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-[#2D3436] opacity-40 font-black text-[10px]">
                ▼
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-[0.15em] px-1">
              Cycle End (Calculated)
            </label>
            <input
              className="w-full px-5 py-4 text-[14px] font-bold text-[#2D3436] opacity-60 bg-[#F5F6FA] border border-transparent rounded-[16px] outline-none cursor-not-allowed italic"
              value={form.courseEndYear || "Auto"}
              disabled
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-[0.15em] px-1">
              Current Year Level
            </label>
            <div className="relative">
              <select
                className="w-full px-5 py-4 text-[14px] font-bold text-[#2D3436] bg-[#F5F6FA] border border-transparent rounded-[16px] outline-none transition-all duration-300 focus:bg-[#FFFFFF] focus:border-[#6C5CE7] focus:ring-4 focus:ring-[#6C5CE7]/10 shadow-sm cursor-pointer appearance-none hover:border-[#6C5CE7]/30"
                value={form.Year}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, Year: e.target.value }))
                }
              >
                <option value="" className="text-[#2D3436] opacity-40">
                  Year
                </option>
                {YearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-[#2D3436] opacity-40 font-black text-[10px]">
                ▼
              </div>
            </div>
          </div>
        </div>

        {/* --- INPUT MODE SELECTOR --- */}
        <div className="flex bg-[#F5F6FA] p-1.5 rounded-[16px] border border-transparent shadow-sm w-max mb-8 mx-auto md:mx-0">
          <button
            className={`px-8 py-3 rounded-[12px] text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 outline-none cursor-pointer ${mode === "count" ? "bg-[#6C5CE7] text-[#FFFFFF] shadow-md transform -translate-y-0.5" : "text-[#2D3436] opacity-50 hover:opacity-100 hover:bg-[#FFFFFF] bg-transparent border-none"}`}
            onClick={() => setMode("count")}
          >
            Manual Matrix
          </button>
          <button
            className={`px-8 py-3 rounded-[12px] text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 outline-none cursor-pointer ${mode === "csv" ? "bg-[#6C5CE7] text-[#FFFFFF] shadow-md transform -translate-y-0.5" : "text-[#2D3436] opacity-50 hover:opacity-100 hover:bg-[#FFFFFF] bg-transparent border-none"}`}
            onClick={() => setMode("csv")}
          >
            Bulk CSV Upload
          </button>
        </div>

        {/* --- CSV UPLOAD MODE --- */}
        {mode === "csv" && (
          <div className="flex flex-col md:flex-row items-center gap-6 mb-8 p-10 bg-[#F5F6FA] border-2 border-[#6C5CE7]/20 border-dashed rounded-[32px] hover:border-[#6C5CE7]/50 transition-colors duration-300 animate-in fade-in">
            <button
              className="px-8 py-4 text-[11px] font-black text-[#6C5CE7] bg-[#FFFFFF] border border-transparent rounded-[16px] hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 uppercase tracking-widest whitespace-nowrap outline-none cursor-pointer shadow-sm"
              onClick={downloadTemplate}
            >
              Get Template
            </button>

            <div className="flex-1 flex flex-col sm:flex-row items-center gap-4 w-full">
              <input
                type="file"
                id="csv-upload"
                accept=".csv"
                onChange={handleCSV}
                className="hidden"
              />
              <label
                htmlFor="csv-upload"
                className={`w-full flex-1 flex items-center justify-center px-8 py-4 bg-[#FFFFFF] border border-transparent rounded-[16px] text-[11px] font-black uppercase tracking-[0.15em] cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 shadow-sm ${fileName ? "text-[#6C5CE7]" : "text-[#2D3436] opacity-60"}`}
              >
                {fileName || "Select CSV File"}
              </label>
              {fileName && (
                <button
                  onClick={removeFile}
                  className="px-6 py-4 text-rose-600 bg-rose-50 border border-rose-200 rounded-[16px] text-[11px] font-black uppercase tracking-[0.15em] hover:bg-rose-100 transition-all cursor-pointer outline-none shadow-sm hover:-translate-y-0.5"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        )}

        {/* --- MANUAL MODE --- */}
        {mode === "count" && (
          <div className="flex flex-col sm:flex-row items-center gap-5 mb-8 p-10 bg-[#F5F6FA] border border-transparent rounded-[32px] shadow-sm animate-in fade-in">
            <input
              className="w-full sm:w-72 px-6 py-4 text-[14px] font-bold text-[#2D3436] bg-[#FFFFFF] border border-transparent rounded-[16px] outline-none focus:border-[#6C5CE7] focus:ring-4 focus:ring-[#6C5CE7]/10 transition-all placeholder-[#2D3436] placeholder-opacity-30 shadow-sm"
              type="number"
              placeholder="Quantity of students"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              min="1"
            />
            <button
              className="w-full sm:w-auto px-10 py-4 text-[11px] font-black text-[#FFFFFF] bg-[#6C5CE7] border-none rounded-[16px] hover:shadow-[0_8px_20px_rgba(108,92,231,0.3)] hover:-translate-y-0.5 transition-all duration-300 uppercase tracking-[0.2em] outline-none cursor-pointer shadow-md active:scale-95"
              onClick={generateRows}
            >
              Generate Map
            </button>
          </div>
        )}

        {/* --- ERROR ALERT --- */}
        {errorRows > 0 && (
          <div className="mb-8 px-8 py-5 text-[12px] font-black text-rose-600 bg-rose-50 border border-rose-200 rounded-[16px] uppercase tracking-widest text-center shadow-sm animate-in fade-in zoom-in">
            Validation Failed: {errorRows} record{errorRows > 1 ? "s" : ""}{" "}
            require attention.
          </div>
        )}

        {/* --- DATA TABLE --- */}
        {rows.length > 0 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="bg-[#FFFFFF] border border-[#F5F6FA] rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full max-w-full">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse whitespace-nowrap min-w-max">
                  <thead className="bg-[#F5F6FA] border-b border-[#F5F6FA]">
                    <tr>
                      <th className="px-8 py-6 text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-[0.15em] w-16 text-center">
                        ID
                      </th>
                      <th className="px-8 py-6 text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-[0.15em]">
                        Email Address
                      </th>
                      <th className="px-8 py-6 text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-[0.15em]">
                        Full Name
                      </th>
                      <th className="px-8 py-6 text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-[0.15em] text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F5F6FA]">
                    {rows.map((row, i) => (
                      <tr
                        key={i}
                        className="hover:bg-[#F5F6FA]/30 transition-colors duration-300 group"
                      >
                        <td className="px-8 py-6 text-[12px] font-black text-[#2D3436] opacity-40 text-center">
                          {i + 1}
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex flex-col gap-2">
                            <input
                              className={`bg-[#F5F6FA] border px-5 py-3 rounded-[14px] text-[14px] font-bold text-[#2D3436] outline-none transition-all duration-300 focus:bg-[#FFFFFF] focus:ring-4 ${row.errors?.email ? "border-rose-300 bg-rose-50 focus:ring-rose-100" : "border-transparent focus:border-[#6C5CE7] focus:ring-[#6C5CE7]/10"}`}
                              value={row.email}
                              onChange={(e) =>
                                updateRow(i, "email", e.target.value)
                              }
                              placeholder="student@uplink.edu"
                            />
                            {row.errors?.email && (
                              <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest ml-2 animate-in fade-in">
                                ERR: {row.errors.email}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex flex-col gap-2">
                            <input
                              className={`bg-[#F5F6FA] border px-5 py-3 rounded-[14px] text-[14px] font-bold text-[#2D3436] outline-none transition-all duration-300 focus:bg-[#FFFFFF] focus:ring-4 ${row.errors?.fullName ? "border-rose-300 bg-rose-50 focus:ring-rose-100" : "border-transparent focus:border-[#6C5CE7] focus:ring-[#6C5CE7]/10"}`}
                              value={row.fullName}
                              onChange={(e) =>
                                updateRow(i, "fullName", e.target.value)
                              }
                              placeholder="Name"
                            />
                            {row.errors?.fullName && (
                              <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest ml-2 animate-in fade-in">
                                ERR: {row.errors.fullName}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <button
                            className="p-3 text-[#2D3436] opacity-40 hover:opacity-100 hover:text-rose-600 hover:bg-rose-50 rounded-[12px] transition-all duration-300 outline-none cursor-pointer text-[10px] font-black uppercase tracking-widest border border-transparent hover:border-rose-200"
                            onClick={() => removeRow(i)}
                          >
                            Purge
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-6">
              <button
                className="w-full md:w-auto px-14 py-5 text-[12px] font-black text-[#FFFFFF] bg-[#6C5CE7] border-none rounded-[16px] cursor-pointer transition-all duration-300 hover:shadow-[0_12px_24px_-8px_rgba(108,92,231,0.6)] hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-[0.2em] flex items-center justify-center gap-4 outline-none shadow-md"
                onClick={submitBulk}
                disabled={loading || errorRows > 0}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-[#FFFFFF]/30 border-t-[#FFFFFF] rounded-full animate-spin" />
                    Transmitting...
                  </>
                ) : (
                  `Execute ${rows.length} Invitations`
                )}
              </button>
            </div>
          </div>
        )}

        {/* --- PROGRESS HUD --- */}
        {progress.total > 0 && (
          <div className="mt-12 p-10 bg-[#FFFFFF] border border-[#F5F6FA] rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-in slide-in-from-bottom-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-8 mb-8">
              <div className="flex flex-wrap gap-10">
                <div className="flex flex-col bg-[#F5F6FA] p-4 rounded-[16px] min-w-[120px]">
                  <span className="text-[10px] font-black text-[#2D3436] opacity-50 uppercase tracking-widest mb-2">
                    Payload
                  </span>
                  <span className="text-[28px] font-black text-[#2D3436]">
                    {progress.total}
                  </span>
                </div>
                <div className="flex flex-col bg-emerald-50 p-4 rounded-[16px] min-w-[120px] border border-emerald-100">
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">
                    Delivered
                  </span>
                  <span className="text-[28px] font-black text-emerald-600">
                    {progress.success}
                  </span>
                </div>
                <div className="flex flex-col bg-rose-50 p-4 rounded-[16px] min-w-[120px] border border-rose-100">
                  <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-2">
                    Dropped
                  </span>
                  <span className="text-[28px] font-black text-rose-600">
                    {progress.failed}
                  </span>
                </div>
              </div>
              <div className="text-[11px] font-black text-[#6C5CE7] uppercase tracking-[0.2em] bg-[#F5F6FA] px-6 py-3 rounded-[14px] border border-transparent shadow-sm">
                {progressPercent}% Total Uplink
              </div>
            </div>

            <div className="w-full bg-[#F5F6FA] rounded-full h-3 overflow-hidden shadow-inner">
              <div
                className="bg-[#6C5CE7] h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                style={{ width: `${progressPercent}%` }}
              >
                {/* Optional subtle shimmer effect on progress bar */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FFFFFF]/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
