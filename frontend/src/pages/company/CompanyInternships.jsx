import React, { useEffect, useState } from "react";
import API from "../../api/api";
import { useNavigate } from "react-router-dom";

// ==========================================
// 1. Reusable Status Badge Component
// ==========================================
const StatusBadge = ({ status }) => {
  const isOpen = status === "open";
  return (
    <span
      className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border-2 transition-all duration-300 ${
        isOpen
          ? "bg-[#F5F6FA] border-[#008000] text-[#008000] shadow-[0_4px_10px_rgba(0,128,0,0.1)]"
          : "bg-[#FFFFFF] border-[#cc0000] text-[#cc0000] shadow-[0_4px_10px_rgba(204,0,0,0.1)]"
      }`}
    >
      {status ? status : "UNKNOWN"}
    </span>
  );
};

// ==========================================
// 2. Main Internships Component
// ==========================================
export default function CompanyInternships() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loadingId, setLoadingId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [expandedId, setExpandedId] = useState(null);

  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await API.get("/internships/company");
      setData(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load internships");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleStatus = async (id, currentStatus) => {
    try {
      setLoadingId(id);
      const newStatus = currentStatus === "open" ? "closed" : "open";
      await API.patch(`/internships/${id}/status`, { status: newStatus });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
    } finally {
      setLoadingId(null);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredData = data.filter((item) => {
    const matchesSearch = (item.title || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const uniqueStatuses = [
    "ALL",
    ...new Set(data.map((i) => i.status).filter(Boolean)),
  ];

  if (loading) {
    return (
      <div className="h-screen bg-[#FFFFFF] flex flex-col items-center justify-center font-['Nunito']">
        <div className="w-12 h-12 border-[5px] border-[#F5F6FA] border-t-[#6C5CE7] rounded-full animate-spin mb-6" />
        <p className="text-[12px] font-black text-[#2D3436] tracking-[0.4em] uppercase opacity-40">
          Loading Console
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#2D3436] font-['Nunito'] pb-20 transition-all">
      <main className="max-w-7xl mx-auto w-full px-4 md:px-8 py-12 flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b-2 border-[#F5F6FA] pb-10">
          <div className="flex flex-col gap-3">
            <h1 className="text-[40px] font-black text-[#2D3436] m-0 tracking-tighter leading-tight">
              Company <span className="text-[#6C5CE7]">Dashboard</span>
            </h1>
            <div className="flex items-center gap-3">
              <span className="w-10 h-[2px] bg-[#6C5CE7]"></span>
              <p className="text-[11px] font-black text-[#6C5CE7] m-0 uppercase tracking-[0.3em] opacity-90">
                Active Internship Portfolios
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-[#F5F6FA] p-2 rounded-[24px] border border-[#F5F6FA]">
             <div className="bg-white px-6 py-4 rounded-[20px] shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Live Listings</p>
                <p className="text-[22px] font-black text-[#6C5CE7] leading-none">{data.length}</p>
             </div>
          </div>
        </header>

        {error && (
          <div className="px-6 py-5 text-[12px] font-black text-[#cc0000] bg-[#cc0000]/5 border-2 border-[#cc0000]/10 rounded-3xl uppercase tracking-widest text-center animate-bounce">
            {error}
          </div>
        )}

        {/* Dynamic Filters */}
        {data.length > 0 && (
          <div className="flex flex-col lg:flex-row gap-5 animate-in fade-in slide-in-from-left-8 duration-700">
            <div className="relative flex-1 group">
              <input
                type="text"
                placeholder="Filter by position title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-5 text-[15px] font-bold text-[#2D3436] bg-[#F5F6FA] border-2 border-transparent rounded-[24px] outline-none transition-all group-hover:bg-[#F5F6FA]/80 focus:bg-white focus:border-[#6C5CE7]/40 focus:shadow-[0_20px_40px_rgba(108,92,231,0.08)]"
              />
              <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-[#2D3436] opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </div>
            
            <div className="relative w-full lg:w-72 group">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-8 py-5 text-[11px] font-black text-[#2D3436] bg-[#F5F6FA] border-2 border-transparent rounded-[24px] outline-none transition-all focus:bg-white focus:border-[#6C5CE7]/40 appearance-none uppercase tracking-[0.2em] cursor-pointer shadow-sm"
              >
                {uniqueStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status === "ALL" ? "View All Statuses" : status}
                  </option>
                ))}
              </select>
              <svg className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2D3436] opacity-30 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" strokeWidth="3"/></svg>
            </div>
          </div>
        )}

        {/* Table/Data Area */}
        {data.length === 0 && !error ? (
          <div className="bg-[#FFFFFF] border-4 border-dashed border-[#F5F6FA] rounded-[60px] p-32 text-center transition-all hover:border-[#6C5CE7]/20">
            <div className="w-24 h-24 bg-[#F5F6FA] rounded-[32px] flex items-center justify-center mx-auto mb-8 rotate-12 group hover:rotate-0 transition-transform duration-500">
              <svg className="w-12 h-12 text-[#6C5CE7]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth="3" strokeLinecap="round"/></svg>
            </div>
            <p className="text-[14px] font-black text-[#2D3436] opacity-30 m-0 uppercase tracking-[0.4em]">
              Empty Portfolio. Post your first internship.
            </p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="bg-white border-2 border-[#F5F6FA] rounded-[40px] p-24 text-center">
            <p className="text-[13px] font-black text-[#2D3436] opacity-40 m-0 uppercase tracking-[0.2em] mb-8">
              No matches in your current view.
            </p>
            <button
              onClick={() => { setSearchTerm(""); setStatusFilter("ALL"); }}
              className="px-10 py-4 bg-[#6C5CE7] text-white text-[11px] font-black uppercase tracking-widest rounded-[20px] hover:shadow-[0_20px_40px_rgba(108,92,231,0.4)] transition-all active:scale-95"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="bg-[#FFFFFF] border-2 border-[#F5F6FA] rounded-[40px] shadow-[0_40px_100px_rgba(45,52,54,0.03)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F5F6FA]/40">
                    <th className="p-8 text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-[0.25em]">Internship Title</th>
                    <th className="p-8 text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-[0.25em]">Deadline</th>
                    <th className="p-8 text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-[0.25em]">Status</th>
                    <th className="p-8 text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-[0.25em] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-[#F5F6FA]">
                  {filteredData.map((item, index) => {
                    const isExpanded = expandedId === item._id;
                    const isOpen = item.status === "open";

                    return (
                      <React.Fragment key={item._id}>
                        <tr className={`group transition-all duration-500 ${isExpanded ? "bg-[#6C5CE7]/[0.02]" : "hover:bg-[#F5F6FA]/50"}`}>
                          <td className="p-8 align-middle">
                            <span className="text-[18px] font-black text-[#2D3436] tracking-tight block group-hover:text-[#6C5CE7] transition-colors duration-300">
                              {item.title}
                            </span>
                          </td>
                          <td className="p-8 align-middle">
                            <span className="inline-flex items-center gap-2 text-[13px] font-bold text-[#2D3436] bg-[#F5F6FA] px-4 py-2 rounded-xl group-hover:bg-white transition-colors border border-transparent group-hover:border-[#6C5CE7]/10">
                              <svg className="w-4 h-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeWidth="2"/></svg>
                              {item.applicationDeadline ? new Date(item.applicationDeadline).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                            </span>
                          </td>
                          <td className="p-8 align-middle">
                            <StatusBadge status={item.status} />
                          </td>
                          <td className="p-8 align-middle text-right">
                            <div className="flex justify-end gap-3">
                              <button
                                onClick={() => navigate(`/company/internship/${item._id}/applicants`)}
                                className="px-6 py-3 bg-[#2D3436] text-[#FFFFFF] text-[10px] font-black uppercase tracking-widest rounded-[16px] hover:bg-[#6C5CE7] transition-all duration-300 shadow-lg active:scale-95"
                              >
                                Applicants
                              </button>
                              <button
                                onClick={() => toggleExpand(item._id)}
                                className={`w-12 h-12 flex items-center justify-center rounded-[16px] border-2 transition-all duration-300 ${isExpanded ? "bg-[#6C5CE7] border-[#6C5CE7] text-white rotate-180" : "bg-white border-[#F5F6FA] text-[#2D3436] hover:border-[#6C5CE7]/40 shadow-sm"}`}
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                              </button>
                            </div>
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr>
                            <td colSpan={4} className="p-0 border-none">
                              <div className="bg-[#F5F6FA]/30 px-8 py-10 animate-in slide-in-from-top-4 duration-500 overflow-hidden">
                                <div className="bg-white rounded-[32px] p-10 border border-[#F5F6FA] shadow-2xl flex flex-col md:flex-row justify-between items-center gap-10">
                                  <div className="grid grid-cols-2 gap-12">
                                    <div className="space-y-1">
                                      <p className="text-[10px] font-black text-[#6C5CE7] uppercase tracking-widest opacity-60">Availability</p>
                                      <p className="text-[24px] font-black text-[#2D3436]">{item.positions} <span className="text-[12px] opacity-30 font-bold uppercase ml-1 tracking-tighter">Slots</span></p>
                                    </div>
                                    <div className="space-y-1">
                                      <p className="text-[10px] font-black text-[#6C5CE7] uppercase tracking-widest opacity-60">Max Intake</p>
                                      <p className="text-[24px] font-black text-[#2D3436]">{item.maxApplicants} <span className="text-[12px] opacity-30 font-bold uppercase ml-1 tracking-tighter">Caps</span></p>
                                    </div>
                                  </div>

                                  <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                                    <button
                                      onClick={() => navigate(`/company/internship/${item._id}/edit`)}
                                      className="px-10 py-4 bg-[#FFFFFF] border-2 border-[#2D3436] text-[#2D3436] text-[11px] font-black uppercase tracking-widest rounded-[20px] hover:bg-[#2D3436] hover:text-white transition-all duration-300 shadow-sm active:scale-95"
                                    >
                                      Edit Posting
                                    </button>
                                    <button
                                      disabled={loadingId === item._id}
                                      onClick={() => toggleStatus(item._id, item.status)}
                                      className={`px-10 py-4 text-[11px] font-black uppercase tracking-widest rounded-[20px] transition-all duration-300 disabled:opacity-50 border-2 ${
                                        isOpen
                                          ? "text-[#cc0000] bg-white border-[#cc0000] hover:bg-[#cc0000] hover:text-white"
                                          : "text-[#008000] bg-white border-[#008000] hover:bg-[#008000] hover:text-white"
                                      }`}
                                    >
                                      {loadingId === item._id ? (
                                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mx-auto" />
                                      ) : isOpen ? "Archive Listing" : "Go Live"}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}