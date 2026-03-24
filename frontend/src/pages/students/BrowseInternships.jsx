import React, { useEffect, useState } from "react";
import API from "../../api/api";
import { useNavigate } from "react-router-dom";
import StudentNavBar from "../../components/navbars/StudentNavBar";

export default function BrowseInternships() {
  const [data, setData] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [sortOrder, setSortOrder] = useState("recent"); // New sorting state
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const res = await API.get("/internships/browse");
      setData(res.data.data || []);
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
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Application failed");
    } finally {
      setLoadingId(null);
    }
  };

  // Sort data based on recent/older selection
  // Assuming 'createdAt' or falling back to 'applicationDeadline' for chronological sorting
  const sortedData = [...data].sort((a, b) => {
    const dateA = new Date(a.createdAt || a.applicationDeadline).getTime();
    const dateB = new Date(b.createdAt || b.applicationDeadline).getTime();
    return sortOrder === "recent" ? dateB - dateA : dateA - dateB;
  });

  return (
    <>
      <StudentNavBar />
      <div className="min-h-screen bg-[#f9f9f9] text-[#111] font-sans pb-10">
        <main className="max-w-7xl mx-auto w-full px-4 md:px-8 py-8 flex flex-col gap-8">
          {/* Header & Sorting */}
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#e5e5e5] pb-6">
            <div className="flex flex-col gap-1.5">
              <h1 className="text-3xl md:text-4xl font-black text-[#111] m-0 tracking-tighter uppercase">
                Browse Internships
              </h1>
              <p className="text-[10px] font-bold text-[#333] opacity-60 m-0 uppercase tracking-[0.2em]">
                Available Career Opportunities
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Sort Feature */}
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="px-4 py-2.5 text-[10px] font-bold text-[#111] bg-[#fff] border border-[#e5e5e5] rounded-[10px] outline-none cursor-pointer uppercase tracking-widest hover:border-[#ccc] shadow-sm appearance-none"
              >
                <option value="recent">Sort: Most Recent</option>
                <option value="older">Sort: Older First</option>
              </select>

              <div className="text-[10px] font-black text-[#111] bg-[#fff] border border-[#e5e5e5] px-4 py-2.5 rounded-[10px] uppercase tracking-[0.15em] shadow-sm">
                Results: {sortedData.length}
              </div>
            </div>
          </header>

          {/* Empty State */}
          {sortedData.length === 0 ? (
            <div className="bg-[#fff] border border-dashed border-[#e5e5e5] rounded-[24px] p-20 text-center shadow-sm">
              <p className="text-[12px] font-bold text-[#999] m-0 uppercase tracking-widest">
                No active listings found
              </p>
            </div>
          ) : (
            /* Streamlined Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedData.map((item) => (
                <div
                  key={item._id}
                  className="bg-[#fff] border border-[#e5e5e5] rounded-[20px] shadow-sm hover:border-[#111] transition-all duration-300 flex flex-col overflow-hidden group"
                >
                  <div className="p-6 flex-grow flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <h2 className="text-[18px] font-black text-[#111] m-0 leading-tight uppercase group-hover:underline">
                        {item.title}
                      </h2>
                      <p className="text-[11px] font-bold text-[#555] uppercase tracking-[0.1em] m-0">
                        {item.company?.name || "Unknown Company"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 mt-auto pt-4 border-t border-[#f9f9f9]">
                      <span className="text-[10px] font-bold text-[#999] uppercase tracking-widest">
                        Deadline:
                      </span>
                      <span className="text-[11px] font-black text-[#111] uppercase tracking-[0.1em]">
                        {new Date(item.applicationDeadline).toLocaleDateString(
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

                  {/* Actions Grid */}
                  <div className="grid grid-cols-2 border-t border-[#e5e5e5]">
                    <button
                      onClick={() =>
                        navigate(`/student/internships/${item._id}`)
                      }
                      className="py-4 text-[10px] font-black text-[#111] uppercase tracking-[0.15em] border-none border-r border-[#e5e5e5] bg-[#fff] cursor-pointer hover:bg-[#f9f9f9] transition-colors outline-none"
                    >
                      View Details
                    </button>

                    <button
                      disabled={item.alreadyApplied || loadingId === item._id}
                      onClick={() => apply(item._id)}
                      className={`py-4 text-[10px] font-black uppercase tracking-[0.15em] border-none cursor-pointer transition-all flex items-center justify-center outline-none
                      ${
                        item.alreadyApplied
                          ? "bg-[#f0fdf4] text-[#166534] opacity-80 cursor-not-allowed"
                          : "bg-[#111] text-[#fff] hover:bg-[#333]"
                      }
                    `}
                    >
                      {loadingId === item._id
                        ? "Processing..."
                        : item.alreadyApplied
                          ? "Applied"
                          : "Apply Now"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
