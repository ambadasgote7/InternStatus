import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../api/api";

/* ---------------- HELPERS (Logic Untouched) ---------------- */

function getWeekNumber(startDate, currentDate) {
  const diff = new Date(currentDate) - new Date(startDate);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  return Math.floor(days / 7) + 1;
}

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
}

function groupTasksByWeek(tasks) {
  if (!tasks?.length) return [];
  const sorted = [...tasks].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const startDate = sorted[0].createdAt;
  const weekMap = {};
  for (const task of sorted) {
    const week = getWeekNumber(startDate, task.createdAt);
    if (!weekMap[week]) {
      weekMap[week] = {
        weekNumber: week,
        startDate: task.createdAt,
        endDate: task.createdAt,
        tasks: [],
      };
    }
    weekMap[week].endDate = task.createdAt;
    weekMap[week].tasks.push(task);
  }
  return Object.values(weekMap);
}

/* ---------------- MAIN COMPONENT ---------------- */

export default function AcademicInternshipTrack() {
  const { applicationId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

 

useEffect(() => {
  if (!applicationId) return;

  fetchData();
}, [applicationId]);

 const fetchData = async () => {
  try {
    console.log("🔥 API CALL START");

    const res = await API.get(`/applications/${applicationId}/academic-track`);

    console.log("✅ API RESPONSE:", res.data);

    setData(res.data.data);
  } catch (err) {
    console.error("❌ API ERROR:", err?.response?.data || err.message);
  } finally {
    setLoading(false);
  }
};

 if (loading) {
  return <div>Loading...</div>;
}

if (!data) {
  return <div>❌ No data or API failed</div>;
}

  const tasks = data?.tasks || [];
  const weeklyTasks = groupTasksByWeek(tasks);

  /* Analytics Logic */
  const total = tasks.length || 1;
  const completed = tasks.filter((t) => t.status === "completed").length;
  const submitted = tasks.filter((t) => t.status === "submitted").length;
  const pending = tasks.length - completed - submitted;
  const progressPercent = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;
  
  const pieChartStyle = {
    background: `conic-gradient(
      #6C5CE7 0% ${(completed / total) * 100}%,
      #2D3436 ${(completed / total) * 100}% ${((completed + submitted) / total) * 100}%,
      #E5E7EB ${((completed + submitted) / total) * 100}% 100%
    )`,
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#2D3436] font-['Nunito'] p-4 md:p-10 selection:bg-[#6C5CE7]/10">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        
        {/* TOP SECTION: Side-by-Side Analytics & Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
          
          {/* INFO CARD: Using Surface Color */}
          <div className="bg-[#F5F6FA] p-8 rounded-[32px] border border-[#F5F6FA] shadow-sm flex flex-col justify-between">
            <div>
              <h1 className="text-2xl font-black text-[#2D3436] mb-1 tracking-tight">Academic Track</h1>
              <p className="text-[10px] font-black text-[#6C5CE7] uppercase tracking-[0.3em] mb-8">Internship Metadata</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <InfoItem label="Student" value={data.student?.fullName} />
              <InfoItem label="Company" value={data.company?.name} />
              <InfoItem label="Mentor" value={data.mentor?.fullName || "Not Assigned"} />
              <InfoItem label="Status" value={data.status} highlight />
            </div>
          </div>

          {/* ANALYTICS CARD: Using Surface Color */}
          <div className="bg-[#F5F6FA] p-8 rounded-[32px] border border-[#F5F6FA] shadow-sm flex flex-col sm:flex-row items-center gap-10">
            <div className="relative">
              <div className="w-32 h-32 rounded-full flex items-center justify-center shadow-lg" style={pieChartStyle}>
                <div className="w-20 h-20 bg-[#F5F6FA] rounded-full flex flex-col items-center justify-center">
                  <span className="text-xl font-black">{tasks.length}</span>
                  <span className="text-[8px] font-black opacity-40 uppercase">Total</span>
                </div>
              </div>
            </div>

            <div className="flex-1 w-full space-y-5">
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#6C5CE7]">Completion Progress</span>
                  <span className="text-xl font-black text-[#2D3436]">{progressPercent}%</span>
                </div>
                <div className="w-full h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
                  <div className="h-full bg-[#6C5CE7] rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
                </div>
              </div>
              <div className="flex gap-4 text-[10px] font-black uppercase tracking-tighter">
                <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#6C5CE7]"></div> {completed} Completed</span>
                <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#2D3436]"></div> {submitted} Submitted</span>
                <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#E5E7EB]"></div> {pending} Pending</span>
              </div>
            </div>
          </div>
        </div>

        {/* CENTERED TABLE SECTION */}
        <div className="mt-4 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
          <div className="bg-[#FFFFFF] border border-[#F5F6FA] rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.02)] overflow-hidden">
            <div className="px-10 py-8 border-b border-[#F5F6FA] bg-[#F5F6FA]/30 flex justify-between items-center">
              <h2 className="text-sm font-black uppercase tracking-[0.4em] text-[#2D3436]">Milestone Registry</h2>
              <span className="px-4 py-1.5 bg-white rounded-full border border-[#F5F6FA] text-[10px] font-bold text-[#6C5CE7]">2026 Batch</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2D3436]/40 border-b border-[#F5F6FA]">
                    <th className="px-10 py-5 text-left">Timeline</th>
                    <th className="px-10 py-5 text-left">Deliverable Task</th>
                    <th className="px-10 py-5 text-right">Verification Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5F6FA]">
                  {weeklyTasks.map((week) => (
                    <React.Fragment key={week.weekNumber}>
                      {/* Week Header Row */}
                      <tr className="bg-[#F5F6FA]/20">
                        <td colSpan="3" className="px-10 py-3">
                          <div className="flex items-center gap-3">
                            <span className="text-[11px] font-black text-[#6C5CE7] bg-white px-2 py-0.5 rounded shadow-sm border border-[#F5F6FA]">WEEK {week.weekNumber}</span>
                            <span className="text-[10px] font-bold text-[#2D3436]/40 italic">{formatDate(week.startDate)} — {formatDate(week.endDate)}</span>
                          </div>
                        </td>
                      </tr>
                      {/* Task Rows */}
                      {week.tasks.map((task, i) => (
                        <tr key={task._id || i} className="group hover:bg-[#F5F6FA]/50 transition-colors">
                          <td className="px-10 py-5 text-[11px] font-bold text-[#2D3436]/30">#{i + 1}</td>
                          <td className="px-10 py-5">
                            <p className="text-sm font-bold text-[#2D3436] group-hover:text-[#6C5CE7] transition-colors">{task.title || `Task ${i + 1}`}</p>
                          </td>
                          <td className="px-10 py-5 text-right">
                            <span className={`inline-block px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                              task.status === 'completed' 
                              ? 'bg-[#6C5CE7] text-white shadow-md shadow-[#6C5CE7]/20' 
                              : 'bg-white border border-[#2D3436]/10 text-[#2D3436]/40'
                            }`}>
                              {task.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
            
            {tasks.length === 0 && (
              <div className="p-20 text-center flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-[#F5F6FA] rounded-full mb-4"></div>
                <p className="text-[11px] font-black uppercase tracking-widest opacity-30 text-[#2D3436]">Registry Empty</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value, highlight }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[9px] font-black uppercase tracking-widest text-[#2D3436] opacity-30">{label}</span>
      <span className={`text-[13px] font-bold truncate ${highlight ? 'text-[#6C5CE7] uppercase tracking-widest text-[11px]' : 'text-[#2D3436]'}`}>
        {value || "—"}
      </span>
    </div>
  );
}