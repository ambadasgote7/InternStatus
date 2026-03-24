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
      <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center font-sans">
        <p className="text-[14px] font-bold text-[#333] animate-pulse m-0 uppercase tracking-widest">
          Syncing Opportunity Data
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#f9f9f9] text-[#333] font-sans pb-10">
        <main className="max-w-6xl mx-auto w-full px-4 md:px-6 py-8 flex flex-col lg:flex-row gap-8">
          <section className="flex-1 flex flex-col gap-8">
            <div className="bg-[#fff] border border-[#e5e5e5] rounded-[20px] p-6 md:p-10 shadow-sm">
              <header className="mb-10 border-b border-[#f9f9f9] pb-6">
                <h1 className="text-[32px] md:text-[40px] font-black tracking-tight text-[#111] m-0 leading-tight">
                  {data.title}
                </h1>
                <p className="text-[14px] font-bold text-[#111] opacity-50 uppercase tracking-widest mt-2">
                  {data.company?.name}
                </p>
              </header>

              <div className="flex flex-col gap-10">
                <div className="flex flex-col gap-4">
                  <h3 className="text-[11px] font-black uppercase tracking-widest opacity-40 border-b border-[#f9f9f9] pb-2">
                    Program Specification
                  </h3>
                  <div className="text-[14px] font-medium leading-relaxed opacity-80 whitespace-pre-line">
                    {data.description}
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <h3 className="text-[11px] font-black uppercase tracking-widest opacity-40 border-b border-[#f9f9f9] pb-2">
                    Required Competencies
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {data.skillsRequired?.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-[#f9f9f9] border border-[#e5e5e5] rounded-[10px] text-[12px] font-bold"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <h3 className="text-[11px] font-black uppercase tracking-widest opacity-40 border-b border-[#f9f9f9] pb-2">
                    Eligibility Criteria
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#f9f9f9] p-6 rounded-[20px]">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold opacity-40 uppercase tracking-tighter">
                        Academic Streams
                      </span>
                      <span className="text-[13px] font-bold">
                        {data.eligibility?.courses?.join(", ") || "Open to all"}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold opacity-40 uppercase tracking-tighter">
                        Specializations
                      </span>
                      <span className="text-[13px] font-bold">
                        {data.eligibility?.specializations?.join(", ") ||
                          "All fields"}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold opacity-40 uppercase tracking-tighter">
                        Enrollment Bracket
                      </span>
                      <span className="text-[13px] font-bold">
                        Year {data.eligibility?.minYear} — Year{" "}
                        {data.eligibility?.maxYear}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold opacity-40 uppercase tracking-tighter">
                        Available Slots
                      </span>
                      <span className="text-[13px] font-bold">
                        {data.positions} active openings
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <aside className="w-full lg:w-[360px] flex-shrink-0">
            <div className="bg-[#fff] border border-[#e5e5e5] rounded-[20px] p-6 md:p-8 shadow-sm sticky top-8 flex flex-col gap-6">
              <div className="bg-[#f9f9f9] border border-[#e5e5e5] p-5 rounded-[18px] text-center">
                <span className="text-[10px] font-black opacity-40 uppercase tracking-widest block mb-1">
                  Stipend Bracket
                </span>
                <span className="text-[28px] font-black text-[#111] tracking-tighter">
                  {data.stipendType === "paid"
                    ? `INR ${data.stipendAmount}`
                    : data.stipendType.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#f9f9f9] p-4 rounded-[14px] border border-[#e5e5e5]">
                  <span className="text-[9px] font-bold opacity-40 uppercase block mb-1">
                    Duration
                  </span>
                  <span className="text-[14px] font-black">
                    {data.durationMonths} Months
                  </span>
                </div>
                <div className="bg-[#f9f9f9] p-4 rounded-[14px] border border-[#e5e5e5]">
                  <span className="text-[9px] font-bold opacity-40 uppercase block mb-1">
                    Work Mode
                  </span>
                  <span className="text-[14px] font-black capitalize">
                    {data.mode}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-4 border-t border-[#f9f9f9]">
                <div className="flex justify-between items-center bg-[#f9f9f9] px-4 py-3 rounded-[12px]">
                  <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">
                    Commencement
                  </span>
                  <span className="text-[12px] font-bold">
                    {new Date(data.startDate).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <div className="flex justify-between items-center bg-[#f9f9f9] px-4 py-3 rounded-[12px] border border-[#e5e5e5]">
                  <span className="text-[10px] font-black text-[#cc0000] uppercase tracking-widest">
                    Deadline
                  </span>
                  <span className="text-[12px] font-black text-[#cc0000]">
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

              <button
                disabled={data.alreadyApplied || loading}
                onClick={apply}
                className={`w-full py-4 text-[12px] font-black rounded-[14px] border-none uppercase tracking-[0.1em] transition-all cursor-pointer flex items-center justify-center gap-2
                ${
                  data.alreadyApplied
                    ? "bg-[#f9f9f9] text-[#333] opacity-50 cursor-not-allowed"
                    : "bg-[#111] text-[#fff] hover:opacity-80 disabled:opacity-30 shadow-sm"
                }
              `}
              >
                {loading
                  ? "Processing..."
                  : data.alreadyApplied
                    ? "Already Registered"
                    : "Submit Application"}
              </button>
            </div>
          </aside>
        </main>
      </div>
    </>
  );
}
