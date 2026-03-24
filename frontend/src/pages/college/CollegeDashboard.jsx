import React, { useEffect, useState, useRef } from "react";
// Assuming you have this component, otherwise remove it or replace it
// import CollegeNavBar from "../../components/navbars/CollegeNavBar";
import API from "../../api/api";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import CollegeNavBar from "../../components/navbars/CollegeNavBar";

const CollegeDashboard = () => {
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [courses, setCourses] = useState([]);
  const [view, setView] = useState("students");
  const [loading, setLoading] = useState(true);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedFaculty, setSelectedFaculty] = useState(null);

  const tableRef = useRef(null);

  // ================= FETCH =================
  const fetchData = async () => {
    try {
      setLoading(true);
      // FIXED: Promise.all returns an array of responses, you must destructure it properly
      const [sRes, fRes, cRes] = await Promise.all([
        API.get("/college/students"),
        API.get("/college/faculty"),
        API.get("/college/courses"),
      ]);

      setStudents(sRes.data?.data || []);
      setFaculty(fRes.data?.data || []);
      setCourses(cRes.data?.data || []);
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ================= SCROLL HANDLER =================
  const handleViewChange = (type) => {
    setView(type);
    setTimeout(() => {
      tableRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const chartData = [
    { name: "STUDENTS", count: students.length },
    { name: "FACULTY", count: faculty.length },
    { name: "COURSES", count: courses.length },
  ];

  // Custom Tooltip for Recharts to match the theme
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#111] text-[#fff] px-4 py-3 rounded-[12px] shadow-xl border border-[#333]">
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 m-0 mb-1">
            {payload[0].payload.name}
          </p>
          <p className="text-[16px] font-black m-0">{payload[0].value}</p>
        </div>
      );
    }
    return null;
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
    <>
      <CollegeNavBar />
      <div className="min-h-screen bg-[#f9f9f9] text-[#111] font-sans pb-12">
        {/* <CollegeNavBar /> */}

        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
          {/* HEADER */}
          <header className="border-b border-[#e5e5e5] pb-6">
            <div className="text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-[0.2em] mb-2">
              Command Center
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-[#111] m-0 tracking-tighter uppercase">
              College Dashboard
            </h1>
          </header>

          {/* ================= CARDS ================= */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              onClick={() => handleViewChange("students")}
              className={`bg-[#fff] border p-8 rounded-[24px] shadow-sm transition-all duration-300 cursor-pointer flex flex-col gap-2
              ${view === "students" ? "border-[#111] shadow-md -translate-y-1" : "border-[#e5e5e5] hover:border-[#ccc]"}
            `}
            >
              <p className="text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-[0.15em] m-0">
                Total Students
              </p>
              <h2 className="text-[40px] font-black text-[#111] m-0 leading-none">
                {students.length}
              </h2>
            </div>

            <div
              onClick={() => handleViewChange("faculty")}
              className={`bg-[#fff] border p-8 rounded-[24px] shadow-sm transition-all duration-300 cursor-pointer flex flex-col gap-2
              ${view === "faculty" ? "border-[#111] shadow-md -translate-y-1" : "border-[#e5e5e5] hover:border-[#ccc]"}
            `}
            >
              <p className="text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-[0.15em] m-0">
                Total Faculty
              </p>
              <h2 className="text-[40px] font-black text-[#111] m-0 leading-none">
                {faculty.length}
              </h2>
            </div>

            <div
              onClick={() => handleViewChange("courses")}
              className={`bg-[#fff] border p-8 rounded-[24px] shadow-sm transition-all duration-300 cursor-pointer flex flex-col gap-2
              ${view === "courses" ? "border-[#111] shadow-md -translate-y-1" : "border-[#e5e5e5] hover:border-[#ccc]"}
            `}
            >
              <p className="text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-[0.15em] m-0">
                Active Courses
              </p>
              <h2 className="text-[40px] font-black text-[#111] m-0 leading-none">
                {courses.length}
              </h2>
            </div>
          </div>

          {/* ================= CHART ================= */}
          <div className="bg-[#fff] border border-[#e5e5e5] p-8 rounded-[24px] shadow-sm">
            <h2 className="text-[12px] font-black text-[#111] mb-8 uppercase tracking-widest border-l-4 border-[#111] pl-3 m-0">
              System Overview
            </h2>

            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <XAxis
                    dataKey="name"
                    stroke="#999"
                    fontSize={10}
                    fontWeight={700}
                    tickMargin={10}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#999"
                    fontSize={10}
                    fontWeight={700}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "#f9f9f9" }}
                    content={<CustomTooltip />}
                  />
                  <Bar
                    dataKey="count"
                    fill="#111"
                    radius={[6, 6, 0, 0]}
                    barSize={60}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ================= DATA TABLE ================= */}
          <div
            ref={tableRef}
            className="bg-[#fff] border border-[#e5e5e5] p-8 rounded-[24px] shadow-sm scroll-mt-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[12px] font-black text-[#111] uppercase tracking-widest border-l-4 border-[#111] pl-3 m-0">
                {view} Directory
              </h2>
              <div className="text-[10px] font-bold bg-[#f9f9f9] border border-[#e5e5e5] px-3 py-1.5 rounded-[8px] uppercase tracking-widest text-[#555]">
                Viewing: {view}
              </div>
            </div>

            {/* STUDENTS */}
            {view === "students" && (
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
                          className="hover:bg-[#fcfcfc] cursor-pointer transition-colors group"
                          onClick={() => setSelectedStudent(s)}
                        >
                          <td className="px-6 py-4 text-[13px] font-black text-[#111] group-hover:underline">
                            {s.fullName || "—"}
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
                          <td className="px-6 py-4">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-[6px] text-[9px] font-bold uppercase tracking-widest border ${
                                s.status === "active"
                                  ? "bg-[#f0fdf4] text-[#166534] border-[#bbf7d0]"
                                  : "bg-[#f9f9f9] text-[#555] border-[#e5e5e5]"
                              }`}
                            >
                              {s.status || "Unknown"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* FACULTY */}
            {view === "faculty" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {faculty.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-[12px] font-bold text-[#999] border border-dashed border-[#e5e5e5] rounded-[16px] uppercase tracking-widest">
                    No Faculty Found
                  </div>
                ) : (
                  faculty.map((f) => (
                    <div
                      key={f._id}
                      onClick={() => setSelectedFaculty(f)}
                      className="p-6 border border-[#e5e5e5] bg-[#f9f9f9] hover:bg-[#fff] hover:border-[#111] cursor-pointer rounded-[16px] transition-all flex flex-col gap-2"
                    >
                      <p className="text-[14px] font-black text-[#111] m-0 break-all leading-tight">
                        {f.fullName || f.user?.email || "Unknown"}
                      </p>
                      <div className="flex flex-col gap-1 mt-2">
                        <p className="text-[10px] font-bold text-[#555] uppercase tracking-widest m-0">
                          {f.designation || "Faculty"}
                        </p>
                        <p className="text-[10px] font-bold text-[#999] uppercase tracking-widest m-0">
                          {f.department || "No Department"}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* COURSES */}
            {view === "courses" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-[12px] font-bold text-[#999] border border-dashed border-[#e5e5e5] rounded-[16px] uppercase tracking-widest">
                    No Courses Found
                  </div>
                ) : (
                  courses.map((c, i) => (
                    <div
                      key={i}
                      className="p-6 border border-[#e5e5e5] rounded-[16px] bg-[#fff] flex flex-col justify-between gap-4"
                    >
                      <p className="text-[14px] font-black text-[#111] m-0 leading-tight uppercase">
                        {c.name}
                      </p>
                      <div className="bg-[#f9f9f9] border border-[#e5e5e5] px-3 py-1.5 rounded-[8px] w-fit">
                        <p className="text-[10px] font-bold text-[#555] uppercase tracking-widest m-0">
                          Duration:{" "}
                          <span className="text-[#111] font-black">
                            {c.durationYears} Years
                          </span>
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* ================= MODALS ================= */}

        {/* STUDENT MODAL */}
        {selectedStudent && (
          <div className="fixed inset-0 bg-[#111]/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-[#fff] p-8 rounded-[24px] w-full max-w-md shadow-2xl border border-[#e5e5e5]">
              <div className="flex justify-between items-start border-b border-[#e5e5e5] pb-4 mb-6">
                <h2 className="text-[18px] font-black text-[#111] m-0 uppercase tracking-tighter">
                  Student Profile
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
                    Course Enrolled
                  </span>
                  <span className="text-[13px] font-medium text-[#111]">
                    {selectedStudent.courseName || "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-[#999] uppercase tracking-widest">
                    Current Year
                  </span>
                  <span className="text-[13px] font-black text-[#111]">
                    {selectedStudent.Year || "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-[#999] uppercase tracking-widest">
                    System Status
                  </span>
                  <span className="text-[12px] font-black text-[#166534] uppercase tracking-widest">
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

        {/* FACULTY MODAL */}
        {selectedFaculty && (
          <div className="fixed inset-0 bg-[#111]/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-[#fff] p-8 rounded-[24px] w-full max-w-md shadow-2xl border border-[#e5e5e5]">
              <div className="flex justify-between items-start border-b border-[#e5e5e5] pb-4 mb-6">
                <h2 className="text-[18px] font-black text-[#111] m-0 uppercase tracking-tighter">
                  Faculty Profile
                </h2>
                <button
                  onClick={() => setSelectedFaculty(null)}
                  className="text-[10px] font-bold text-[#999] hover:text-[#111] uppercase tracking-widest bg-transparent border-none cursor-pointer outline-none"
                >
                  Close
                </button>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-[#999] uppercase tracking-widest">
                    Name
                  </span>
                  <span className="text-[14px] font-black text-[#111]">
                    {selectedFaculty.fullName || "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-[#999] uppercase tracking-widest">
                    System Email
                  </span>
                  <span className="text-[13px] font-medium text-[#555] break-all">
                    {selectedFaculty.user?.email || "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-[#999] uppercase tracking-widest">
                    Department
                  </span>
                  <span className="text-[13px] font-black text-[#111]">
                    {selectedFaculty.department || "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-[#999] uppercase tracking-widest">
                    Designation
                  </span>
                  <span className="text-[13px] font-medium text-[#111]">
                    {selectedFaculty.designation || "—"}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedFaculty(null)}
                className="mt-8 w-full bg-[#111] text-[#fff] font-black text-[10px] uppercase tracking-[0.15em] px-4 py-3.5 rounded-[12px] hover:bg-[#333] transition-colors outline-none cursor-pointer border-none"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CollegeDashboard;
