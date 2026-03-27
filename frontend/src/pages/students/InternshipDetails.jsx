import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../api/api";

export default function InternshipDetails() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const fetchData = async () => {
    try {
      const res = await API.get(`/internships/${id}`);
      setData(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const apply = async () => {
    try {
      setLoading(true);
      await API.post(`/applications/apply/${id}`);
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Application failed");
    } finally {
      setLoading(false);
    }
  };

  if (fetching || !data) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] flex items-center justify-center font-['Nunito'] transition-all duration-300">
        <div className="flex flex-col items-center gap-4 animate-in fade-in duration-700">
          <div className="w-12 h-12 border-4 border-[#F5F6FA] border-t-[#6C5CE7] rounded-full animate-spin"></div>
          <p className="text-[12px] font-black text-[#6C5CE7] animate-pulse m-0 uppercase tracking-widest">
            Syncing Opportunity Data
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#FFFFFF] text-[#2D3436] font-['Nunito'] pb-12 transition-all duration-500 selection:bg-[#6C5CE7]/20 selection:text-[#6C5CE7]">
        <main className="max-w-7xl mx-auto w-full px-4 md:px-8 py-8 md:py-12 flex flex-col lg:flex-row gap-8 lg:gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <section className="flex-1 flex flex-col gap-8 lg:gap-10">
            <div className="bg-[#FFFFFF] border border-[#F5F6FA] rounded-[32px] p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] transition-all duration-500">
              {/* Header Info */}
              <header className="mb-10 border-b border-[#F5F6FA] pb-8">
                <div className="inline-flex items-center px-4 py-2 rounded-[12px] bg-[#F5F6FA] text-[#6C5CE7] text-[10px] font-black uppercase tracking-widest mb-6 shadow-sm">
                  {data.mode} Position
                </div>
                <h1 className="text-[36px] md:text-[48px] font-black tracking-tighter text-[#2D3436] m-0 leading-tight mb-3">
                  {data.title}
                </h1>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#F5F6FA] flex items-center justify-center text-[12px] font-black text-[#6C5CE7]">
                    {data.company?.name?.charAt(0) || "C"}
                  </div>
                  <p className="text-[16px] font-bold text-[#2D3436] opacity-70 m-0">
                    {data.company?.name}
                  </p>
                  {data.location && (
                    <>
                      <span className="text-[#2D3436] opacity-30">•</span>
                      <p className="text-[14px] font-bold text-[#2D3436] opacity-60 m-0">
                        {data.location}
                      </p>
                    </>
                  )}
                </div>
              </header>

              <div className="flex flex-col gap-12">
                {/* Description */}
                <div className="flex flex-col gap-5">
                  <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-[#6C5CE7] border-b border-[#F5F6FA] pb-3 m-0 flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#6C5CE7] mr-3"></span>
                    Program Specification
                  </h3>
                  <div className="text-[15px] font-bold leading-relaxed text-[#2D3436] opacity-80 whitespace-pre-line bg-[#F5F6FA]/50 p-6 rounded-[24px] border border-transparent hover:border-[#6C5CE7]/10 transition-colors">
                    {data.description}
                  </div>
                </div>

                {/* Skills */}
                <div className="flex flex-col gap-5">
                  <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-[#6C5CE7] border-b border-[#F5F6FA] pb-3 m-0 flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#6C5CE7] mr-3"></span>
                    Required Competencies
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {data.skillsRequired?.map((skill, index) => (
                      <span
                        key={index}
                        className="px-5 py-2.5 bg-[#F5F6FA] border border-transparent rounded-[14px] text-[12px] font-black text-[#2D3436] opacity-80 uppercase tracking-widest hover:border-[#6C5CE7]/30 hover:text-[#6C5CE7] transition-all duration-300 cursor-default shadow-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Eligibility */}
                <div className="flex flex-col gap-5">
                  <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-[#6C5CE7] border-b border-[#F5F6FA] pb-3 m-0 flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#6C5CE7] mr-3"></span>
                    Eligibility Criteria
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#F5F6FA] p-8 rounded-[24px] border border-transparent hover:border-[#6C5CE7]/10 transition-all duration-300">
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-black opacity-40 uppercase tracking-widest text-[#2D3436]">
                        Academic Streams
                      </span>
                      <span className="text-[14px] font-black text-[#2D3436]">
                        {data.eligibility?.courses?.join(", ") || "Open to all"}
                      </span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-black opacity-40 uppercase tracking-widest text-[#2D3436]">
                        Specializations
                      </span>
                      <span className="text-[14px] font-black text-[#2D3436]">
                        {data.eligibility?.specializations?.join(", ") ||
                          "All fields"}
                      </span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-black opacity-40 uppercase tracking-widest text-[#2D3436]">
                        Enrollment Bracket
                      </span>
                      <span className="text-[14px] font-black text-[#2D3436]">
                        Year {data.eligibility?.minYear} — Year{" "}
                        {data.eligibility?.maxYear}
                      </span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-black opacity-40 uppercase tracking-widest text-[#2D3436]">
                        Available Slots
                      </span>
                      <span className="text-[14px] font-black text-[#6C5CE7] bg-[#FFFFFF] px-3 py-1 rounded-[10px] w-max shadow-sm">
                        {data.positions} active openings
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Action Sidebar */}
          <aside className="w-full lg:w-[400px] flex-shrink-0">
            <div className="bg-[#FFFFFF] border border-[#F5F6FA] rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sticky top-8 flex flex-col gap-8 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)]">
              {/* Stipend Card */}
              <div className="bg-gradient-to-br from-[#F5F6FA] to-[#FFFFFF] border border-[#F5F6FA] p-8 rounded-[24px] text-center shadow-sm relative overflow-hidden group">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#6C5CE7]/5 rounded-full blur-xl group-hover:bg-[#6C5CE7]/10 transition-colors"></div>
                <span className="text-[11px] font-black text-[#6C5CE7] uppercase tracking-[0.2em] block mb-3 relative z-10">
                  Stipend Bracket
                </span>
                <span className="text-[32px] font-black text-[#2D3436] tracking-tighter relative z-10">
                  {data.stipendType === "paid"
                    ? `INR ${data.stipendAmount}`
                    : data.stipendType.toUpperCase()}
                </span>
                {data.stipendType === "paid" && (
                  <span className="text-[10px] font-bold text-[#2D3436] opacity-40 uppercase tracking-widest block mt-2 relative z-10">
                    / Month
                  </span>
                )}
              </div>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#F5F6FA] p-5 rounded-[20px] border border-transparent hover:border-[#6C5CE7]/20 transition-all duration-300">
                  <span className="text-[10px] font-black text-[#2D3436] opacity-40 uppercase tracking-widest block mb-2">
                    Duration
                  </span>
                  <span className="text-[16px] font-black text-[#2D3436]">
                    {data.durationMonths} Months
                  </span>
                </div>
                <div className="bg-[#F5F6FA] p-5 rounded-[20px] border border-transparent hover:border-[#6C5CE7]/20 transition-all duration-300">
                  <span className="text-[10px] font-black text-[#2D3436] opacity-40 uppercase tracking-widest block mb-2">
                    Work Mode
                  </span>
                  <span className="text-[16px] font-black text-[#2D3436] capitalize">
                    {data.mode}
                  </span>
                </div>
              </div>

              {/* Dates */}
              <div className="flex flex-col gap-3 pt-6 border-t border-[#F5F6FA]">
                <div className="flex justify-between items-center bg-[#FFFFFF] border border-[#F5F6FA] px-5 py-4 rounded-[16px] hover:shadow-sm transition-all duration-300">
                  <span className="text-[10px] font-black text-[#2D3436] opacity-50 uppercase tracking-widest">
                    Commencement
                  </span>
                  <span className="text-[13px] font-black text-[#2D3436]">
                    {new Date(data.startDate).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <div className="flex justify-between items-center bg-rose-50 border border-rose-100 px-5 py-4 rounded-[16px] shadow-sm">
                  <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">
                    Deadline
                  </span>
                  <span className="text-[13px] font-black text-rose-600">
                    {new Date(data.applicationDeadline).toLocaleDateString(
                      "en-IN",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      },
                    )}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                disabled={data.alreadyApplied || loading}
                onClick={apply}
                className={`w-full py-5 text-[12px] font-black rounded-[16px] border-none uppercase tracking-[0.2em] transition-all duration-300 cursor-pointer flex items-center justify-center gap-3 outline-none transform active:scale-95
                ${
                  data.alreadyApplied
                    ? "bg-[#F5F6FA] text-[#2D3436] opacity-50 cursor-not-allowed shadow-none"
                    : "bg-[#6C5CE7] text-[#FFFFFF] hover:bg-opacity-90 hover:shadow-[0_10px_25px_-5px_rgba(108,92,231,0.4)] hover:-translate-y-1 shadow-md"
                }
              `}
              >
                {loading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-[#FFFFFF]/30 border-t-[#FFFFFF] rounded-full animate-spin"></span>
                    Processing...
                  </>
                ) : data.alreadyApplied ? (
                  "Already Registered"
                ) : (
                  "Submit Application"
                )}
              </button>
            </div>
          </aside>
        </main>
      </div>
    </>
  );
}
