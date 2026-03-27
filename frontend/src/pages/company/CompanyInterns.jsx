import React, { useEffect, useState } from "react";
import API from "../../api/api";
import { useNavigate } from "react-router-dom";

const QUICK_STATUS_BUTTONS = ["ALL", "ongoing", "completed", "terminated"];

export default function CompanyInterns() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ongoing"); // DEFAULT = ongoing

  const navigate = useNavigate();

  const STATUS_OPTIONS = [
    "ALL",
    "offer_accepted",
    "ongoing",
    "completed",
    "terminated",
    "rejected",
  ];

  useEffect(() => {
    const fetchInterns = async () => {
      try {
        const res = await API.get("/company/interns");
        setData(res?.data?.data || []);
      } catch (err) {
        console.error("Fetch interns error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInterns();
  }, []);

  const getStatusBadge = (status) => {
    // Logic preserved: status colors kept as per instructions
    let cls = "bg-[#F5F6FA] border-[#E5E5E5] text-[#2D3436]";

    if (["completed", "offer_accepted"].includes(status)) {
      cls = "bg-emerald-50 border-emerald-200 text-emerald-600";
    } else if (status === "ongoing") {
      cls = "bg-[#6C5CE7] text-[#FFFFFF] border-[#6C5CE7]";
    } else if (["terminated", "rejected"].includes(status)) {
      cls = "bg-rose-50 border-rose-200 text-rose-600";
    }

    return (
      <span
        className={`px-3 py-1 rounded-[10px] text-[10px] font-extrabold uppercase tracking-widest border transition-all duration-300 shadow-sm ${cls}`}
      >
        {status ? status.replace("_", " ") : "UNKNOWN"}
      </span>
    );
  };

  const filteredData = data.filter((item) => {
    const name = item?.student?.fullName || "";
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] flex flex-col items-center justify-center font-['Nunito']">
        <div className="w-12 h-12 border-4 border-[#F5F6FA] border-t-[#6C5CE7] rounded-full animate-spin mb-4"></div>
        <p className="text-[14px] font-black text-[#6C5CE7] animate-pulse uppercase tracking-[0.2em]">
          Syncing Roster...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#2D3436] font-['Nunito'] pb-20 selection:bg-[#6C5CE7]/10">
      <main className="max-w-6xl mx-auto px-4 md:px-8 py-10 flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* HEADER SECTION */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#F5F6FA] pb-10">
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tighter text-[#2D3436] m-0">
              Company <span className="text-[#6C5CE7]">Interns</span>
            </h1>
            <p className="text-[11px] font-extrabold opacity-50 uppercase tracking-[0.3em] text-[#2D3436]">
              Active Roster Management & Tracking
            </p>
          </div>
          <div className="flex items-center gap-2 text-[12px] font-black bg-[#F5F6FA] text-[#6C5CE7] border border-[#6C5CE7]/10 px-5 py-2.5 rounded-[15px] uppercase tracking-widest shadow-sm">
            <span className="opacity-50 text-[#2D3436]">Headcount:</span> {data.length}
          </div>
        </header>

        {/* FILTERS AREA */}
        {data.length > 0 && (
          <section className="flex flex-col gap-6 p-2">
            {/* Quick Filter Pill Buttons */}
            <div className="flex flex-wrap gap-3">
              {QUICK_STATUS_BUTTONS.map((status, idx) => {
                const isActive = statusFilter === status;
                return (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    style={{ animationDelay: `${idx * 50}ms` }}
                    className={`px-6 py-2.5 text-[11px] font-black uppercase tracking-[0.15em] rounded-full border transition-all duration-300 cursor-pointer animate-in zoom-in-95 ${
                      isActive
                        ? "bg-[#6C5CE7] text-[#FFFFFF] border-[#6C5CE7] shadow-lg shadow-[#6C5CE7]/20 -translate-y-0.5"
                        : "bg-[#FFFFFF] text-[#2D3436] border-[#F5F6FA] hover:border-[#6C5CE7]/30 hover:bg-[#F5F6FA]"
                    }`}
                  >
                    {status === "ALL" ? "View All" : status}
                  </button>
                );
              })}
            </div>

            {/* Advanced Search & Select */}
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full group">
                <input
                  type="text"
                  placeholder="Search by intern name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-6 pr-4 py-4 text-[14px] bg-[#F5F6FA] text-[#2D3436] border border-transparent rounded-[20px] focus:outline-none focus:bg-[#FFFFFF] focus:border-[#6C5CE7] focus:ring-4 focus:ring-[#6C5CE7]/5 transition-all placeholder:text-[#2D3436]/30 font-semibold"
                />
              </div>
              <div className="w-full md:w-64">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-6 py-4 text-[11px] font-black bg-[#F5F6FA] text-[#2D3436] border border-transparent rounded-[20px] uppercase tracking-widest focus:outline-none focus:bg-[#FFFFFF] focus:border-[#6C5CE7] transition-all cursor-pointer appearance-none"
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status === "ALL" ? "All Categories" : status.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>
        )}

        {/* DATA DISPLAY */}
        <section className="animate-in fade-in duration-1000">
          {data.length === 0 ? (
            <div className="bg-[#F5F6FA]/50 border-2 border-dashed border-[#E5E5E5] rounded-[32px] py-32 text-center">
              <div className="text-[#6C5CE7] opacity-20 mb-4 flex justify-center">
                 <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </div>
              <p className="text-[14px] font-black text-[#2D3436] opacity-40 uppercase tracking-[0.2em]">
                No Interns Registered Yet
              </p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="bg-[#F5F6FA]/30 border border-[#F5F6FA] rounded-[32px] py-32 text-center">
              <p className="text-[13px] font-black text-[#6C5CE7] uppercase tracking-[0.2em]">
                Zero Matches for current filters
              </p>
            </div>
          ) : (
            <div className="bg-[#FFFFFF] border border-[#F5F6FA] rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F5F6FA]/70 border-b border-[#F5F6FA]">
                      {["Intern Name", "Assigned Role", "Current Status", "Actions"].map((head, i) => (
                        <th key={head} className={`p-6 text-[11px] uppercase font-black text-[#2D3436] opacity-40 tracking-[0.15em] ${i === 3 ? "text-right" : ""}`}>
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F5F6FA]">
                    {filteredData.map((item, index) => (
                      <tr
                        key={item._id}
                        className="group hover:bg-[#F5F6FA]/40 transition-all duration-300"
                      >
                        <td className="p-6">
                          <div className="flex flex-col">
                            <span className="font-black text-[15px] text-[#2D3436] group-hover:text-[#6C5CE7] transition-colors">
                              {item?.student?.fullName || "—"}
                            </span>
                            <span className="text-[10px] text-[#2D3436]/40 font-bold uppercase tracking-widest mt-0.5">
                              ID: {item._id.slice(-6).toUpperCase()}
                            </span>
                          </div>
                        </td>
                        <td className="p-6">
                          <span className="text-[14px] font-semibold text-[#2D3436]/70 italic">
                            {item?.internship?.title || "—"}
                          </span>
                        </td>
                        <td className="p-6 whitespace-nowrap">
                          {getStatusBadge(item.status)}
                        </td>
                        <td className="p-6 text-right">
                          <button
                            onClick={() => navigate(`/company/intern/${item._id}`)}
                            className="px-6 py-2.5 bg-[#FFFFFF] border border-[#F5F6FA] text-[#2D3436] text-[11px] font-black uppercase tracking-widest rounded-[14px] hover:border-[#6C5CE7] hover:text-[#6C5CE7] hover:shadow-lg hover:shadow-[#6C5CE7]/10 transition-all duration-300 active:scale-95"
                          >
                            View Profile
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}