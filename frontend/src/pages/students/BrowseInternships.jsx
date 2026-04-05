import React, { useEffect, useState } from "react";
import API from "../../api/api";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  Filter, 
  ChevronDown, 
  MapPin, 
  Calendar, 
  CreditCard, 
  Briefcase, 
  Clock 
} from "lucide-react";

export default function BrowseInternships() {
  const [data, setData] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const navigate = useNavigate();

  // Unified Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL, APPLIED, NOT_APPLIED
  const [dateFilter, setDateFilter] = useState("ALL");
  const [companyFilter, setCompanyFilter] = useState("ALL");

  const fetchData = async () => {
    try {
      const res = await API.get("/internships/browse");
      setData(res.data.data);
    } catch (err) {
      console.error("Fetch Error:", err);
    }
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
      alert(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoadingId(null);
    }
  };

  // --- Filtering Logic ---
  const filteredData = data.filter((item) => {
    // Search Matching
    const titleMatch = (item.title || "").toLowerCase().includes(searchTerm.toLowerCase());
    const companyMatchText = (item.company?.name || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearch = titleMatch || companyMatchText;

    // Status Matching
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "APPLIED" && item.alreadyApplied) ||
      (statusFilter === "NOT_APPLIED" && !item.alreadyApplied);

    // Date Filtering
    let matchesDate = true;
    if (dateFilter !== "ALL") {
      const createdDate = new Date(item.createdAt);
      const now = new Date();
      const diffInDays = (now - createdDate) / (1000 * 60 * 60 * 24);

      if (dateFilter === "TODAY") matchesDate = diffInDays <= 1;
      else if (dateFilter === "3_DAYS") matchesDate = diffInDays <= 3;
      else if (dateFilter === "7_DAYS") matchesDate = diffInDays <= 7;
      else if (dateFilter === "15_DAYS") matchesDate = diffInDays <= 15;
      else if (dateFilter === "1_MONTH") matchesDate = diffInDays <= 30;
    }

    // Company Matching
    const matchesCompany =
      companyFilter === "ALL" || item.company?.name === companyFilter;

    return matchesSearch && matchesStatus && matchesDate && matchesCompany;
  });

  const uniqueCompanies = [
    "ALL",
    ...new Set(data.map((i) => i.company?.name).filter(Boolean)),
  ];

  return (
    <div className="min-h-screen bg-[#F5F6FA] p-4 md:p-8 lg:p-12 font-['Nunito'] text-[#2D3436]">
      <main className="max-w-7xl mx-auto w-full flex flex-col gap-8">
        
        {/* Header Section */}
        <header className="flex flex-col gap-3 border-b border-gray-200 pb-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <h2 className="text-4xl font-black tracking-tighter text-[#2D3436] uppercase">
            Browse <span className="text-[#6C5CE7]">Internships</span>
          </h2>
          <p className="text-[#2D3436]/60 font-medium italic">
            "Your future begins with a single application."
          </p>
        </header>

        {/* Unified Filters Panel */}
        {data.length > 0 && (
          <div className="bg-white rounded-[24px] p-5 flex flex-col lg:flex-row gap-4 shadow-sm border border-gray-100 relative z-10 animate-in fade-in slide-in-from-left-6 duration-700">
            {/* Search */}
            <div className="relative flex-[2] group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2D3436]/30 group-focus-within:text-[#6C5CE7] transition-colors" />
              <input
                type="text"
                placeholder="Search role or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-[#F5F6FA] rounded-2xl outline-none border-2 border-transparent focus:border-[#6C5CE7]/20 focus:bg-white transition-all font-bold text-sm"
              />
            </div>

            {/* Status */}
            <div className="relative flex-1 group">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2D3436]/30 pointer-events-none" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-12 pr-10 py-4 bg-[#F5F6FA] rounded-2xl outline-none appearance-none cursor-pointer font-bold text-[11px] uppercase tracking-wider text-[#2D3436]/80 hover:bg-gray-100 transition-all"
              >
                <option value="ALL">All Status</option>
                <option value="NOT_APPLIED">Not Applied</option>
                <option value="APPLIED">Applied</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2D3436]/30 pointer-events-none" />
            </div>

            {/* Date */}
            <div className="relative flex-1 group">
              <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2D3436]/30 pointer-events-none" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full pl-12 pr-10 py-4 bg-[#F5F6FA] rounded-2xl outline-none appearance-none cursor-pointer font-bold text-[11px] uppercase tracking-wider text-[#2D3436]/80 hover:bg-gray-100 transition-all"
              >
                <option value="ALL">Any Time</option>
                <option value="TODAY">Past 24 Hours</option>
                <option value="3_DAYS">Past 3 Days</option>
                <option value="7_DAYS">Past Week</option>
                <option value="1_MONTH">Past Month</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2D3436]/30 pointer-events-none" />
            </div>

            {/* Company */}
            <div className="relative flex-1 group">
              <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2D3436]/30 pointer-events-none" />
              <select
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
                className="w-full pl-12 pr-10 py-4 bg-[#F5F6FA] rounded-2xl outline-none appearance-none cursor-pointer font-bold text-[11px] uppercase tracking-wider text-[#2D3436]/80 hover:bg-gray-100 transition-all"
              >
                {uniqueCompanies.map((c) => (
                  <option key={c} value={c}>{c === "ALL" ? "All Companies" : c}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2D3436]/30 pointer-events-none" />
            </div>
          </div>
        )}

        {/* Content Area */}
        {data.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-[#6C5CE7]/20 rounded-[32px] p-20 text-center animate-in zoom-in duration-500">
            <p className="text-sm font-black text-[#2D3436]/40 uppercase tracking-widest">No internships found</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="bg-white rounded-[32px] p-20 text-center shadow-sm flex flex-col items-center gap-4">
            <Search className="w-10 h-10 text-[#2D3436]/20" />
            <p className="text-sm font-black text-[#2D3436]/40 uppercase tracking-widest">No matches for your filters</p>
            <button
              onClick={() => { setSearchTerm(""); setStatusFilter("ALL"); setDateFilter("ALL"); setCompanyFilter("ALL"); }}
              className="mt-2 px-6 py-3 bg-[#F5F6FA] text-[#2D3436] text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#2D3436] hover:text-white transition-all"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-1000">
            {filteredData.map((item, idx) => (
              <div 
                key={item._id}
                style={{ animationDelay: `${idx * 100}ms` }}
                className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-50 flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group relative overflow-hidden"
              >
                {/* Status Badge */}
                {item.alreadyApplied ? (
                  <div className="absolute top-0 right-0 bg-[#6C5CE7] text-white px-5 py-1.5 rounded-bl-2xl text-[9px] font-black uppercase tracking-widest z-10">
                    Applied
                  </div>
                ) : (
                  new Date(item.createdAt).toDateString() === new Date().toDateString() && (
                    <div className="absolute top-0 right-0 bg-[#00B894] text-white px-5 py-1.5 rounded-bl-2xl text-[9px] font-black uppercase tracking-widest z-10 animate-pulse">
                      New
                    </div>
                  )
                )}

                <div className="flex items-start gap-4 mb-6">
                  <div className="w-14 h-14 bg-[#F5F6FA] rounded-2xl flex items-center justify-center border border-gray-50 group-hover:bg-white transition-colors">
                    {item.company?.logoUrl ? (
                      <img src={item.company.logoUrl} alt="Logo" className="w-full h-full object-cover rounded-2xl" />
                    ) : (
                      <Briefcase className="w-6 h-6 text-[#6C5CE7]/40" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[10px] font-black text-[#6C5CE7] uppercase tracking-widest mb-1 truncate max-w-[150px]">
                      {item.company?.name || "Organization"}
                    </h3>
                    <h2 className="text-lg font-extrabold text-[#2D3436] leading-tight group-hover:text-[#6C5CE7] transition-colors">
                      {item.title}
                    </h2>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F5F6FA] rounded-xl text-[11px] font-bold text-[#2D3436]/70">
                    <MapPin className="w-3 h-3" /> {item.mode}
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#6C5CE7]/5 rounded-xl text-[11px] font-black text-[#6C5CE7]">
                    <CreditCard className="w-3 h-3" />
                    {item.stipendType === "paid" ? `₹${item.stipendAmount}` : "Unpaid"}
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-[9px] font-black text-[#2D3436]/30 uppercase tracking-widest mb-2">Required Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {item.skillsRequired?.slice(0, 3).map((skill, i) => (
                      <span key={i} className="px-3 py-1 bg-white border border-gray-100 rounded-lg text-[10px] font-bold text-[#2D3436]/80 group-hover:border-[#6C5CE7]/30 transition-colors">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-[#2D3436]/30 uppercase mb-1">Apply By</span>
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#2D3436]">
                      <Calendar className="w-3.5 h-3.5 text-red-400" />
                      {new Date(item.applicationDeadline).toLocaleDateString("en-IN", { day: '2-digit', month: 'short' })}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => navigate(`/student/internships/${item._id}`)}
                      className="px-4 py-2 bg-[#F5F6FA] text-[#2D3436] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#2D3436] hover:text-white transition-all active:scale-95"
                    >
                      Details
                    </button>
                    <button
                      disabled={item.alreadyApplied || loadingId === item._id}
                      onClick={() => apply(item._id)}
                      className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 min-w-[90px]
                        ${item.alreadyApplied 
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                          : "bg-[#6C5CE7] text-white hover:bg-[#5a4cd1] shadow-lg shadow-[#6C5CE7]/20"
                        }`}
                    >
                      {loadingId === item._id ? "..." : item.alreadyApplied ? "Applied" : "Apply"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}