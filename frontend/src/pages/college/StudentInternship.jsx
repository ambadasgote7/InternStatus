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
      <div className="min-h-screen bg-white flex items-center justify-center font-['Nunito']">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#6C5CE7]/20 border-t-[#6C5CE7] rounded-full animate-spin"></div>
          <p className="text-[14px] font-black text-[#2D3436] animate-pulse uppercase tracking-[0.3em]">
            Loading Your Journey...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#2D3436] font-['Nunito'] pb-16">
      <main className="max-w-7xl mx-auto w-full px-4 md:px-8 py-10 flex flex-col gap-10">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#F5F6FA] pb-8 animate-in fade-in slide-in-from-top-5 duration-700">
          <div className="flex flex-col gap-2">
            <h1 className="text-[32px] md:text-[40px] font-black text-[#2D3436] m-0 tracking-tight leading-tight">
              My <span className="text-[#6C5CE7]">Internships</span>
            </h1>
            <p className="text-[12px] font-black text-[#2D3436] opacity-40 m-0 uppercase tracking-[0.25em]">
              Professional Engagement Track
            </p>
          </div>
          
          <div className="hidden md:block">
             <div className="px-6 py-3 bg-[#F5F6FA] rounded-2xl text-[11px] font-black uppercase tracking-widest text-[#6C5CE7]">
               {internships.length} Active Records
             </div>
          </div>
        </header>

        {!internships.length ? (
          <div className="bg-white border-4 border-dashed border-[#F5F6FA] rounded-[40px] p-20 text-center animate-in fade-in zoom-in duration-500">
            <div className="text-5xl mb-6 opacity-20">📂</div>
            <p className="text-[14px] font-black text-[#2D3436] opacity-40 m-0 uppercase tracking-widest leading-loose">
              No internship records found <br /> in your professional profile.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {internships.map((internship, index) => {
              const isCompleted = internship.status === "completed";
              const isOngoing = internship.status === "ongoing";

              return (
                <div
                  key={internship._id}
                  style={{ animationDelay: `${index * 100}ms` }}
                  className="bg-white border-2 border-[#F5F6FA] rounded-[35px] p-7 shadow-sm hover:shadow-2xl hover:shadow-[#6C5CE7]/10 hover:border-[#6C5CE7]/30 transition-all duration-500 flex flex-col justify-between group animate-in fade-in slide-in-from-bottom-8"
                >
                  <div className="flex flex-col gap-6">
                    <div className="flex justify-between items-start">
                      <span
                        className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border-2 transition-colors ${
                          isOngoing
                            ? "bg-[#6C5CE7] text-white border-[#6C5CE7] shadow-lg shadow-[#6C5CE7]/20"
                            : "bg-[#F5F6FA] text-[#2D3436] border-[#F5F6FA] opacity-60"
                        }`}
                      >
                        {internship.status}
                      </span>
                      <div className="w-10 h-10 bg-[#F5F6FA] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6C5CE7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17l9.2-9.2M17 17V7H7"/></svg>
                      </div>
                    </div>

                    <div>
                      <h2 className="text-[20px] font-black text-[#2D3436] m-0 leading-tight group-hover:text-[#6C5CE7] transition-colors duration-300">
                        {internship.internship?.title}
                      </h2>

                      <div className="mt-8 flex flex-col gap-5">
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] font-black text-[#2D3436] opacity-30 uppercase tracking-[0.25em]">
                            Organization
                          </span>
                          <span className="text-[14px] font-bold text-[#2D3436]">
                            {internship.company?.name}
                          </span>
                        </div>

                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] font-black text-[#2D3436] opacity-30 uppercase tracking-[0.25em]">
                            Mentor
                          </span>
                          <span className="text-[14px] font-bold text-[#2D3436] flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#6C5CE7]"></div>
                            {internship.mentor?.fullName || "Awaiting Assignment"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-10 pt-6 border-t border-[#F5F6FA]">
                    {isOngoing && (
                      <button
                        onClick={() => navigate(`/student/task/${internship.currentTaskId}`)}
                        className="w-full py-4 bg-[#2D3436] text-white text-[11px] font-black rounded-2xl hover:bg-[#6C5CE7] shadow-lg hover:shadow-[#6C5CE7]/30 transition-all duration-300 cursor-pointer uppercase tracking-[0.2em] border-none outline-none"
                      >
                        Track Current Task
                      </button>
                    )}

                    {isCompleted && (
                      <button
                        onClick={() => navigate(`/student/academic/${internship._id}`)}
                        className="w-full py-4 bg-white border-2 border-[#2D3436] text-[#2D3436] text-[11px] font-black rounded-2xl hover:bg-[#2D3436] hover:text-white transition-all duration-300 cursor-pointer uppercase tracking-[0.2em]"
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