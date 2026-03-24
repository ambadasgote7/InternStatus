import React, { useEffect, useState } from "react";
import API from "../../api/api";
import { useParams, useNavigate } from "react-router-dom";

export default function InternProgress() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProgress = async () => {
    try {
      const res = await API.get(`/company/interns/${id}/progress`);
      setData(res.data.data);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to load progress");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center font-sans">
        <p className="text-[14px] font-bold text-[#333] animate-pulse m-0">
          Loading Monitoring Data...
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center p-4 font-sans">
        <div className="bg-[#fff] border-2 border-dashed border-[#e5e5e5] rounded-[20px] p-10 text-center">
          <p className="text-[13px] font-bold text-[#333] opacity-60 m-0">
            No progress data found
          </p>
        </div>
      </div>
    );
  }

  const { application, tasks } = data;
  const student = application.student || {};
  const mentor = application.mentor || {};
  const internship = application.internship || {};

  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const progressPercent =
    tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#333] font-sans pb-10">
      <main className="max-w-6xl mx-auto w-full px-4 md:px-6 py-6 flex flex-col gap-6">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#e5e5e5] pb-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-[23px] font-black text-[#333] m-0 tracking-tight leading-tight">
              Intern Progress Tracking
            </h1>
            <p className="text-[13px] font-bold text-[#333] opacity-60 m-0 mt-1 uppercase tracking-widest">
              Performance & Milestone Overview
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2 text-[11px] font-bold text-[#333] bg-[#fff] border border-[#e5e5e5] rounded-[12px] hover:border-[#333] transition-colors uppercase tracking-widest cursor-pointer"
          >
            Back to Details
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-[#fff] border border-[#e5e5e5] rounded-[20px] p-5 shadow-sm">
              <h3 className="text-[11px] font-bold text-[#333] opacity-50 m-0 uppercase tracking-widest border-b border-[#f9f9f9] pb-3 mb-4">
                Intern Information
              </h3>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-[#333] opacity-40 uppercase tracking-widest">
                    Full Name
                  </span>
                  <span className="text-[14px] font-bold">
                    {student.fullName}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-[#333] opacity-40 uppercase tracking-widest">
                    Email Address
                  </span>
                  <span className="text-[14px] font-bold truncate">
                    {student.email}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-[#333] opacity-40 uppercase tracking-widest">
                    Mentor Assigned
                  </span>
                  <span className="text-[14px] font-bold">
                    {mentor.fullName || "Awaiting Assignment"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-[#333] opacity-40 uppercase tracking-widest">
                    Internship Title
                  </span>
                  <span className="text-[14px] font-bold">
                    {internship.title}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-[#333] opacity-40 uppercase tracking-widest">
                    Current Status
                  </span>
                  <span className="text-[11px] font-black uppercase tracking-widest text-[#111] bg-[#f9f9f9] px-2 py-1 rounded-[8px] w-max mt-1 border border-[#e5e5e5]">
                    {application.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-[#fff] border border-[#e5e5e5] rounded-[20px] p-5 shadow-sm">
              <h3 className="text-[11px] font-bold text-[#333] opacity-50 m-0 uppercase tracking-widest border-b border-[#f9f9f9] pb-3 mb-4">
                Overall Completion
              </h3>
              <div className="flex items-end justify-between mb-2">
                <span className="text-[28px] font-black text-[#333] leading-none">
                  {progressPercent}%
                </span>
                <span className="text-[11px] font-bold opacity-50 uppercase">
                  {completedTasks} / {tasks.length} Tasks
                </span>
              </div>
              <div className="w-full h-2 bg-[#f9f9f9] rounded-full overflow-hidden border border-[#e5e5e5]">
                <div
                  className="h-full bg-[#111] transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-[#fff] border border-[#e5e5e5] rounded-[20px] shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-[#e5e5e5] bg-[#f9f9f9] flex justify-between items-center">
                <h3 className="text-[11px] font-bold text-[#333] opacity-50 m-0 uppercase tracking-widest">
                  Task Management Log
                </h3>
              </div>

              <div className="overflow-x-auto">
                {tasks.length === 0 ? (
                  <div className="p-10 text-center">
                    <p className="text-[13px] font-bold text-[#333] opacity-40 m-0">
                      No tasks have been assigned to this intern yet.
                    </p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-[#fff] border-b border-[#f9f9f9]">
                      <tr>
                        <th className="px-5 py-3 text-[10px] font-bold text-[#333] opacity-40 uppercase tracking-widest">
                          Task Detail
                        </th>
                        <th className="px-5 py-3 text-[10px] font-bold text-[#333] opacity-40 uppercase tracking-widest">
                          Deadline
                        </th>
                        <th className="px-5 py-3 text-[10px] font-bold text-[#333] opacity-40 uppercase tracking-widest text-right">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f9f9f9]">
                      {tasks.map((task) => (
                        <tr
                          key={task._id}
                          className="hover:bg-[#fcfcfc] transition-colors"
                        >
                          <td className="px-5 py-4">
                            <span className="text-[14px] font-bold text-[#333] block leading-tight">
                              {task.title}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-[12px] font-medium text-[#333] opacity-60 uppercase">
                              {task.deadline
                                ? new Date(task.deadline).toLocaleDateString(
                                    "en-IN",
                                    { day: "2-digit", month: "short" },
                                  )
                                : "—"}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-[10px] text-[9px] font-black uppercase tracking-widest border ${
                                task.status === "completed"
                                  ? "bg-[#111] text-[#fff] border-[#111]"
                                  : "bg-[#fff] border border-[#e5e5e5] text-[#333]"
                              }`}
                            >
                              {task.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
