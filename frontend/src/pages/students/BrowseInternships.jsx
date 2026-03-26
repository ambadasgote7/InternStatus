import React, { useEffect, useState } from "react";
import API from "../../api/api";
import { useNavigate } from "react-router-dom";

export default function BrowseInternships() {
  const [data, setData] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const navigate = useNavigate();

  const fetchData = async () => {
    const res = await API.get("/internships/browse");
    setData(res.data.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const apply = async (id) => {
    try {
      setLoadingId(id);
      await API.post(`/applications/apply/${id}`);
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] p-4 md:p-8 font-sans text-white selection:bg-fuchsia-500/30 selection:text-fuchsia-200">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 border-b border-white/10 pb-6">
          <h2 className="text-3xl md:text-4xl font-black m-0 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 mb-2">
            Browse Internships
          </h2>
          <p className="text-white/40 text-base font-medium m-0">
            Explore and apply for opportunities that match your skills
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {data.map((item) => (
            <div
              key={item._id}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 md:p-6 flex flex-col transition-all duration-300 hover:border-white/20 hover:-translate-y-1 hover:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] group"
            >
              <div className="mb-4">
                <h3 className="text-lg font-bold text-white/90 mt-0 mb-1 leading-tight group-hover:text-fuchsia-300 transition-colors">
                  {item.title}
                </h3>
                <p className="text-fuchsia-400 font-medium text-xs m-0 tracking-wide uppercase">
                  {item.company?.name}
                </p>
              </div>

              <div className="flex flex-col gap-3 mb-5 flex-grow">
                <div className="flex items-center gap-2.5 text-xs text-white/80 bg-[#0B0F19]/30 p-2.5 rounded-lg border border-white/5">
                  <span className="font-bold text-violet-400 uppercase text-[11px] tracking-widest w-14">
                    Mode
                  </span>
                  <span className="capitalize font-medium">{item.mode}</span>
                  <span className="text-white/20">|</span>
                  <span className="font-medium">{item.durationMonths} months</span>
                </div>

                <div className="flex items-center gap-2.5 text-xs text-white/80 bg-[#0B0F19]/30 p-2.5 rounded-lg border border-white/5">
                  <span className="font-bold text-violet-400 uppercase text-[11px] tracking-widest w-14">
                    Stipend
                  </span>
                  <span className="font-bold text-emerald-400">
                    {item.stipendType === "paid"
                      ? `₹${item.stipendAmount}`
                      : item.stipendType}
                  </span>
                </div>

                <div className="flex flex-col gap-1.5 mt-1.5">
                  <span className="font-bold text-white/40 uppercase text-[11px] tracking-widest">
                    Skills Required
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {item.skillsRequired?.slice(0, 3).map((skill, index) => (
                      <span
                        key={index}
                        className="px-2.5 py-1 bg-gradient-to-br from-white/5 to-white/10 border border-white/10 rounded-md text-[11px] font-medium text-white/80 shadow-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-auto pt-3 text-[11px] font-medium text-white/40 flex justify-between items-center border-t border-white/5">
                  <span className="uppercase tracking-widest">Deadline</span>
                  <span className="text-white/60">
                    {new Date(item.applicationDeadline).toLocaleDateString(
                      undefined,
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      }
                    )}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 pt-5 border-t border-white/10">
                <button
                  onClick={() => navigate(`/student/internships/${item._id}`)}
                  className="flex-1 px-3 py-2.5 text-xs font-bold text-white bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all duration-300 hover:-translate-y-0.5"
                >
                  View Details
                </button>

                <button
                  disabled={item.alreadyApplied || loadingId === item._id}
                  onClick={() => apply(item._id)}
                  className={`flex-1 px-3 py-2.5 text-xs font-bold rounded-lg transition-all duration-300 flex items-center justify-center gap-2
                    ${
                      item.alreadyApplied
                        ? "bg-white/5 border border-white/10 text-white/40 cursor-not-allowed"
                        : "bg-gradient-to-r from-violet-600 to-fuchsia-600 border-none text-white hover:shadow-[0_4px_15px_-3px_rgba(217,70,239,0.5)] hover:-translate-y-0.5 disabled:opacity-50"
                    }
                  `}
                >
                  {loadingId === item._id && (
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  )}
                  {item.alreadyApplied
                    ? "Applied"
                    : loadingId === item._id
                    ? "Applying..."
                    : "Apply Now"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}