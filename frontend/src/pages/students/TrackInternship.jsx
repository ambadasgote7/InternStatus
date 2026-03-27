import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api/api";

// ==========================================
// 1. Reusable Status Badge Component
// ==========================================
const StatusBadge = ({ status }) => {
  let cls = "bg-[#F5F6FA] border-transparent text-[#2D3436]";
  let dotCls = "bg-[#2D3436] opacity-40";

  if (status === "completed") {
    cls = "bg-emerald-50 border-emerald-200 text-emerald-600 shadow-sm";
    dotCls = "bg-emerald-500";
  } else if (status === "submitted" || status === "under_review") {
    cls = "bg-[#2D3436] text-[#FFFFFF] border-[#2D3436] shadow-sm";
    dotCls = "bg-[#FFFFFF]";
  } else if (status === "revision_requested") {
    cls = "bg-rose-50 border-rose-200 text-rose-600 shadow-sm";
    dotCls = "bg-rose-500";
  } else {
    // Default Pending
    cls = "bg-[#FFFFFF] border-[#F5F6FA] text-[#2D3436] opacity-60 shadow-sm";
  }

  return (
    <span
      className={`inline-flex items-center px-3 py-1.5 rounded-[12px] text-[10px] font-black uppercase tracking-widest border transition-all duration-300 ${cls}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full mr-2 ${dotCls}`}></span>
      {status ? status.replace("_", " ") : "PENDING"}
    </span>
  );
};

