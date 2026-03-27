import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api/api";
import CreateTask from "./CreateTask";

/* ---------------- HELPERS ---------------- */
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
  const sorted = [...tasks].sort(
    (a, b) =>
      new Date(a.createdAt || a.deadline) -
      new Date(b.createdAt || b.deadline)
  );

  const startDate = sorted[0].createdAt || sorted[0].deadline;
  const weekMap = {};

  for (const task of sorted) {
    const week = getWeekNumber(
      startDate,
      task.createdAt || task.deadline
    );

    if (!weekMap[week]) {
      weekMap[week] = {
        weekNumber: week,
        startDate: task.createdAt || task.deadline,
        endDate: task.createdAt || task.deadline,
        tasks: [],
      };
    }

    weekMap[week].endDate = task.createdAt || task.deadline;
    weekMap[week].tasks.push(task);
  }

  return Object.values(weekMap);
}

/* ---------------- MAIN ---------------- */

export default function MentorInternTrack() {
  const { applicationId } = useParams();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const fetchTasks = async () => {
    try {
      const res = await API.get(`/tasks/application/${applicationId}`);
      setTasks(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [applicationId]);

  /* ---------------- ANALYTICS ---------------- */
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const submittedTasks = tasks.filter((t) => t.status === "submitted").length;
  const pendingTasks = totalTasks - completedTasks - submittedTasks;

  const progressPercent =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const weeklyTasks = groupTasksByWeek(
    tasks.filter((t) => {
      return (
        t.title?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (statusFilter === "ALL" || t.status === statusFilter)
      );
    })
  );

  const getStatusBadge = (status) => {
    let style = "bg-white border border-gray-200 text-[#2D3436]";
    if (status === "completed") style = "bg-[#6C5CE7] text-white";
    else if (status === "submitted") style = "bg-[#2D3436] text-white";
    else if (status === "revision_requested") style = "bg-red-500 text-white";

    return (
      <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-extrabold ${style}`}>
        {status.replace("_", " ")}
      </span>
    );
  };

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#F5F6FA] font-['Nunito']">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6C5CE7]"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F5F6FA] p-4 md:p-8 font-['Nunito'] text-[#2D3436] animate-in fade-in duration-700">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">
              Intern <span className="text-[#6C5CE7]">Progress</span>
            </h1>
          </div>

          <button
            onClick={() => setShowCreate(true)}
            className="bg-[#6C5CE7] hover:bg-[#5b4cc4] text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-[#6C5CE7]/20 transition-all transform hover:-translate-y-1 active:scale-95"
          >
            + Assign New Task
          </button>
        </div>

        {/* ANALYTICS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* PIE CHART / PROGRESS CARD */}
          <div className="bg-white p-6 rounded-[2rem] shadow-sm flex items-center justify-between border border-white">
            <div className="relative flex items-center justify-center w-24 h-24">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="48" cy="48" r="40" stroke="#F5F6FA" strokeWidth="8" fill="transparent" />
                <circle
                  cx="48" cy="48" r="40" stroke="#6C5CE7" strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={251.2}
                  strokeDashoffset={251.2 - (251.2 * progressPercent) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <span className="absolute text-xl font-black text-[#2D3436]">{progressPercent}%</span>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Overall Completion</p>
              <p className="text-2xl font-black text-[#6C5CE7]">{completedTasks} / {totalTasks}</p>
            </div>
          </div>

          {/* STATS BREAKDOWN */}
          <div className="lg:col-span-2 bg-white p-6 rounded-[2rem] shadow-sm border border-white flex flex-wrap items-center justify-around gap-4">
            <div className="text-center">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Total</p>
              <p className="text-2xl font-black">{totalTasks}</p>
            </div>
            <div className="h-10 w-[1px] bg-gray-100 hidden sm:block"></div>
            <div className="text-center">
              <p className="text-xs text-[#6C5CE7] font-bold uppercase tracking-widest mb-1">Done</p>
              <p className="text-2xl font-black text-[#6C5CE7]">{completedTasks}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-700 font-bold uppercase tracking-widest mb-1">In Review</p>
              <p className="text-2xl font-black text-[#2D3436]">{submittedTasks}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-red-400 font-bold uppercase tracking-widest mb-1">Pending</p>
              <p className="text-2xl font-black text-red-500">{pendingTasks}</p>
            </div>
          </div>
        </div>

        {/* SEARCH & FILTER BAR */}
        <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-3xl shadow-sm border border-white">
          <div className="relative flex-grow">
            <input
              placeholder="Search by task title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-5 pr-4 py-3 bg-[#F5F6FA] border-none rounded-2xl focus:ring-2 focus:ring-[#6C5CE7]/20 outline-none transition-all font-medium"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-6 py-3 bg-[#F5F6FA] border-none rounded-2xl font-bold text-[#2D3436] focus:ring-2 focus:ring-[#6C5CE7]/20 outline-none cursor-pointer"
          >
            <option value="ALL">All Status</option>
            <option value="pending">Pending</option>
            <option value="submitted">Submitted</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* DATA TABLE */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F5F6FA]/50 border-b border-gray-50">
                  <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-400">Task Name</th>
                  <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-400">Deadline</th>
                  <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-400">Status</th>
                  <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-400 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {weeklyTasks.length > 0 ? (
                  weeklyTasks.map((week) =>
                    week.tasks.map((task) => (
                      <tr key={task._id} className="group hover:bg-[#F5F6FA]/30 transition-colors">
                        <td className="px-8 py-5">
                          <p className="font-bold text-[#2D3436] group-hover:text-[#6C5CE7] transition-colors">
                            {task.title}
                          </p>
                        </td>
                        <td className="px-8 py-5">
                          <span className="font-medium text-gray-500">
                            {task.deadline ? formatDate(task.deadline) : "Not Set"}
                          </span>
                        </td>
                        <td className="px-8 py-5">{getStatusBadge(task.status)}</td>
                        <td className="px-8 py-5 text-right">
                          <button
                            onClick={() => navigate(`/mentor/tasks/${task._id}`)}
                            className="bg-[#F5F6FA] hover:bg-[#6C5CE7] text-[#2D3436] hover:text-white px-5 py-2 rounded-xl font-bold text-sm transition-all shadow-sm"
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    ))
                  )
                ) : (
                  <tr>
                    <td colSpan="4" className="px-8 py-20 text-center text-gray-400 font-bold">
                      No tasks found for this criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 🔥 MODAL CREATE TASK */}
      {showCreate && (
        <div className="fixed inset-0 bg-[#2D3436]/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in zoom-in duration-300">
          <div className="relative w-full max-w-3xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
            {/* CLOSE BUTTON */}
            <button
              onClick={() => setShowCreate(false)}
              className="absolute top-6 right-6 z-10 bg-[#F5F6FA] hover:bg-red-50 text-[#2D3436] hover:text-red-500 w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all"
            >
              ✕
            </button>

            {/* CREATE TASK CARD CONTENT */}
            <div className="max-h-[90vh] overflow-y-auto p-2">
                <CreateTask
                applicationId={applicationId}
                onSuccess={() => {
                    setShowCreate(false);
                    fetchTasks();
                }}
                />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}