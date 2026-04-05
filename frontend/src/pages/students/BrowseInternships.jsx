import React, { useEffect, useState } from "react";
import API from "../../api/api";
import { useNavigate } from "react-router-dom";
<<<<<<< HEAD
import { Search, Filter, ChevronDown, MapPin, Calendar, CreditCard, Briefcase, Clock } from "lucide-react";
=======
import { Search, Filter, ChevronDown } from "lucide-react";
>>>>>>> c58615c (final year commit)

export default function BrowseInternships() {
  const [data, setData] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const navigate = useNavigate();

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
<<<<<<< HEAD
  const [statusFilter, setStatusFilter] = useState("ALL"); 
  const [dateFilter, setDateFilter] = useState("ALL"); // ALL, TODAY, 3_DAYS, 7_DAYS, 15_DAYS, 1_MONTH
=======
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL, APPLIED, NOT_APPLIED
  const [companyFilter, setCompanyFilter] = useState("ALL");
>>>>>>> c58615c (final year commit)

  const fetchData = async () => {
    try {
      const res = await API.get("/internships/browse");
      setData(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const apply = async (id) => {
    try {
      setLoadingId(id);
      await API.post(`/applications/apply/${id}`);
<<<<<<< HEAD
      await fetchData(); 
=======
      await fetchData(); // Refresh data to update the "alreadyApplied" status
>>>>>>> c58615c (final year commit)
    } catch (err) {
      alert(err.response?.data?.message);
    } finally {
      setLoadingId(null);
    }
  };

  // --- Filtering Logic ---
  const filteredData = data.filter((item) => {
<<<<<<< HEAD
    const titleMatch = (item.title || "").toLowerCase().includes(searchTerm.toLowerCase());
    const companyMatchText = (item.company?.name || "").toLowerCase().includes(searchTerm.toLowerCase());
=======
    const titleMatch = (item.title || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const companyMatchText = (item.company?.name || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
>>>>>>> c58615c (final year commit)
    const matchesSearch = titleMatch || companyMatchText;

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "APPLIED" && item.alreadyApplied) ||
      (statusFilter === "NOT_APPLIED" && !item.alreadyApplied);

<<<<<<< HEAD
    // Date Filtering Logic
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

    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <div className="min-h-screen bg-[#F5F6FA] p-4 md:p-8 lg:p-12 font-['Nunito'] text-[#2D3436]">
      <main className="max-w-7xl mx-auto w-full flex flex-col gap-10">
        
        {/* Header Section */}
        <header className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-4 duration-700">
          <h2 className="text-4xl font-extrabold tracking-tight text-[#2D3436]">
            Browse <span className="text-[#6C5CE7]">Internships</span>
=======
    const matchesCompany =
      companyFilter === "ALL" || item.company?.name === companyFilter;

    return matchesSearch && matchesStatus && matchesCompany;
  });

  // Extract unique companies for the dropdown
  const uniqueCompanies = [
    "ALL",
    ...new Set(data.map((i) => i.company?.name).filter(Boolean)),
  ];

  return (
    <div className="min-h-screen bg-[#FFFFFF] p-4 md:p-8 lg:p-10 font-['Nunito'] text-[#2D3436] transition-all duration-500 selection:bg-[#6C5CE7]/20 selection:text-[#6C5CE7]">
      <main className="max-w-7xl mx-auto w-full flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Header */}
        <header className="flex flex-col gap-3 border-b border-[#F5F6FA] pb-8">
          <h2 className="text-3xl md:text-3xl font-black m-0 tracking-tighter text-[#2D3436] uppercase leading-tight">
            Browse Internships
>>>>>>> c58615c (final year commit)
          </h2>
          <p className="text-[#2D3436]/60 font-medium italic">
            "Your future begins with a single application."
          </p>
        </header>

<<<<<<< HEAD
        {/* Updated Filters Panel */}
        {data.length > 0 && (
          <div className="bg-[#FFFFFF] rounded-3xl p-5 flex flex-col lg:flex-row gap-4 shadow-sm border border-gray-100 animate-in fade-in slide-in-from-left-6 duration-700">
            <div className="relative flex-[2] group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2D3436]/30 group-focus-within:text-[#6C5CE7] transition-colors" />
              <input
                type="text"
                placeholder="Search by role or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-[#F5F6FA] rounded-2xl outline-none border-2 border-transparent focus:border-[#6C5CE7]/20 focus:bg-white transition-all font-semibold"
              />
            </div>

            <div className="relative flex-1 group">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2D3436]/30 pointer-events-none" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-12 pr-10 py-4 bg-[#F5F6FA] rounded-2xl outline-none appearance-none cursor-pointer font-bold text-sm text-[#2D3436]/80 hover:bg-[#F5F6FA]/80 transition-all uppercase tracking-wider"
=======
        {/* Dynamic Filters Section */}
        {data.length > 0 && (
          <div className="bg-[#FFFFFF] border border-[#F5F6FA] rounded-[24px] p-4 flex flex-col md:flex-row gap-4 shadow-sm relative z-10 animate-in fade-in slide-in-from-left-8 duration-700">
            {/* Search Bar */}
            <div className="relative flex-1 group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#F5F6FA] rounded-[10px] flex items-center justify-center group-focus-within:bg-[#6C5CE7]/10 transition-colors">
                <Search className="w-4 h-4 text-[#2D3436] opacity-40 group-focus-within:text-[#6C5CE7] group-focus-within:opacity-100 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search by title or organization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-16 pr-6 py-4 text-[13px] font-bold text-[#2D3436] bg-[#FFFFFF] border-2 border-transparent rounded-[16px] outline-none transition-all focus:bg-[#F5F6FA] focus:border-[#6C5CE7]/30 placeholder-[#2D3436] placeholder-opacity-30"
              />
            </div>

            {/* Status Filter */}
            <div className="relative w-full md:w-48 group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#F5F6FA] rounded-[10px] flex items-center justify-center group-focus-within:bg-[#6C5CE7]/10 transition-colors pointer-events-none">
                <Filter className="w-4 h-4 text-[#2D3436] opacity-40 group-focus-within:text-[#6C5CE7] group-focus-within:opacity-100 transition-colors" />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-16 pr-10 py-4 text-[11px] font-black text-[#2D3436] bg-[#FFFFFF] border-2 border-transparent rounded-[16px] outline-none transition-all focus:bg-[#F5F6FA] focus:border-[#6C5CE7]/30 appearance-none uppercase tracking-widest cursor-pointer hover:bg-[#F5F6FA]/50"
>>>>>>> c58615c (final year commit)
              >
                <option value="ALL">All Status</option>
                <option value="NOT_APPLIED">Not Applied</option>
                <option value="APPLIED">Applied</option>
              </select>
<<<<<<< HEAD
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2D3436]/30 pointer-events-none" />
            </div>

            {/* Date Filter */}
            <div className="relative flex-1 group">
              <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2D3436]/30 pointer-events-none" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full pl-12 pr-10 py-4 bg-[#F5F6FA] rounded-2xl outline-none appearance-none cursor-pointer font-bold text-sm text-[#2D3436]/80 hover:bg-[#F5F6FA]/80 transition-all uppercase tracking-wider"
              >
                <option value="ALL">Any Time</option>
                <option value="TODAY">Past 24 Hours</option>
                <option value="3_DAYS">Past 3 Days</option>
                <option value="7_DAYS">Past Week</option>
                <option value="15_DAYS">Past 15 Days</option>
                <option value="1_MONTH">Past Month</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2D3436]/30 pointer-events-none" />
=======
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2D3436] opacity-30 pointer-events-none" />
            </div>

            {/* Company Filter */}
            <div className="relative w-full md:w-56 group">
              <select
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
                className="w-full pl-6 pr-10 py-4 text-[11px] font-black text-[#2D3436] bg-[#FFFFFF] border-2 border-transparent rounded-[16px] outline-none transition-all focus:bg-[#F5F6FA] focus:border-[#6C5CE7]/30 appearance-none uppercase tracking-widest cursor-pointer hover:bg-[#F5F6FA]/50"
              >
                {uniqueCompanies.map((company) => (
                  <option key={company} value={company}>
                    {company === "ALL" ? "All Organizations" : company}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2D3436] opacity-30 pointer-events-none" />
>>>>>>> c58615c (final year commit)
            </div>
          </div>
        )}

<<<<<<< HEAD
        {/* Grid Area */}
        {filteredData.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[40px] shadow-sm flex flex-col items-center">
             <div className="w-16 h-16 bg-[#F5F6FA] rounded-full flex items-center justify-center mb-4">
               <Search className="w-6 h-6 text-[#2D3436]/20" />
             </div>
             <p className="font-bold text-[#2D3436]/50 uppercase tracking-widest mb-6 text-sm">No matches found</p>
             <button onClick={() => { setSearchTerm(""); setStatusFilter("ALL"); setDateFilter("ALL"); }} className="px-8 py-3 bg-[#6C5CE7] text-white rounded-xl font-bold uppercase text-[11px] tracking-widest hover:shadow-lg transition-all active:scale-95">Reset All Filters</button>
=======
        {/* Content Area */}
        {data.length === 0 ? (
          <div className="bg-[#F5F6FA] border-2 border-dashed border-[#6C5CE7]/20 rounded-[32px] p-20 text-center animate-in zoom-in duration-500">
            <p className="text-[14px] font-black text-[#2D3436] opacity-40 m-0 uppercase tracking-[0.15em]">
              No internships currently available
            </p>
>>>>>>> c58615c (final year commit)
          </div>
        ) : filteredData.length === 0 ? (
          <div className="bg-[#FFFFFF] border border-[#F5F6FA] rounded-[32px] p-20 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center gap-6">
            <div className="w-16 h-16 bg-[#F5F6FA] rounded-full flex items-center justify-center">
              <Search className="w-6 h-6 text-[#2D3436] opacity-30" />
            </div>
            <p className="text-[12px] font-black text-[#2D3436] opacity-40 m-0 uppercase tracking-[0.2em]">
              No matches found for your filters.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("ALL");
                setCompanyFilter("ALL");
              }}
              className="px-8 py-4 bg-[#F5F6FA] text-[#2D3436] text-[10px] font-black uppercase tracking-widest rounded-[16px] hover:bg-[#2D3436] hover:text-[#FFFFFF] transition-all duration-300 shadow-sm active:scale-95 outline-none border-none cursor-pointer"
            >
              Clear Filters
            </button>
          </div>
        ) : (
<<<<<<< HEAD
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-1000">
            {filteredData.map((item, idx) => (
              <div 
                key={item._id}
                style={{ animationDelay: `${idx * 100}ms` }}
                className="bg-white rounded-[32px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-50 flex flex-col hover:shadow-[0_20px_40px_rgba(108,92,231,0.1)] hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden"
              >
                {/* Visual Status Tag */}
                {item.alreadyApplied ? (
                  <div className="absolute top-0 right-0 bg-[#6C5CE7] text-white px-6 py-1.5 rounded-bl-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-sm z-10">
                    Applied
                  </div>
                ) : (
                  new Date(item.createdAt).toDateString() === new Date().toDateString() && (
                    <div className="absolute top-0 right-0 bg-[#00B894] text-white px-6 py-1.5 rounded-bl-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-sm z-10 animate-pulse">
                      New Today
                    </div>
                  )
                )}

                <div className="flex items-start gap-4 mb-6">
                  <div className="w-14 h-14 bg-[#F5F6FA] rounded-2xl flex items-center justify-center overflow-hidden border border-gray-50 group-hover:bg-white transition-colors duration-500">
                    {item.company?.logoUrl ? (
                      <img src={item.company.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <Briefcase className="w-6 h-6 text-[#6C5CE7]/40" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xs font-black text-[#6C5CE7] uppercase tracking-widest mb-1 truncate max-w-[150px]">
                      {item.company?.name || "Organization"}
                    </h3>
                    <h2 className="text-xl font-extrabold text-[#2D3436] leading-tight group-hover:text-[#6C5CE7] transition-colors">
                      {item.title}
                    </h2>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F5F6FA] rounded-xl text-[11px] font-bold text-[#2D3436]/70 capitalize">
                    <MapPin className="w-3 h-3" />
                    {item.mode}
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#6C5CE7]/5 rounded-xl text-[11px] font-black text-[#6C5CE7]">
                    <CreditCard className="w-3 h-3" />
                    {item.stipendType === "paid" ? `₹${item.stipendAmount}` : "Unpaid"}
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-[10px] font-black text-[#2D3436]/30 uppercase tracking-[0.15em] mb-3">Core Stack</p>
                  <div className="flex flex-wrap gap-2">
                    {item.skillsRequired?.slice(0, 3).map((skill, i) => (
                      <span key={i} className="px-3 py-1 bg-white border border-[#F5F6FA] rounded-lg text-[11px] font-bold text-[#2D3436]/80 group-hover:border-[#6C5CE7]/30 transition-colors">
                        {skill}
                      </span>
                    ))}
                    {item.skillsRequired?.length > 3 && (
                      <span className="px-2 py-1 text-[11px] font-bold text-[#6C5CE7]">+{item.skillsRequired.length - 3}</span>
                    )}
                  </div>
                </div>

                <div className="mt-auto pt-6 border-t border-[#F5F6FA] flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-[#2D3436]/30 uppercase mb-1">Apply By</span>
                    <div className="flex items-center gap-1.5 text-[12px] font-bold text-[#2D3436]">
                      <Calendar className="w-3.5 h-3.5 text-red-400" />
                      {new Date(item.applicationDeadline).toLocaleDateString("en-IN", { day: '2-digit', month: 'short' })}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => navigate(`/student/internships/${item._id}`)}
                      className="p-3 bg-[#F5F6FA] text-[#2D3436] rounded-xl hover:bg-[#2D3436] hover:text-white transition-all active:scale-95"
                      title="View Details"
=======
          <div className="bg-[#FFFFFF] border border-[#F5F6FA] rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden box-border hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] transition-all duration-500">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead className="bg-[#F5F6FA] bg-opacity-50 border-b border-[#F5F6FA]">
                  <tr>
                    <th className="px-8 py-6 text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-[0.15em]">
                      Opportunity Name
                    </th>
                    <th className="px-8 py-6 text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-[0.15em]">
                      Organization
                    </th>
                    <th className="px-8 py-6 text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-[0.15em]">
                      Deadline
                    </th>
                    <th className="px-8 py-6 text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-[0.15em] text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5F6FA]">
                  {filteredData.map((item, idx) => (
                    <tr
                      key={item._id}
                      style={{ animationDelay: `${idx * 50}ms` }}
                      className="hover:bg-[#F5F6FA]/40 transition-colors duration-300 group animate-in fade-in fill-mode-both"
>>>>>>> c58615c (final year commit)
                    >
                      <span className="text-[11px] font-black uppercase tracking-widest">View Details</span>
                    </button>
                    <button
                      disabled={item.alreadyApplied || loadingId === item._id}
                      onClick={() => apply(item._id)}
                      className={`px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 min-w-[100px] shadow-sm
                        ${item.alreadyApplied 
                          ? "bg-[#F5F6FA] text-[#2D3436]/30 cursor-not-allowed" 
                          : "bg-[#6C5CE7] text-white hover:bg-[#5a4cd1] shadow-[#6C5CE7]/20 hover:shadow-lg"
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