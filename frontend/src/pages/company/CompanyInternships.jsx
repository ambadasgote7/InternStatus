import React, { useEffect, useState } from "react";
import API from "../../api/api";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  Activity,
  Briefcase,
  Calendar,
  ChevronDown,
  Settings,
  Archive,
  Globe,
  ExternalLink,
  Users, // Added missing import
  AlertTriangle, // Added missing import
} from "lucide-react";

// ==========================================
// 1. Reusable Status Badge Component
// ==========================================
const StatusBadge = ({ status }) => {
  const isOpen = status === "open";
  return (
    <span
      className={`inline-flex items-center px-3 py-1.5 rounded-[12px] text-[10px] font-black uppercase tracking-widest shadow-sm transition-all duration-300 ${
        isOpen
          ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
          : "bg-rose-50 text-rose-600 border border-rose-200"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full mr-2 animate-pulse ${isOpen ? "bg-emerald-500" : "bg-rose-500"}`}
      ></span>
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
      <div className="min-h-screen bg-[#FFFFFF] flex items-center justify-center font-['Nunito'] transition-all duration-300">
        <div className="flex flex-col items-center gap-4 animate-in fade-in duration-700">
          <div className="w-12 h-12 border-4 border-[#F5F6FA] border-t-[#6C5CE7] rounded-full animate-spin"></div>
          <p className="text-[12px] font-black text-[#6C5CE7] animate-pulse uppercase tracking-widest m-0">
            Syncing Portfolios...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#2D3436] font-['Nunito'] pb-12 transition-colors duration-500 selection:bg-[#6C5CE7]/20 selection:text-[#6C5CE7]">
      <main className="max-w-7xl mx-auto w-full px-4 md:px-8 py-8 md:py-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Header Section (Hero Style) */}
        <div className="bg-[#F5F6FA] border border-transparent rounded-[32px] p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-8 shadow-sm">
          <div className="flex flex-col gap-2">
            <h1 className="text-[28px] md:text-4xl font-black text-[#2D3436] m-0 tracking-tighter uppercase leading-tight">
              Company <span className="text-[#6C5CE7]">Internships</span>
            </h1>
            <p className="text-[12px] font-black text-[#2D3436] opacity-40 uppercase tracking-[0.2em] m-0 flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#6C5CE7]" />
              Active Internship Portfolios
            </p>
          </div>

          <div className="flex items-center gap-6 bg-[#FFFFFF] p-6 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#F5F6FA] hover:shadow-[0_20px_50px_rgba(108,92,231,0.08)] hover:-translate-y-1 transition-all duration-300">
            <div className="flex flex-col">
              <p className="text-[10px] font-black text-[#2D3436] opacity-40 uppercase tracking-[0.2em] mb-1">
                Live Listings
              </p>
              <div className="flex items-end gap-2">
                <p className="text-[36px] font-black text-[#6C5CE7] leading-none m-0">
                  {data.length}
                </p>
                <span className="text-[12px] font-bold text-[#2D3436] opacity-40 uppercase tracking-widest mb-1">
                  Total
                </span>
              </div>
            </div>
            <div className="p-4 bg-[#F5F6FA] rounded-[16px]">
              <Briefcase className="w-8 h-8 text-[#6C5CE7]" />
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-[24px] p-6 shadow-sm flex items-center justify-center gap-3 animate-in zoom-in">
            <AlertTriangle className="w-5 h-5 text-rose-500 animate-pulse" />
            <p className="text-[12px] font-black text-rose-600 uppercase tracking-widest m-0">
              {error}
            </p>
          </div>
        )}

        {/* Dynamic Filters */}
        {data.length > 0 && (
          <div className="bg-[#FFFFFF] border border-[#F5F6FA] rounded-[24px] p-4 flex flex-col md:flex-row gap-4 shadow-sm relative z-10">
            <div className="relative flex-1 group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#F5F6FA] rounded-[10px] flex items-center justify-center group-focus-within:bg-[#6C5CE7]/10 transition-colors">
                <Search className="w-4 h-4 text-[#2D3436] opacity-40 group-focus-within:text-[#6C5CE7] group-focus-within:opacity-100 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Filter by position title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-16 pr-6 py-4 text-[13px] font-bold text-[#2D3436] bg-[#FFFFFF] border-2 border-transparent rounded-[16px] outline-none transition-all focus:bg-[#F5F6FA] focus:border-[#6C5CE7]/30 placeholder-[#2D3436] placeholder-opacity-30"
              />
            </div>

            <div className="relative w-full md:w-64 group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#F5F6FA] rounded-[10px] flex items-center justify-center group-focus-within:bg-[#6C5CE7]/10 transition-colors pointer-events-none">
                <Filter className="w-4 h-4 text-[#2D3436] opacity-40 group-focus-within:text-[#6C5CE7] group-focus-within:opacity-100 transition-colors" />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-16 pr-10 py-4 text-[11px] font-black text-[#2D3436] bg-[#FFFFFF] border-2 border-transparent rounded-[16px] outline-none transition-all focus:bg-[#F5F6FA] focus:border-[#6C5CE7]/30 appearance-none uppercase tracking-widest cursor-pointer hover:bg-[#F5F6FA]/50"
              >
                {uniqueStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status === "ALL"
                      ? "All Statuses"
                      : status.replace("_", " ")}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2D3436] opacity-30 pointer-events-none" />
            </div>
          </div>
        )}

        {/* Empty States */}
        {data.length === 0 && !error ? (
          <div className="bg-[#F5F6FA] border-2 border-dashed border-[#6C5CE7]/20 rounded-[40px] p-24 text-center transition-all hover:border-[#6C5CE7]/40 hover:bg-[#F5F6FA]/80 flex flex-col items-center gap-6">
            <div className="w-20 h-20 bg-[#FFFFFF] rounded-[24px] shadow-sm flex items-center justify-center group hover:-translate-y-2 transition-transform duration-300">
              <Briefcase className="w-10 h-10 text-[#6C5CE7]" />
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-[16px] font-black text-[#2D3436] m-0 uppercase tracking-widest">
                Empty Portfolio
              </p>
              <p className="text-[12px] font-bold text-[#2D3436] opacity-40 m-0 uppercase tracking-[0.2em]">
                Post your first internship to get started.
              </p>
            </div>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="bg-[#FFFFFF] border border-[#F5F6FA] rounded-[32px] p-20 text-center shadow-sm flex flex-col items-center gap-6">
            <div className="w-16 h-16 bg-[#F5F6FA] rounded-full flex items-center justify-center">
              <Search className="w-6 h-6 text-[#2D3436] opacity-30" />
            </div>
            <p className="text-[12px] font-black text-[#2D3436] opacity-40 m-0 uppercase tracking-[0.2em]">
              No matches in your current view.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("ALL");
              }}
              className="px-8 py-4 bg-[#F5F6FA] text-[#2D3436] text-[10px] font-black uppercase tracking-widest rounded-[16px] hover:bg-[#2D3436] hover:text-[#FFFFFF] transition-all duration-300 shadow-sm active:scale-95 outline-none border-none cursor-pointer"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          /* Table Area */
          <div className="bg-[#FFFFFF] border border-[#F5F6FA] rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)]">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-[#F5F6FA] bg-opacity-50 border-b border-[#F5F6FA]">
                    <th className="px-8 py-6 text-[10px] font-black text-[#2D3436] opacity-40 uppercase tracking-[0.2em] rounded-tl-[32px]">
                      Internship Title
                    </th>
                    <th className="px-8 py-6 text-[10px] font-black text-[#2D3436] opacity-40 uppercase tracking-[0.2em]">
                      Deadline
                    </th>
                    <th className="px-8 py-6 text-[10px] font-black text-[#2D3436] opacity-40 uppercase tracking-[0.2em]">
                      Status
                    </th>
                    <th className="px-8 py-6 text-[10px] font-black text-[#2D3436] opacity-40 uppercase tracking-[0.2em] text-right rounded-tr-[32px]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5F6FA]">
                  {filteredData.map((item) => {
                    const isExpanded = expandedId === item._id;
                    const isOpen = item.status === "open";

                    return (
                      <React.Fragment key={item._id}>
                        {/* Main Row */}
                        <tr
                          className={`group transition-colors duration-300 ${isExpanded ? "bg-[#F5F6FA]/30" : "hover:bg-[#F5F6FA]/50"}`}
                        >
                          <td className="px-8 py-6 align-middle">
                            <span className="text-[15px] font-black text-[#2D3436] opacity-90 block group-hover:text-[#6C5CE7] transition-colors duration-300 truncate max-w-[250px] md:max-w-[400px]">
                              {item.title}
                            </span>
                          </td>
                          <td className="px-8 py-6 align-middle">
                            <div className="inline-flex items-center gap-2 text-[12px] font-bold text-[#2D3436] opacity-70 bg-[#FFFFFF] px-3 py-1.5 rounded-[10px] border border-[#F5F6FA] shadow-sm group-hover:border-[#6C5CE7]/20 transition-colors">
                              <Calendar className="w-3.5 h-3.5 text-[#6C5CE7]" />
                              {item.applicationDeadline
                                ? new Date(
                                    item.applicationDeadline,
                                  ).toLocaleDateString("en-IN", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  })
                                : "—"}
                            </div>
                          </td>
                          <td className="px-8 py-6 align-middle">
                            <StatusBadge status={item.status} />
                          </td>
                          <td className="px-8 py-6 align-middle text-right">
                            <div className="flex items-center justify-end gap-3">
                              <button
                                onClick={() =>
                                  navigate(
                                    `/company/internship/${item._id}/applicants`,
                                  )
                                }
                                className="px-5 py-2.5 bg-[#FFFFFF] border border-[#F5F6FA] text-[#2D3436] text-[10px] font-black uppercase tracking-widest rounded-[12px] hover:bg-[#2D3436] hover:text-[#FFFFFF] transition-all duration-300 shadow-sm active:scale-95 outline-none cursor-pointer flex items-center gap-2 group/btn"
                              >
                                Applicants{" "}
                                <Users className="w-3.5 h-3.5 opacity-50 group-hover/btn:opacity-100 transition-opacity" />
                              </button>
                              <button
                                onClick={() => toggleExpand(item._id)}
                                className={`w-10 h-10 flex items-center justify-center rounded-[12px] border transition-all duration-300 outline-none cursor-pointer shadow-sm active:scale-95 ${
                                  isExpanded
                                    ? "bg-[#6C5CE7] border-[#6C5CE7] text-[#FFFFFF] rotate-180 shadow-md"
                                    : "bg-[#FFFFFF] border-[#F5F6FA] text-[#2D3436] hover:border-[#6C5CE7]/40 hover:bg-[#F5F6FA]"
                                }`}
                              >
                                <ChevronDown
                                  className="w-5 h-5"
                                  strokeWidth={3}
                                />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Expanded Details Row */}
                        {isExpanded && (
                          <tr className="bg-[#F5F6FA]/20 relative overflow-hidden">
                            <td
                              colSpan={4}
                              className="p-0 border-none relative"
                            >
                              {/* Subtle accent line on the left */}
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#6C5CE7]"></div>

                              <div className="px-8 py-8 animate-in fade-in slide-in-from-top-4 duration-500">
                                <div className="bg-[#FFFFFF] rounded-[24px] p-8 border border-[#F5F6FA] shadow-sm flex flex-col md:flex-row justify-between items-center gap-8">
                                  {/* Stats Grid */}
                                  <div className="grid grid-cols-2 gap-8 md:gap-16 w-full md:w-auto">
                                    <div className="flex flex-col gap-2 bg-[#F5F6FA] p-4 rounded-[16px] text-center border border-transparent hover:border-[#6C5CE7]/20 transition-colors">
                                      <p className="text-[10px] font-black text-[#2D3436] opacity-40 uppercase tracking-[0.2em] m-0">
                                        Availability
                                      </p>
                                      <div className="flex items-baseline justify-center gap-1">
                                        <p className="text-[28px] font-black text-[#6C5CE7] leading-none m-0">
                                          {item.positions}
                                        </p>
                                        <span className="text-[10px] font-black text-[#2D3436] opacity-30 uppercase tracking-widest">
                                          Slots
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex flex-col gap-2 bg-[#F5F6FA] p-4 rounded-[16px] text-center border border-transparent hover:border-[#6C5CE7]/20 transition-colors">
                                      <p className="text-[10px] font-black text-[#2D3436] opacity-40 uppercase tracking-[0.2em] m-0">
                                        Max Intake
                                      </p>
                                      <div className="flex items-baseline justify-center gap-1">
                                        <p className="text-[28px] font-black text-[#6C5CE7] leading-none m-0">
                                          {item.maxApplicants}
                                        </p>
                                        <span className="text-[10px] font-black text-[#2D3436] opacity-30 uppercase tracking-widest">
                                          Caps
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Action Buttons */}
                                  <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto shrink-0">
                                    <button
                                      onClick={() =>
                                        navigate(
                                          `/company/internship/${item._id}/edit`,
                                        )
                                      }
                                      className="px-6 py-4 bg-[#FFFFFF] border border-[#F5F6FA] text-[#2D3436] text-[10px] font-black uppercase tracking-widest rounded-[16px] hover:border-[#6C5CE7] hover:text-[#6C5CE7] transition-all duration-300 shadow-sm active:scale-95 outline-none cursor-pointer flex items-center justify-center gap-2 group"
                                    >
                                      <Settings className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity group-hover:rotate-90 duration-500" />{" "}
                                      Edit Posting
                                    </button>
                                    <button
                                      disabled={loadingId === item._id}
                                      onClick={() =>
                                        toggleStatus(item._id, item.status)
                                      }
                                      className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest rounded-[16px] transition-all duration-300 shadow-sm active:scale-95 outline-none cursor-pointer flex items-center justify-center gap-2 border disabled:opacity-50 disabled:cursor-not-allowed ${
                                        isOpen
                                          ? "text-rose-600 bg-rose-50 border-rose-200 hover:bg-rose-600 hover:text-[#FFFFFF]"
                                          : "text-emerald-600 bg-emerald-50 border-emerald-200 hover:bg-emerald-600 hover:text-[#FFFFFF]"
                                      }`}
                                    >
                                      {loadingId === item._id ? (
                                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                      ) : isOpen ? (
                                        <>
                                          <Archive className="w-4 h-4" />{" "}
                                          Archive Listing
                                        </>
                                      ) : (
                                        <>
                                          <Globe className="w-4 h-4" /> Go Live
                                        </>
                                      )}
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
