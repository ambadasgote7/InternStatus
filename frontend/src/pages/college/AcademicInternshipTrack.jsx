import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../api/api";

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
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
  );

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

export default function AcademicInternshipTrack() {
  const { applicationId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [applicationId]);

  const fetchData = async () => {
    try {
      const res = await API.get(
        `/applications/${applicationId}/academic-track`,
      );
      setData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center">
        <p className="text-[14px] font-bold text-[#333] animate-pulse">
          Loading tracking data...
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] p-6">
        <div className="max-w-6xl mx-auto bg-[#fff] border-2 border-dashed border-[#e5e5e5] rounded-[20px] p-10 text-center">
          <p className="text-[14px] font-bold text-[#333] opacity-60">
            No data found
          </p>
        </div>
      </div>
    );
  }

  const weeklyTasks = groupTasksByWeek(data.tasks);

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#333] font-sans pb-12">
      <div className="max-w-6xl mx-auto p-4 md:p-6 flex flex-col gap-6">
        <div className="bg-[#fff] border border-[#e5e5e5] rounded-[20px] p-6 shadow-sm">
          <h1 className="text-[23px] font-black text-[#333] m-0 mb-6 tracking-tight">
            Internship Tracking
          </h1>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4 border-t border-[#f9f9f9]">
            <Info label="Student" value={data.student?.fullName} />
            <Info label="Company" value={data.company?.name} />
            <Info label="Mentor" value={data.mentor?.fullName} />
            <Info label="Status" value={data.status} isStatus />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {weeklyTasks.map((week) => (
            <div
              key={week.weekNumber}
              className="bg-[#fff] border border-[#e5e5e5] rounded-[20px] overflow-hidden shadow-sm"
            >
              <div className="bg-[#f9f9f9] px-5 py-3 border-b border-[#e5e5e5] flex justify-between items-center">
                <div className="text-[13px] font-black text-[#333] uppercase tracking-widest">
                  Week {week.weekNumber}
                </div>
                <div className="text-[11px] font-bold text-[#333] opacity-50 uppercase tracking-widest">
                  {formatDate(week.startDate)} — {formatDate(week.endDate)}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#e5e5e5]">
                      <th className="px-5 py-3 text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest w-20">
                        Sr.
                      </th>
                      <th className="px-5 py-3 text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                        Task Title
                      </th>
                      <th className="px-5 py-3 text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest text-right">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f9f9f9]">
                    {week.tasks.map((task, index) => (
                      <tr
                        key={task._id || index}
                        className="hover:bg-[#fcfcfc] transition-colors"
                      >
                        <td className="px-5 py-3 text-[13px] font-medium text-[#333] opacity-50">
                          {index + 1}
                        </td>
                        <td className="px-5 py-3 text-[13px] font-bold text-[#333]">
                          {task.title || `Task ${index + 1}`}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-[10px] text-[10px] font-black uppercase tracking-widest ${
                              task.status === "completed"
                                ? "bg-[#111] text-[#fff]"
                                : "bg-[#fff] border border-[#333] text-[#333]"
                            }`}
                          >
                            {task.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Info({ label, value, isStatus }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-bold text-[#333] opacity-50 uppercase tracking-widest">
        {label}
      </span>
      <div
        className={`text-[14px] font-bold text-[#333] leading-tight ${isStatus ? "uppercase tracking-wide" : ""}`}
      >
        {value || "—"}
      </div>
    </div>
  );
}
