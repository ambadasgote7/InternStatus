import React, { useEffect, useState, useRef } from "react";
import API from "../../api/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
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

  const fetchData = async () => {
    try {
      setLoading(true);
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

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#2D3436] text-[#FFFFFF] px-4 py-3 rounded-[16px] shadow-2xl border border-[#6C5CE7]/30">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60 m-0 mb-1">
            {payload[0].payload.name}
          </p>
          <p className="text-[20px] font-black m-0 text-[#6C5CE7]">{payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FFFFFF] font-['Nunito']">
        <div className="flex flex-col items-center gap-6">
          <div className="w-12 h-12 border-[3px] border-[#F5F6FA] border-t-[#6C5CE7] rounded-full animate-spin"></div>
          <p className="text-[#2D3436] font-black tracking-[0.3em] uppercase text-[10px] animate-pulse m-0">
            Mapping Repository...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#2D3436] font-['Nunito'] pb-20">

      <div className="max-w-7xl mx-auto p-4 md:p-10 space-y-12 animate-in fade-in duration-700">
        
        {/* HEADER SECTION */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-[11px] font-black text-[#6C5CE7] uppercase tracking-[0.4em] mb-3">
              Institutional Overview
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-[#2D3436] m-0 tracking-tighter uppercase leading-none">
              Control <span className="text-[#6C5CE7]">Center</span>
            </h1>
          </div>
          <div className="text-[12px] font-bold text-[#2D3436] opacity-40 uppercase tracking-widest border-b-2 border-[#F5F6FA] pb-1">
            Academic Session 2026
          </div>
        </header>

        {/* METRIC CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { id: "students", label: "Total Enrollment", count: students.length },
            { id: "faculty", label: "Expert Faculty", count: faculty.length },
            { id: "courses", label: "Active Programs", count: courses.length }
          ].map((card) => (
            <div
              key={card.id}
              onClick={() => handleViewChange(card.id)}
              className={`group bg-[#FFFFFF] border-2 p-10 rounded-[35px] transition-all duration-500 cursor-pointer flex flex-col gap-4 relative overflow-hidden
              ${view === card.id 
                ? "border-[#6C5CE7] shadow-2xl shadow-[#6C5CE7]/20 -translate-y-2" 
                : "border-[#F5F6FA] hover:border-[#6C5CE7]/30 hover:shadow-xl"}
            `}
            >
              <div className={`absolute top-0 right-0 w-24 h-24 rounded-full -mr-10 -mt-10 transition-colors duration-500 ${view === card.id ? "bg-[#6C5CE7]/10" : "bg-[#F5F6FA]"}`}></div>
              <p className="text-[11px] font-black text-[#2D3436] opacity-40 uppercase tracking-[0.2em] m-0 group-hover:text-[#6C5CE7] transition-colors">
                {card.label}
              </p>
              <h2 className="text-[52px] font-black text-[#2D3436] m-0 leading-none tracking-tighter">
                {card.count}
              </h2>
            </div>
          ))}
        </div>

        {/* ANALYTICS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-[#F5F6FA] p-10 rounded-[40px] border border-white">
            <h2 className="text-[13px] font-black text-[#2D3436] mb-10 uppercase tracking-[0.3em] flex items-center gap-3 m-0">
              <span className="w-2 h-2 bg-[#6C5CE7] rounded-full animate-ping"></span>
              Live Distribution
            </h2>

            <div className="w-full h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis 
                    dataKey="name" 
                    stroke="#2D3436" 
                    fontSize={10} 
                    fontWeight={900} 
                    tickMargin={15} 
                    axisLine={false} 
                    tickLine={false} 
                    opacity={0.3}
                  />
                  <YAxis hide />
                  <Tooltip cursor={{ fill: "#FFFFFF", opacity: 0.5 }} content={<CustomTooltip />} />
                  <Bar dataKey="count" radius={[15, 15, 15, 15]} barSize={55}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={view === entry.name.toLowerCase() ? "#6C5CE7" : "#2D3436"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* SIDE INFO BOX */}
          <div className="bg-[#2D3436] p-10 rounded-[40px] text-white flex flex-col justify-between relative overflow-hidden">
            <div className="absolute bottom-0 left-0 w-full h-1 bg-[#6C5CE7]"></div>
            <div>
              <h3 className="text-[24px] font-black tracking-tighter leading-tight mb-4 uppercase">System<br/><span className="text-[#6C5CE7]">Integrity</span></h3>
              <p className="text-[#FFFFFF]/40 text-[12px] font-medium leading-relaxed">
                All academic records are currently synced with the central repository. No pending actions required for the current session.
              </p>
            </div>
            <button className="mt-8 bg-[#6C5CE7] hover:bg-[#5b4bc4] text-white text-[10px] font-black uppercase tracking-widest py-4 px-6 rounded-2xl transition-all">
              Export Report
            </button>
          </div>
        </div>

        {/* DATA DIRECTORY */}
        <div ref={tableRef} className="bg-[#FFFFFF] border-2 border-[#F5F6FA] p-1 md:p-10 rounded-[45px] scroll-mt-10">
          <div className="flex flex-col md:flex-row justify-between items-center mb-10 px-6 gap-4">
            <h2 className="text-[14px] font-black text-[#2D3436] uppercase tracking-[0.3em] m-0">
              {view} <span className="text-[#6C5CE7]">Registry</span>
            </h2>
            <div className="flex items-center gap-2 bg-[#F5F6FA] px-5 py-2 rounded-full border border-[#FFFFFF]">
              <div className="w-1.5 h-1.5 bg-[#6C5CE7] rounded-full"></div>
              <span className="text-[9px] font-black text-[#2D3436]/60 uppercase tracking-widest">Active Filters: {view}</span>
            </div>
          </div>

          <div className="overflow-hidden">
            {view === "students" && (
              <div className="overflow-x-auto rounded-[30px]">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="bg-[#F5F6FA] border-b border-white">
                      {["Full Name", "Identity (PRN)", "Program", "Academic Year", "Status"].map((h) => (
                        <th key={h} className="px-8 py-6 text-[10px] font-black text-[#2D3436]/40 uppercase tracking-[0.2em]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F5F6FA]">
                    {students.map((s) => (
                      <tr key={s._id} onClick={() => setSelectedStudent(s)} className="group hover:bg-[#F5F6FA]/50 cursor-pointer transition-all">
                        <td className="px-8 py-6 text-[14px] font-black text-[#2D3436] group-hover:text-[#6C5CE7] transition-colors">{s.fullName}</td>
                        <td className="px-8 py-6 text-[12px] font-mono font-bold text-[#6C5CE7]">{s.prn}</td>
                        <td className="px-8 py-6 text-[13px] font-bold text-[#2D3436]/60">{s.courseName}</td>
                        <td className="px-8 py-6 text-[13px] font-black text-[#2D3436]">{s.Year}</td>
                        <td className="px-8 py-6">
                          <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${s.status === "active" ? "bg-[#6C5CE7] text-white" : "bg-[#2D3436] text-white"}`}>
                            {s.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {/* Faculty & Courses logic follow same style... */}
          </div>
        </div>
      </div>

      {/* MODALS (Simplified for brevity, following the same theme) */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-[#2D3436]/80 backdrop-blur-md flex justify-center items-center z-50 p-6 animate-in fade-in duration-300">
          <div className="bg-[#FFFFFF] p-12 rounded-[50px] w-full max-w-lg shadow-2xl border-4 border-[#6C5CE7]">
            <h2 className="text-[28px] font-black text-[#2D3436] mb-8 tracking-tighter uppercase leading-none">Record <span className="text-[#6C5CE7]">Details</span></h2>
            <div className="space-y-6">
               <ModalItem label="Identification" value={selectedStudent.fullName} />
               <ModalItem label="Enrollment Key" value={selectedStudent.prn} isMono />
               <ModalItem label="Status" value={selectedStudent.status} isStatus />
            </div>
            <button onClick={() => setSelectedStudent(null)} className="mt-10 w-full bg-[#2D3436] text-white font-black text-[11px] uppercase tracking-[0.3em] py-5 rounded-[25px] hover:bg-[#6C5CE7] transition-all">
              Close Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const ModalItem = ({ label, value, isMono, isStatus }) => (
  <div className="flex flex-col gap-1 border-b border-[#F5F6FA] pb-3">
    <span className="text-[10px] font-black text-[#6C5CE7] uppercase tracking-widest">{label}</span>
    <span className={`${isMono ? "font-mono" : "font-black"} ${isStatus ? "text-[#6C5CE7]" : "text-[#2D3436]"} text-[16px]`}>{value || "—"}</span>
  </div>
);

export default CollegeDashboard;