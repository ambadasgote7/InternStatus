import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/api";

export default function StudentInternships() {
  const navigate = useNavigate();
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInternships();
  }, []);

  const fetchInternships = async () => {
    try {
      const res = await API.get("/students/internships");
      setInternships(res.data.data || []);
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
          Loading Your Internships...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#333] font-sans pb-10">
      <main className="max-w-7xl mx-auto w-full px-4 md:px-6 py-6 flex flex-col gap-6">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#e5e5e5] pb-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-[23px] font-black text-[#333] m-0 tracking-tight leading-tight">
              My Internships
            </h1>
            <p className="text-[13px] font-bold text-[#333] opacity-60 m-0 uppercase tracking-widest">
              Professional Engagement Track
            </p>
          </div>
        </header>

        {!internships.length ? (
          <div className="bg-[#fff] border-2 border-dashed border-[#e5e5e5] rounded-[20px] p-10 text-center">
            <p className="text-[13px] font-bold text-[#333] opacity-60 m-0">
              No internship records found in your profile.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {internships.map((internship) => {
              const isCompleted = internship.status === "completed";
              const isOngoing = internship.status === "ongoing";

              return (
                <div
                  key={internship._id}
                  className="bg-[#fff] border border-[#e5e5e5] rounded-[20px] p-5 shadow-sm hover:border-[#333] transition-colors flex flex-col justify-between"
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <span
                        className={`px-2.5 py-1 rounded-[10px] text-[9px] font-black uppercase tracking-widest border ${
                          isOngoing
                            ? "bg-[#111] text-[#fff] border-[#111]"
                            : "bg-[#f9f9f9] text-[#333] border-[#e5e5e5]"
                        }`}
                      >
                        {internship.status}
                      </span>
                    </div>

                    <div>
                      <h2 className="text-[17px] font-black text-[#333] m-0 leading-tight">
                        {internship.internship?.title}
                      </h2>

                      <div className="mt-4 flex flex-col gap-2.5">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-[#333] opacity-40 uppercase tracking-widest">
                            Organization
                          </span>
                          <span className="text-[13px] font-bold text-[#333]">
                            {internship.company?.name}
                          </span>
                        </div>

                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-[#333] opacity-40 uppercase tracking-widest">
                            Mentor
                          </span>
                          <span className="text-[13px] font-bold text-[#333]">
                            {internship.mentor?.fullName ||
                              "Awaiting Assignment"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#f9f9f9]">
                    {isOngoing && (
                      <button
                        onClick={() =>
                          navigate(`/student/task/${internship.currentTaskId}`)
                        }
                        className="w-full py-2.5 bg-[#111] text-[#fff] text-[11px] font-bold rounded-[14px] hover:opacity-80 transition-opacity cursor-pointer uppercase tracking-widest border-none"
                      >
                        Track Current Task
                      </button>
                    )}

                    {isCompleted && (
                      <button
                        onClick={() =>
                          navigate(`/student/academic/${internship._id}`)
                        }
                        className="w-full py-2.5 bg-[#f9f9f9] border border-[#333] text-[#333] text-[11px] font-bold rounded-[14px] hover:bg-[#333] hover:text-[#fff] transition-all cursor-pointer uppercase tracking-widest"
                      >
                        View Full Summary
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
