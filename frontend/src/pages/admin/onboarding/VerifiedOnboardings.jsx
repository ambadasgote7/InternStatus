import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../../api/api";

export default function VerifiedOnboardings() {
  const navigate = useNavigate();
  const controllerRef = useRef(null);

  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [list, setList] = useState([]);
  const [counts, setCounts] = useState({ all: 0, college: 0, company: 0 });

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const [loading, setLoading] = useState(true);

  /* ---------------- DEBOUNCE ---------------- */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  /* ---------------- FETCH ---------------- */
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      if (controllerRef.current) {
        controllerRef.current.abort();
      }

      const controller = new AbortController();
      controllerRef.current = controller;

      const res = await API.get(`/admin/onboarding/verified`, {
        params: {
          type: filter,
          search: debouncedSearch,
          page,
          limit,
          sortField,
          sortOrder,
        },
        signal: controller.signal,
      });

      const data = res.data?.data?.data || [];
      setList(Array.isArray(data) ? data : []);
      setCounts(res.data?.data?.counts || { all: 0, college: 0, company: 0 });
      setTotalPages(res.data?.data?.pagination?.totalPages || 1);

    } catch (err) {
      if (err.name !== "CanceledError") {
        console.error("Fetch Error:", err);
      }
    } finally {
      setLoading(false);
    }
  }, [filter, debouncedSearch, page, limit, sortField, sortOrder]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ---------------- SORT ---------------- */
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  /* ---------------- LOADING ---------------- */
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white font-['Nunito']">
        <div className="w-16 h-16 border-4 border-[#F5F6FA] border-t-[#6C5CE7] rounded-full animate-spin mb-4" />
        <p className="text-[#2D3436] font-bold animate-pulse">Fetching Verified Records...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#2D3436] pb-12 font-['Nunito'] selection:bg-[#6C5CE7] selection:text-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-10 animate-in fade-in duration-700">

        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#F5F6FA] pb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight">
              Verified <span className="text-[#6C5CE7]">Onboardings</span>
            </h1>
            <p className="text-lg opacity-60 font-medium mt-2">
              Review and manage verified institutional partnerships.
            </p>
          </div>
          <div className="hidden md:block text-right">
            <span className="text-sm font-bold opacity-40 uppercase tracking-widest">Portal Overview</span>
          </div>
        </div>

        {/* FILTER + SEARCH CARD */}
        <div className="bg-[#F5F6FA] p-1.5 rounded-[2rem] flex flex-col lg:flex-row gap-3 shadow-sm border border-gray-100">
          <div className="relative flex-grow group">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none opacity-40 group-focus-within:text-[#6C5CE7] group-focus-within:opacity-100 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search organizations or requesters..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-14 pr-6 py-4 rounded-[1.75rem] bg-white border-2 border-transparent focus:border-[#6C5CE7]/30 focus:outline-none shadow-sm transition-all text-[#2D3436] font-semibold"
            />
          </div>

          <div className="flex p-1 gap-1 overflow-x-auto no-scrollbar">
            {["all", "college", "company"].map((t) => (
              <button
                key={t}
                onClick={() => {
                  setFilter(t);
                  setPage(1);
                }}
                className={`px-8 py-3 rounded-[1.5rem] font-extrabold text-sm whitespace-nowrap transition-all duration-300 transform active:scale-95 ${
                  filter === t
                    ? "bg-[#6C5CE7] text-white shadow-lg shadow-[#6C5CE7]/30"
                    : "bg-white/50 text-[#2D3436]/60 hover:bg-white hover:text-[#6C5CE7]"
                }`}
              >
                <span className="capitalize">{t}</span>
                <span className={`ml-2 text-[10px] px-2 py-0.5 rounded-full ${filter === t ? 'bg-white/20' : 'bg-[#F5F6FA] text-[#2D3436]'}`}>
                  {counts[t] || 0}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* DATA TABLE */}
        <div className="bg-white rounded-[2rem] border border-[#F5F6FA] shadow-xl shadow-gray-100/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#F5F6FA]/50 text-[#2D3436] text-xs font-black uppercase tracking-widest border-b">
                  <th className="px-8 py-6 cursor-pointer hover:text-[#6C5CE7] transition-colors" onClick={() => handleSort("type")}>Type</th>
                  <th className="px-8 py-6 cursor-pointer hover:text-[#6C5CE7] transition-colors" onClick={() => handleSort("name")}>Organization</th>
                  <th className="px-8 py-6">Requester</th>
                  <th className="px-8 py-6">Contact Info</th>
                  <th className="px-8 py-6 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#F5F6FA]">
                {list.length > 0 ? (
                  list.map((item) => (
                    <tr key={item._id} className="group hover:bg-[#F5F6FA]/30 transition-all">
                      <td className="px-8 py-6">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                          item.type === "college"
                            ? "bg-blue-50 text-blue-600 border border-blue-100"
                            : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                        }`}>
                          {item.type}
                        </span>
                      </td>
                      <td className="px-8 py-6 font-bold text-base">
                        {item.name || "N/A"}
                      </td>
                      <td className="px-8 py-6 font-medium text-[#2D3436]/70">
                        {item.requesterName}
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-[#6C5CE7] font-bold text-sm bg-[#6C5CE7]/5 px-3 py-1 rounded-lg">
                          {item.requesterEmail}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button
                          onClick={() => navigate(`/admin/onboarding/${item.type}/${item._id}`)}
                          className="px-6 py-2.5 bg-[#6C5CE7] text-white rounded-xl text-xs font-black shadow-md shadow-[#6C5CE7]/20 hover:shadow-lg hover:shadow-[#6C5CE7]/40 hover:-translate-y-0.5 transition-all active:scale-95"
                        >
                          View Profile
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center opacity-20">
                        <svg className="w-20 h-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                        <p className="text-2xl font-black">No Records Found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* PAGINATION SECTION */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6 bg-[#F5F6FA] p-6 rounded-[2rem] border border-white">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="w-full sm:w-auto px-8 py-3 bg-white text-[#2D3436] font-black rounded-2xl shadow-sm hover:shadow-md disabled:opacity-30 disabled:hover:shadow-none transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
            Previous
          </button>

          <div className="flex items-center gap-4 bg-white/50 px-6 py-2 rounded-2xl">
            <span className="text-sm font-black opacity-30">PAGE</span>
            <span className="text-lg font-black text-[#6C5CE7]">{page}</span>
            <span className="text-sm font-black opacity-30 italic">OF {totalPages}</span>
          </div>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="w-full sm:w-auto px-8 py-3 bg-[#6C5CE7] text-white font-black rounded-2xl shadow-lg shadow-[#6C5CE7]/20 hover:shadow-[#6C5CE7]/40 disabled:opacity-30 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            Next Page
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>

      </main>
    </div>
  );
}