// ==========================================
// 2. Dashboard Header & Pie Chart Component
// ==========================================
const DashboardHeader = ({ tasks }) => {
  // Calculate analytics for the Pie Chart
  const total = tasks.length || 1; // Prevent division by zero
  const completed = tasks.filter((t) => t.status === "completed").length;
  const submitted = tasks.filter((t) => t.status === "submitted" || t.status === "under_review").length;
  const pending = tasks.length - completed - submitted;

  const completedPct = (completed / total) * 100;
  const submittedPct = (submitted / total) * 100;

  // Pure CSS Pie Chart
  const pieChartStyle = {
    background:
      tasks.length === 0
        ? "#F5F6FA"
        : `conic-gradient(
          #10b981 0% ${completedPct}%, 
          #2D3436 ${completedPct}% ${completedPct + submittedPct}%, 
          #F5F6FA ${completedPct + submittedPct}% 100%
        )`,
  };

  return (
    <div className="bg-[#FFFFFF] border border-[#F5F6FA] rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-8 md:p-10 flex flex-col lg:flex-row gap-10 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
      {/* LEFT HALF: Information & Buttons */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between gap-8 border-b lg:border-b-0 lg:border-r border-[#F5F6FA] pb-8 lg:pb-0 lg:pr-10">
        
        <div className="flex flex-col gap-2">
          <h1 className="text-[28px] md:text-4xl font-black text-[#6C5CE7] m-0 tracking-tighter leading-tight uppercase">
            Task Console
          </h1>
          <p className="text-[13px] font-black text-[#2D3436] opacity-40 m-0 uppercase tracking-[0.2em] bg-[#F5F6FA] px-3 py-1.5 rounded-lg w-max">
            Progress Tracking
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 bg-[#F5F6FA] p-6 rounded-[24px] border border-transparent hover:border-[#6C5CE7]/10 transition-colors">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-black opacity-40 uppercase tracking-[0.15em] text-[#2D3436]">
              Supervisor
            </span>
            <span className="text-[14px] font-black text-[#2D3436]">
              Assigned Mentor
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-black opacity-40 uppercase tracking-[0.15em] text-[#2D3436]">
              Milestones
            </span>
            <span className="text-[14px] font-black text-[#6C5CE7]">
              {tasks.length} Assigned
            </span>
          </div>
        </div>

        {/* Compact Button Group */}
        <div className="flex flex-wrap gap-4 mt-2">
          <button className="px-6 py-3 text-[10px] font-black text-[#FFFFFF] bg-[#6C5CE7] rounded-[14px] border-none hover:bg-opacity-90 hover:shadow-[0_8px_20px_rgba(108,92,231,0.3)] transition-all duration-300 uppercase tracking-widest cursor-pointer outline-none transform hover:-translate-y-0.5 active:scale-95 shadow-sm">
            View Resume
          </button>
          <button className="px-6 py-3 text-[10px] font-black text-[#2D3436] bg-[#FFFFFF] border border-[#F5F6FA] rounded-[14px] hover:border-[#6C5CE7] hover:text-[#6C5CE7] hover:shadow-sm transition-all duration-300 uppercase tracking-widest cursor-pointer outline-none transform hover:-translate-y-0.5 active:scale-95">
            Contact Mentor
          </button>
        </div>
      </div>

      {/* RIGHT HALF: Pie Chart Analytics */}
      <div className="w-full lg:w-1/2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-10 lg:pl-4">
        
        {/* CSS Doughnut Chart */}
        <div className="relative group">
          <div className="absolute inset-0 bg-[#6C5CE7]/5 rounded-full blur-xl group-hover:bg-[#6C5CE7]/10 transition-colors duration-500"></div>
          <div
            className="relative w-[140px] h-[140px] rounded-full flex items-center justify-center shadow-sm transform group-hover:scale-105 transition-transform duration-500"
            style={pieChartStyle}
          >
            {/* Inner white circle to create the doughnut hole effect */}
            <div className="w-[100px] h-[100px] bg-[#FFFFFF] rounded-full flex items-center justify-center flex-col shadow-inner">
              <span className="text-[28px] font-black text-[#2D3436] leading-none">
                {Math.round(completedPct) || 0}%
              </span>
              <span className="text-[9px] font-black text-[#6C5CE7] uppercase tracking-widest mt-1">
                Done
              </span>
            </div>
          </div>
        </div>

        {/* Chart Legend */}
        <div className="flex flex-col gap-4 bg-[#F5F6FA] p-6 rounded-[24px] w-full sm:w-auto">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm"></div>
              <span className="text-[11px] font-black text-[#2D3436] uppercase tracking-widest opacity-80">
                Completed
              </span>
            </div>
             <span className="text-[14px] font-black text-[#2D3436]">{completed}</span>
          </div>
          
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-[#2D3436] shadow-sm"></div>
              <span className="text-[11px] font-black text-[#2D3436] uppercase tracking-widest opacity-80">
                Submitted
              </span>
            </div>
            <span className="text-[14px] font-black text-[#2D3436]">{submitted}</span>
          </div>

          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-[#FFFFFF] border-2 border-[#F5F6FA]"></div>
              <span className="text-[11px] font-black text-[#2D3436] uppercase tracking-widest opacity-40">
                Pending
              </span>
            </div>
            <span className="text-[14px] font-black text-[#2D3436] opacity-50">{pending}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 3. Main Page Component
// ==========================================
export default function InternTaskConsole() {
  const { applicationId } = useParams();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const res = await API.get(`/tasks/application/${applicationId}`);
      setTasks(res.data?.data || []);
    } catch (err) {
      console.error("Task fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [applicationId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] flex items-center justify-center font-['Nunito'] transition-all duration-300">
        <div className="flex flex-col items-center gap-4 animate-in fade-in duration-700">
          <div className="w-12 h-12 border-4 border-[#F5F6FA] border-t-[#6C5CE7] rounded-full animate-spin"></div>
          <p className="text-[12px] font-black text-[#6C5CE7] animate-pulse uppercase tracking-widest m-0">
            Loading Milestones...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#2D3436] font-['Nunito'] pb-12 transition-colors duration-500 selection:bg-[#6C5CE7]/20 selection:text-[#6C5CE7]">
      <main className="max-w-6xl mx-auto w-full px-4 md:px-8 py-8 md:py-10 flex flex-col gap-10">
        
        {/* Top 50/50 Split Section */}
        <DashboardHeader tasks={tasks} />

        {/* Bottom Section: Milestones Table */}
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100 fill-mode-both">
          <h2 className="text-[14px] font-black text-[#6C5CE7] m-0 uppercase tracking-[0.2em] px-2 border-l-4 border-[#6C5CE7] pl-4 flex items-center h-5">
            Assigned Milestones
          </h2>

          {tasks.length === 0 ? (
            <div className="bg-[#F5F6FA] border-2 border-dashed border-[#6C5CE7]/20 rounded-[32px] p-24 text-center">
              <p className="text-[14px] font-black text-[#2D3436] opacity-40 m-0 uppercase tracking-[0.15em]">
                No milestones have been assigned yet
              </p>
            </div>
          ) : (
            <div className="bg-[#FFFFFF] border border-[#F5F6FA] rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-x-auto box-border hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] transition-all duration-500">
              <table className="w-full text-left border-collapse min-w-max">
                <thead>
                  <tr className="border-b border-[#F5F6FA] bg-[#F5F6FA] bg-opacity-50">
                    <th className="p-6 md:px-8 md:py-6 text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-[0.15em] whitespace-nowrap">
                      Task Info
                    </th>
                    <th className="p-6 md:px-8 md:py-6 text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-[0.15em]">
                      Description / Link
                    </th>
                    <th className="p-6 md:px-8 md:py-6 text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-[0.15em] whitespace-nowrap">
                      Timeline
                    </th>
                    <th className="p-6 md:px-8 md:py-6 text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-[0.15em] whitespace-nowrap">
                      Status
                    </th>
                    <th className="p-6 md:px-8 md:py-6 text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-[0.15em] whitespace-nowrap text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task, idx) => (
                    <tr
                      key={task._id}
                      style={{ animationDelay: `${idx * 50}ms` }}
                      className="border-b border-[#F5F6FA] last:border-none hover:bg-[#F5F6FA]/40 transition-colors duration-300 group animate-in fade-in fill-mode-both"
                    >
                      <td className="p-6 md:px-8 md:py-6 align-middle">
                        <span className="text-[15px] font-black text-[#2D3436] m-0 leading-tight block min-w-[150px] group-hover:text-[#6C5CE7] transition-colors">
                          {task.title}
                        </span>
                      </td>
                      <td className="p-6 md:px-8 md:py-6 align-middle max-w-[300px] whitespace-normal">
                        {task.taskType === "internal" ? (
                          <p className="text-[13px] font-bold text-[#2D3436] opacity-70 m-0 line-clamp-2 leading-relaxed bg-[#F5F6FA] p-3 rounded-[12px] border border-transparent group-hover:border-[#6C5CE7]/10 transition-colors">
                            {task.description}
                          </p>
                        ) : (
                          <a
                            href={task.externalLink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center px-4 py-2 bg-[#F5F6FA] border border-transparent text-[#6C5CE7] rounded-[10px] text-[10px] font-black uppercase tracking-widest hover:bg-[#FFFFFF] hover:border-[#6C5CE7]/30 transition-all no-underline"
                          >
                            External Resource
                          </a>
                        )}
                      </td>
                      <td className="p-6 md:px-8 md:py-6 align-middle whitespace-nowrap">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-3">
                            <span className="text-[9px] font-black text-[#2D3436] opacity-40 uppercase w-16 tracking-widest">
                              Assigned
                            </span>
                            <span className="text-[12px] font-bold text-[#2D3436] bg-[#F5F6FA] px-2 py-1 rounded-md">
                              {task.assignedAt
                                ? new Date(task.assignedAt).toLocaleDateString("en-IN")
                                : "—"}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[9px] font-black text-rose-500 opacity-60 uppercase w-16 tracking-widest">
                              Deadline
                            </span>
                            <span className="text-[12px] font-bold text-rose-600 bg-rose-50 border border-rose-100 px-2 py-1 rounded-md">
                              {task.deadline
                                ? new Date(task.deadline).toLocaleDateString("en-IN")
                                : "—"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-6 md:px-8 md:py-6 align-middle whitespace-nowrap">
                        <StatusBadge status={task.status} />
                      </td>
                      <td className="p-6 md:px-8 md:py-6 align-middle whitespace-nowrap text-right">
                        <button
                          onClick={() =>
                            navigate(`/student/intern/${task._id}/submit`)
                          }
                          className="px-5 py-3 bg-[#FFFFFF] border-2 border-transparent text-[#2D3436] text-[10px] font-black uppercase tracking-widest rounded-[14px] hover:bg-[#6C5CE7] hover:text-[#FFFFFF] hover:shadow-md transition-all duration-300 cursor-pointer outline-none transform hover:-translate-y-0.5 active:scale-95 shadow-sm"
                        >
                          Open Milestone
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}