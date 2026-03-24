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
    <div className="min-h-screen bg-[#f9f9f9] p-4 md:p-12 font-sans box-border text-[#111]">
      <div className="max-w-5xl mx-auto bg-[#fff] p-8 md:p-12 rounded-[24px] shadow-sm border border-[#e5e5e5] transition-all duration-300 hover:border-[#ccc]">
        <header className="mb-12 text-center md:text-left border-b border-[#e5e5e5] pb-8">
          <div className="text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-[0.2em] mb-3">
            Provisioning Terminal
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-[#111] m-0 tracking-tighter uppercase">
            Invite Students
          </h2>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-[0.15em] ml-1">
              Academic Program
            </label>
            {isFaculty ? (
              <input
                className="w-full px-5 py-4 text-[13px] font-medium text-[#555] bg-[#f9f9f9] border border-[#e5e5e5] rounded-[14px] outline-none cursor-not-allowed italic"
                value={form.courseName}
                disabled
              />
            ) : (
              <div className="relative">
                <select
                  className="w-full px-5 py-4 text-[13px] font-medium text-[#111] bg-[#fff] border border-[#e5e5e5] rounded-[14px] outline-none transition-all duration-300 focus:border-[#111] focus:ring-1 focus:ring-[#111] shadow-sm cursor-pointer appearance-none"
                  value={form.courseName}
                  onChange={(e) => handleCourseChange(e.target.value)}
                >
                  <option value="" className="text-[#999]">
                    Select Course
                  </option>
                  {courses.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#999]">
                  ▼
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-[0.15em] ml-1">
              Specialization
            </label>
            {isFaculty ? (
              <input
                className="w-full px-5 py-4 text-[13px] font-medium text-[#555] bg-[#f9f9f9] border border-[#e5e5e5] rounded-[14px] outline-none cursor-not-allowed italic"
                value={form.specialization}
                disabled
              />
            ) : (
              <div className="relative">
                <select
                  className="w-full px-5 py-4 text-[13px] font-medium text-[#111] bg-[#fff] border border-[#e5e5e5] rounded-[14px] outline-none transition-all duration-300 focus:border-[#111] focus:ring-1 focus:ring-[#111] shadow-sm cursor-pointer appearance-none disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[#f9f9f9]"
                  value={form.specialization}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      specialization: e.target.value,
                    }))
                  }
                  disabled={!form.courseName}
                >
                  <option value="" className="text-[#999]">
                    Select Specialization
                  </option>
                  {specializations.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#999]">
                  ▼
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-[0.15em] ml-1">
              Cycle Start
            </label>
            <div className="relative">
              <select
                className="w-full px-5 py-4 text-[13px] font-medium text-[#111] bg-[#fff] border border-[#e5e5e5] rounded-[14px] outline-none transition-all duration-300 focus:border-[#111] focus:ring-1 focus:ring-[#111] shadow-sm cursor-pointer appearance-none"
                value={form.courseStartYear}
                onChange={(e) => handleStartYearChange(e.target.value)}
              >
                <option value="" className="text-[#999]">
                  Start Year
                </option>
                {startYearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#999]">
                ▼
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-[0.15em] ml-1">
              Cycle End (Calculated)
            </label>
            <input
              className="w-full px-5 py-4 text-[13px] font-medium text-[#555] bg-[#f9f9f9] border border-[#e5e5e5] rounded-[14px] outline-none cursor-not-allowed italic"
              value={form.courseEndYear || "Auto"}
              disabled
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-[0.15em] ml-1">
              Current Year Level
            </label>
            <div className="relative">
              <select
                className="w-full px-5 py-4 text-[13px] font-medium text-[#111] bg-[#fff] border border-[#e5e5e5] rounded-[14px] outline-none transition-all duration-300 focus:border-[#111] focus:ring-1 focus:ring-[#111] shadow-sm cursor-pointer appearance-none"
                value={form.Year}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, Year: e.target.value }))
                }
              >
                <option value="" className="text-[#999]">
                  Year
                </option>
                {YearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#999]">
                ▼
              </div>
            </div>
          </div>
        </div>

        <div className="flex bg-[#f9f9f9] p-1.5 rounded-[14px] border border-[#e5e5e5] w-fit mb-8">
          <button
            className={`px-8 py-2.5 rounded-[10px] text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 outline-none cursor-pointer ${mode === "count" ? "bg-[#111] text-[#fff] shadow-sm" : "text-[#555] hover:text-[#111] bg-transparent border-none"}`}
            onClick={() => setMode("count")}
          >
            Manual Matrix
          </button>
          <button
            className={`px-8 py-2.5 rounded-[10px] text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 outline-none cursor-pointer ${mode === "csv" ? "bg-[#111] text-[#fff] shadow-sm" : "text-[#555] hover:text-[#111] bg-transparent border-none"}`}
            onClick={() => setMode("csv")}
          >
            Bulk CSV Upload
          </button>
        </div>

        {mode === "csv" && (
          <div className="flex flex-col md:flex-row items-center gap-6 mb-8 p-8 bg-[#f9f9f9] border-2 border-[#e5e5e5] border-dashed rounded-[24px]">
            <button
              className="px-6 py-3 text-[10px] font-black text-[#111] bg-[#fff] border border-[#e5e5e5] rounded-[12px] hover:bg-[#f9f9f9] hover:border-[#ccc] transition-all uppercase tracking-widest whitespace-nowrap outline-none cursor-pointer"
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
                className="w-full flex-1 flex items-center justify-center px-6 py-3 bg-[#fff] border border-[#e5e5e5] rounded-[14px] text-[10px] font-black uppercase tracking-[0.15em] text-[#555] cursor-pointer hover:bg-[#f9f9f9] transition-all shadow-sm"
              >
                {fileName || "Select CSV File"}
              </label>
              {fileName && (
                <button
                  onClick={removeFile}
                  className="px-4 py-3 text-[#991b1b] bg-[#fff] border border-[#fecaca] rounded-[14px] text-[10px] font-black uppercase tracking-[0.15em] hover:bg-[#fef2f2] transition-all cursor-pointer outline-none"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        )}

        {mode === "count" && (
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-8 p-8 bg-[#f9f9f9] border border-[#e5e5e5] rounded-[24px] shadow-sm">
            <input
              className="w-full sm:w-64 px-5 py-3.5 text-[13px] font-medium text-[#111] bg-[#fff] border border-[#e5e5e5] rounded-[14px] outline-none focus:border-[#111] focus:ring-1 focus:ring-[#111] transition-all placeholder:text-[#999] shadow-sm"
              type="number"
              placeholder="Quantity of students"
              value={count}
              onChange={(e) => setCount(e.target.value)}
            />
            <button
              className="w-full sm:w-auto px-10 py-3.5 text-[10px] font-black text-[#fff] bg-[#111] border border-[#111] rounded-[14px] hover:bg-[#333] hover:border-[#333] transition-all uppercase tracking-[0.2em] outline-none cursor-pointer"
              onClick={generateRows}
            >
              Generate Map
            </button>
          </div>
        )}

        {errorRows > 0 && (
          <div className="mb-8 px-6 py-4 text-[11px] font-bold text-[#991b1b] bg-[#fef2f2] border border-[#fecaca] rounded-[14px] uppercase tracking-widest text-center animate-pulse">
            Validation Failed: {errorRows} record{errorRows > 1 ? "s" : ""}{" "}
            require attention.
          </div>
        )}

        {rows.length > 0 && (
          <div className="space-y-8">
            <div className="bg-[#fff] border border-[#e5e5e5] rounded-[24px] overflow-hidden shadow-sm w-full max-w-full">
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left border-collapse whitespace-nowrap min-w-max">
                  <thead className="bg-[#f9f9f9] border-b border-[#e5e5e5]">
                    <tr>
                      <th className="px-6 py-5 text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-[0.15em] w-16 text-center">
                        ID
                      </th>
                      <th className="px-6 py-5 text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-[0.15em]">
                        Email Address
                      </th>
                      <th className="px-6 py-5 text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-[0.15em]">
                        Full Name
                      </th>
                      <th className="px-6 py-5 text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-[0.15em] text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5e5e5]">
                    {rows.map((row, i) => (
                      <tr
                        key={i}
                        className="hover:bg-[#fcfcfc] transition-colors duration-300 group"
                      >
                        <td className="px-6 py-5 text-[11px] font-bold text-[#999] text-center">
                          {i + 1}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1.5">
                            <input
                              className={`bg-[#f9f9f9] border px-4 py-2.5 rounded-[10px] text-[13px] font-medium text-[#111] outline-none transition-all focus:ring-1 focus:ring-[#111] ${row.errors?.email ? "border-[#fecaca] bg-[#fef2f2]" : "border-[#e5e5e5]"}`}
                              value={row.email}
                              onChange={(e) =>
                                updateRow(i, "email", e.target.value)
                              }
                              placeholder="student@uplink.edu"
                            />
                            {row.errors?.email && (
                              <span className="text-[9px] font-black text-[#991b1b] uppercase tracking-widest ml-1">
                                ERR: {row.errors.email}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1.5">
                            <input
                              className={`bg-[#f9f9f9] border px-4 py-2.5 rounded-[10px] text-[13px] font-medium text-[#111] outline-none transition-all focus:ring-1 focus:ring-[#111] ${row.errors?.fullName ? "border-[#fecaca] bg-[#fef2f2]" : "border-[#e5e5e5]"}`}
                              value={row.fullName}
                              onChange={(e) =>
                                updateRow(i, "fullName", e.target.value)
                              }
                              placeholder="Name"
                            />
                            {row.errors?.fullName && (
                              <span className="text-[9px] font-black text-[#991b1b] uppercase tracking-widest ml-1">
                                ERR: {row.errors.fullName}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            className="p-2 text-[#999] hover:text-[#991b1b] transition-colors outline-none bg-transparent border-none cursor-pointer text-[10px] font-black uppercase tracking-widest"
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

            <div className="flex justify-end pt-4">
              <button
                className="w-full md:w-auto px-12 py-5 text-[11px] font-black text-[#fff] bg-[#111] border border-[#111] rounded-[16px] cursor-pointer transition-all duration-300 hover:bg-[#333] hover:border-[#333] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-[0.2em] flex items-center justify-center gap-4 outline-none"
                onClick={submitBulk}
                disabled={loading || errorRows > 0}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#fff]/30 border-t-[#fff] rounded-full animate-spin" />
                    Transmitting...
                  </>
                ) : (
                  `Execute ${rows.length} Invitations`
                )}
              </button>
            </div>
          </div>
        )}

        {progress.total > 0 && (
          <div className="mt-12 p-8 bg-[#f9f9f9] border border-[#e5e5e5] rounded-[24px] shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-6">
              <div className="flex gap-8">
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-[#555] uppercase tracking-widest mb-1">
                    Payload
                  </span>
                  <span className="text-[20px] font-black text-[#111]">
                    {progress.total}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-[#166534] uppercase tracking-widest mb-1">
                    Delivered
                  </span>
                  <span className="text-[20px] font-black text-[#166534]">
                    {progress.success}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-[#991b1b] uppercase tracking-widest mb-1">
                    Dropped
                  </span>
                  <span className="text-[20px] font-black text-[#991b1b]">
                    {progress.failed}
                  </span>
                </div>
              </div>
              <div className="text-[10px] font-black text-[#111] uppercase tracking-[0.15em] bg-[#fff] px-4 py-2 rounded-[10px] border border-[#e5e5e5]">
                {progressPercent}% Total Uplink
              </div>
            </div>

            <div className="w-full bg-[#e5e5e5] rounded-full h-2 overflow-hidden">
              <div
                className="bg-[#111] h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
