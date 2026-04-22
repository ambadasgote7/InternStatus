import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/api";
import { useSelector } from "react-redux";

const AtRiskList = () => {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");


  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const role = useSelector((state) => state.user?.user?.role);

  // ---------------- FETCH DATA ----------------
  const fetchStudents = async () => {
    try {
      setLoading(true);

      const res = await API.get("/college/at-risk", {
        params: {
          page,
          limit: 10,
          search
        }
      });

      setStudents(res.data.data || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
    } catch (err) {
      console.error("Failed to fetch at-risk students", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [page, search]);

  // ---------------- SEARCH HANDLER ----------------
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchStudents();
  };


  // ---------------- UI ----------------
  return (
    <div className="min-h-screen bg-[#FFFFFF] p-4 md:p-8 font-['Nunito'] text-[#2D3436] animate-in fade-in duration-700">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#2D3436]">
              At-Risk <span className="text-[#6C5CE7]">Students</span>
            </h1>
            <p className="text-gray-500 mt-2 font-medium">
              Monitoring students requiring immediate internship guidance
            </p>
          </div>
          
          {/* STAT BRIEF (Visual addition for vibe) */}
          <div className="bg-[#F5F6FA] px-6 py-3 rounded-2xl border border-gray-100 hidden sm:block">
            <span className="text-sm font-bold text-[#6C5CE7] uppercase tracking-wider">Priority List</span>
          </div>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="mb-6 group">
          <form 
            onSubmit={handleSearch} 
            className="flex flex-col sm:flex-row gap-3 bg-[#F5F6FA] p-3 rounded-2xl border border-transparent focus-within:border-[#6C5CE7]/30 focus-within:bg-white transition-all duration-300 shadow-sm"
          >
            <div className="relative flex-grow">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search by student name..."
                className="w-full bg-transparent border-none pl-10 pr-4 py-2.5 text-sm focus:ring-0 placeholder:text-gray-400 font-semibold"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="bg-[#6C5CE7] hover:bg-[#5b4cc4] text-white px-8 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-[#6C5CE7]/20">
              Search
            </button>
          </form>
        </div>

        {/* DATA TABLE CONTAINER */}
        <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#F5F6FA] overflow-hidden transition-all duration-500 hover:shadow-[0_20px_50px_rgba(108,92,231,0.05)]">
          {loading ? (
            <div className="p-20 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#F5F6FA] border-t-[#6C5CE7] mb-4"></div>
              <p className="text-gray-400 font-bold animate-pulse">Analyzing student records...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="p-20 text-center">
               <div className="bg-[#F5F6FA] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
               </div>
              <p className="text-gray-500 font-bold text-lg">No at-risk students found</p>
              <p className="text-gray-400 text-sm">All students are currently on track.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F5F6FA]/50">
                    <th className="px-6 py-5 text-[11px] text-gray-400 font-black uppercase tracking-[2px]">Student Name</th>
                    <th className="px-6 py-5 text-[11px] text-gray-400 font-black uppercase tracking-[2px]">Email Address</th>
                    <th className="px-6 py-5 text-[11px] text-gray-400 font-black uppercase tracking-[2px]">Course</th>
                    <th className="px-6 py-5 text-[11px] text-gray-400 font-black uppercase tracking-[2px]">Specialization</th>
                    <th className="px-6 py-5 text-[11px] text-gray-400 font-black uppercase tracking-[2px] text-center">Year</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#F5F6FA]">
                  {students.map((student, index) => (
                    <tr
                      key={student.id}
                      onClick={() => navigate(`${role === "college" ? "/college" : "/faculty"}/at-risk/${student.id}`)}
                      className="group cursor-pointer transition-all duration-300 hover:bg-[#F5F6FA]"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#6C5CE7]/10 flex items-center justify-center text-[#6C5CE7] font-bold text-sm transition-colors group-hover:bg-[#6C5CE7] group-hover:text-white">
                            {student.name?.charAt(0)}
                          </div>
                          <span className="text-sm font-bold text-[#2D3436] group-hover:text-[#6C5CE7] transition-colors">
                            {student.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm text-gray-500 font-medium">
                        {student.email}
                      </td>
                      <td className="px-6 py-5">
                        <span className="px-3 py-1 rounded-lg bg-white border border-gray-100 text-xs font-bold text-gray-600 shadow-sm">
                          {student.courseName || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-sm text-gray-600 font-semibold italic">
                        {student.specialization || "-"}
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#F5F6FA] text-xs font-black text-[#2D3436]">
                          {student.year || "-"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* PAGINATION SECTION */}
        {!loading && totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center mt-8 gap-4">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="w-full sm:w-auto px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-[#2D3436] hover:border-[#6C5CE7] hover:text-[#6C5CE7] disabled:opacity-30 disabled:hover:border-gray-200 disabled:hover:text-[#2D3436] transition-all duration-300 flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>

            <div className="bg-[#F5F6FA] px-4 py-2 rounded-xl border border-gray-100 shadow-inner">
              <p className="text-xs font-black text-gray-500 tracking-widest uppercase">
                Page <span className="text-[#6C5CE7]">{page}</span> of <span className="text-[#2D3436]">{totalPages}</span>
              </p>
            </div>

            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#6C5CE7] rounded-xl text-sm font-bold text-white hover:bg-[#5b4cc4] disabled:opacity-30 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-[#6C5CE7]/20"
            >
              Next
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AtRiskList;