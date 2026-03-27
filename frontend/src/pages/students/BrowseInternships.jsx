import React, { useEffect, useState } from "react";
import API from "../../api/api";
import { useNavigate } from "react-router-dom";
import { Search, Filter, ChevronDown } from "lucide-react";

export default function BrowseInternships() {
  const [data, setData] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const navigate = useNavigate();

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL, APPLIED, NOT_APPLIED
  const [companyFilter, setCompanyFilter] = useState("ALL");

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
      await fetchData(); // Refresh data to update the "alreadyApplied" status
    } catch (err) {
      alert(err.response?.data?.message);
    } finally {
      setLoadingId(null);
    }
  };

  // --- Filtering Logic ---
  const filteredData = data.filter((item) => {
    const titleMatch = (item.title || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const companyMatchText = (item.company?.name || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesSearch = titleMatch || companyMatchText;

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "APPLIED" && item.alreadyApplied) ||
      (statusFilter === "NOT_APPLIED" && !item.alreadyApplied);

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
          </h2>
          <p className="text-[13px] font-black text-[#6C5CE7] opacity-80 m-0 uppercase tracking-[0.2em]">
            Explore and apply for opportunities that match your skills
          </p>
        </header>

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
              >
                <option value="ALL">All Status</option>
                <option value="NOT_APPLIED">Not Applied</option>
                <option value="APPLIED">Applied</option>
              </select>
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
            </div>
          </div>
        )}

        {/* Content Area */}
        {data.length === 0 ? (
          <div className="bg-[#F5F6FA] border-2 border-dashed border-[#6C5CE7]/20 rounded-[32px] p-20 text-center animate-in zoom-in duration-500">
            <p className="text-[14px] font-black text-[#2D3436] opacity-40 m-0 uppercase tracking-[0.15em]">
              No internships currently available
            </p>
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
                    >
                      {/* Name */}
                      <td className="px-8 py-6">
                        <div className="text-[15px] font-black text-[#2D3436] group-hover:text-[#6C5CE7] transition-colors duration-300">
                          {item.title}
                        </div>
                      </td>

                      {/* Company Name */}
                      <td className="px-8 py-6">
                        <div className="text-[14px] font-bold text-[#2D3436] opacity-80">
                          {item.company?.name || "Unknown"}
                        </div>
                      </td>

                      {/* Deadline */}
                      <td className="px-8 py-6">
                        <span className="text-[13px] font-bold text-[#2D3436] bg-[#F5F6FA] px-3 py-1.5 rounded-[10px] group-hover:bg-[#FFFFFF] transition-colors">
                          {new Date(
                            item.applicationDeadline,
                          ).toLocaleDateString("en-IN", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-8 py-6">
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() =>
                              navigate(`/student/internships/${item._id}`)
                            }
                            className="px-5 py-2.5 text-[10px] font-black text-[#2D3436] bg-[#FFFFFF] border border-[#F5F6FA] rounded-[12px] hover:border-[#6C5CE7] hover:text-[#6C5CE7] hover:shadow-sm transition-all duration-300 cursor-pointer uppercase tracking-widest outline-none transform hover:-translate-y-0.5"
                          >
                            View Details
                          </button>

                          <button
                            disabled={
                              item.alreadyApplied || loadingId === item._id
                            }
                            onClick={() => apply(item._id)}
                            className={`px-6 py-2.5 text-[10px] font-black rounded-[12px] transition-all duration-300 uppercase tracking-widest outline-none transform flex items-center justify-center min-w-[120px] shadow-sm
                              ${
                                item.alreadyApplied
                                  ? "bg-[#F5F6FA] text-[#2D3436] opacity-50 cursor-not-allowed border-none shadow-none"
                                  : "bg-[#6C5CE7] text-[#FFFFFF] border-none hover:shadow-md hover:-translate-y-0.5 hover:bg-opacity-90 cursor-pointer"
                              }
                            `}
                          >
                            {loadingId === item._id ? (
                              <div className="flex items-center gap-2">
                                <span className="w-3 h-3 border-2 border-[#FFFFFF]/30 border-t-[#FFFFFF] rounded-full animate-spin"></span>
                                Applying...
                              </div>
                            ) : item.alreadyApplied ? (
                              "Applied"
                            ) : (
                              "Apply Now"
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
