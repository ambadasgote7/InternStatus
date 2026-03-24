import React, { useEffect, useState, useRef } from "react";
import FacultyNavBar from "../../components/navbars/FacultyNavBar";
import API from "../../api/api";

const FacultyDashboard = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  const tableRef = useRef(null);

  // ================= FETCH =================
  const fetchData = async () => {
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
    fetchData();
  }, []);

  // ================= STATS =================
  const total = students.length;

  const completed = students.filter((s) => s.status === "completed").length;

  const ongoing = students.filter((s) => s.status === "active").length;

  const pending = students.filter((s) => s.status === "pending").length;

  // ================= SCROLL =================
  const scrollToTable = () => {
    setTimeout(() => {
      tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f9f9f9]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#e5e5e5] border-t-[#111] rounded-full animate-spin"></div>
          <p className="text-[#111] font-bold tracking-widest uppercase text-[10px] animate-pulse m-0">
            Initializing Dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#111] font-sans pb-12">
      <FacultyNavBar />

      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        {/* HEADER */}
        <header className="border-b border-[#e5e5e5] pb-6">
          <div className="text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-[0.2em] mb-2">
            Overview
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-[#111] m-0 tracking-tighter uppercase">
            Faculty Dashboard
          </h1>
        </header>

        {/* ================= STATS ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            onClick={scrollToTable}
            className="bg-[#fff] border border-[#e5e5e5] p-8 rounded-[24px] shadow-sm transition-all duration-300 cursor-pointer flex flex-col gap-2 hover:border-[#111] hover:-translate-y-1 hover:shadow-md"
          >
            <p className="text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-[0.15em] m-0">
              Total Students
            </p>
            <h2 className="text-[40px] font-black text-[#111] m-0 leading-none">
              {total}
            </h2>
          </div>

          <div
            onClick={scrollToTable}
            className="bg-[#fff] border border-[#e5e5e5] p-8 rounded-[24px] shadow-sm transition-all duration-300 cursor-pointer flex flex-col gap-2 hover:border-[#111] hover:-translate-y-1 hover:shadow-md"
          >
            <p className="text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-[0.15em] m-0">
              Completed
            </p>
            <h2 className="text-[40px] font-black text-[#166534] m-0 leading-none">
              {completed}
            </h2>
          </div>

          <div
            onClick={scrollToTable}
            className="bg-[#fff] border border-[#e5e5e5] p-8 rounded-[24px] shadow-sm transition-all duration-300 cursor-pointer flex flex-col gap-2 hover:border-[#111] hover:-translate-y-1 hover:shadow-md"
          >
            <p className="text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-[0.15em] m-0">
              Ongoing
            </p>
            <h2 className="text-[40px] font-black text-[#1d4ed8] m-0 leading-none">
              {ongoing}
            </h2>
          </div>

          <div
            onClick={scrollToTable}
            className="bg-[#fff] border border-[#e5e5e5] p-8 rounded-[24px] shadow-sm transition-all duration-300 cursor-pointer flex flex-col gap-2 hover:border-[#111] hover:-translate-y-1 hover:shadow-md"
          >
            <p className="text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-[0.15em] m-0">
              Pending
            </p>
            <h2 className="text-[40px] font-black text-[#991b1b] m-0 leading-none">
              {pending}
            </h2>
          </div>
        </div>

        {/* ================= TABLE ================= */}
        <div
          ref={tableRef}
          className="bg-[#fff] border border-[#e5e5e5] p-8 rounded-[24px] shadow-sm scroll-mt-6"
        >
          <h2 className="text-[12px] font-black text-[#111] uppercase tracking-widest border-l-4 border-[#111] pl-3 m-0 mb-6">
            Students List
          </h2>

          <div className="overflow-x-auto rounded-[14px] border border-[#e5e5e5]">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead className="bg-[#f9f9f9] border-b border-[#e5e5e5]">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                    Name
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                    PRN
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                    Course
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                    Year
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#e5e5e5]">
                {students.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-12 text-center text-[12px] font-bold text-[#999] uppercase tracking-widest"
                    >
                      No Students Found
                    </td>
                  </tr>
                ) : (
                  students.map((s) => (
                    <tr
                      key={s._id}
                      onClick={() => setSelectedStudent(s)}
                      className="hover:bg-[#fcfcfc] cursor-pointer transition-colors group"
                    >
                      <td className="px-6 py-4 text-[13px] font-black text-[#111] group-hover:underline">
                        {s.fullName}
                      </td>
                      <td className="px-6 py-4 text-[12px] font-mono font-bold text-[#555]">
                        {s.prn || "—"}
                      </td>
                      <td className="px-6 py-4 text-[13px] font-medium text-[#555]">
                        {s.courseName || "—"}
                      </td>
                      <td className="px-6 py-4 text-[13px] font-black text-[#111]">
                        {s.Year || "—"}
                      </td>

                      {/* STATUS COLORS */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-[6px] text-[9px] font-bold uppercase tracking-widest border ${
                            s.status === "completed"
                              ? "bg-[#f0fdf4] text-[#166534] border-[#bbf7d0]"
                              : s.status === "active"
                                ? "bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe]"
                                : s.status === "pending"
                                  ? "bg-[#fef2f2] text-[#991b1b] border-[#fecaca]"
                                  : "bg-[#f9f9f9] text-[#555] border-[#e5e5e5]"
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ================= MODAL ================= */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-[#111]/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-[#fff] p-8 rounded-[24px] w-full max-w-md shadow-2xl border border-[#e5e5e5]">
            <div className="flex justify-between items-start border-b border-[#e5e5e5] pb-4 mb-6">
              <h2 className="text-[18px] font-black text-[#111] m-0 uppercase tracking-tighter">
                Student Details
              </h2>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-[10px] font-bold text-[#999] hover:text-[#111] uppercase tracking-widest bg-transparent border-none cursor-pointer outline-none"
              >
                Close
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-[#999] uppercase tracking-widest">
                  Full Name
                </span>
                <span className="text-[14px] font-black text-[#111]">
                  {selectedStudent.fullName || "—"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-[#999] uppercase tracking-widest">
                  PRN
                </span>
                <span className="text-[13px] font-mono font-bold text-[#555]">
                  {selectedStudent.prn || "—"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-[#999] uppercase tracking-widest">
                  ABC ID
                </span>
                <span className="text-[13px] font-mono font-bold text-[#555]">
                  {selectedStudent.abcId || "—"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-[#999] uppercase tracking-widest">
                  Course
                </span>
                <span className="text-[13px] font-medium text-[#111]">
                  {selectedStudent.courseName || "—"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-[#999] uppercase tracking-widest">
                  Year
                </span>
                <span className="text-[13px] font-black text-[#111]">
                  {selectedStudent.Year || "—"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-[#999] uppercase tracking-widest">
                  Status
                </span>
                <span className="text-[12px] font-black uppercase tracking-widest text-[#111]">
                  {selectedStudent.status || "—"}
                </span>
              </div>
            </div>

            <button
              onClick={() => setSelectedStudent(null)}
              className="mt-8 w-full bg-[#111] text-[#fff] font-black text-[10px] uppercase tracking-[0.15em] px-4 py-3.5 rounded-[12px] hover:bg-[#333] transition-colors outline-none cursor-pointer border-none"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyDashboard;
