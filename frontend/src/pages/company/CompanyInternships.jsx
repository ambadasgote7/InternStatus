import React, { useEffect, useState } from "react";
import API from "../../api/api";
import { useNavigate } from "react-router-dom";

export default function CompanyInternships() {
  const [data, setData] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

      await API.patch(`/internships/${id}/status`, {
        status: newStatus,
      });

      fetchData();
    } catch (err) {
      alert(err.response?.data?.message);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f9f9] p-4 md:p-8 font-sans box-border text-[#111] pb-12">

      <div className="max-w-5xl mx-auto space-y-8">
        {/* HEADER */}
        <header className="border-b border-[#e5e5e5] pb-6">
          <div className="text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-[0.2em] mb-2">
            Internship Management
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-[#111] m-0 tracking-tighter uppercase">
            My Internships
          </h2>
        </header>

        {/* ✅ Loading UI */}
        {loading && (
          <div className="flex items-center justify-center py-20 bg-[#fff] border border-[#e5e5e5] rounded-[24px] shadow-sm">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-4 border-[#e5e5e5] border-t-[#111] rounded-full animate-spin"></div>
              <p className="text-[#111] font-bold tracking-widest uppercase text-[10px] animate-pulse m-0">
                Loading Internships...
              </p>
            </div>
          </div>
        )}

        {/* ✅ Error UI */}
        {error && (
          <div className="px-6 py-4 text-[11px] font-bold text-[#991b1b] bg-[#fef2f2] border border-[#fecaca] rounded-[14px] uppercase tracking-widest text-center">
            {error}
          </div>
        )}

        {/* ✅ Empty State */}
        {!loading && data.length === 0 && !error && (
          <div className="bg-[#fff] border border-dashed border-[#e5e5e5] rounded-[24px] p-16 text-center shadow-sm">
            <p className="text-[#999] m-0 text-[12px] font-bold uppercase tracking-widest">
              No internships posted yet.
            </p>
          </div>
        )}

        {/* ✅ Data List */}
        {!loading && data.length > 0 && (
          <div className="grid grid-cols-1 gap-6">
            {data.map((item) => {
              const isOpen = item.status === "open";

              return (
                <div
                  key={item._id}
                  className="bg-[#fff] border border-[#e5e5e5] p-6 md:p-8 rounded-[24px] shadow-sm transition-all duration-300 hover:border-[#111] hover:-translate-y-1 hover:shadow-md"
                >
                  <h3 className="text-[20px] font-black text-[#111] m-0 leading-tight uppercase mb-6">
                    {item.title}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-bold text-[#999] uppercase tracking-widest">
                        Status
                      </span>
                      <span
                        className={`inline-block px-2.5 py-1 rounded-[6px] text-[9px] font-bold uppercase tracking-widest border w-max ${
                          isOpen
                            ? "bg-[#f0fdf4] text-[#166534] border-[#bbf7d0]"
                            : "bg-[#fef2f2] text-[#991b1b] border-[#fecaca]"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-bold text-[#999] uppercase tracking-widest">
                        Positions
                      </span>
                      <span className="text-[13px] font-black text-[#111]">
                        {item.positions}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-bold text-[#999] uppercase tracking-widest">
                        Max Applicants
                      </span>
                      <span className="text-[13px] font-black text-[#111]">
                        {item.maxApplicants}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-bold text-[#999] uppercase tracking-widest">
                        Deadline
                      </span>
                      <span className="text-[13px] font-black text-[#111]">
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

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-[#e5e5e5]">
                    <button
                      onClick={() =>
                        navigate(`/company/internship/${item._id}/applicants`)
                      }
                      className="px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.15em] text-[#fff] bg-[#111] border border-[#111] rounded-[10px] hover:bg-[#333] hover:border-[#333] transition-all outline-none cursor-pointer"
                    >
                      View Applicants
                    </button>

                    <button
                      onClick={() =>
                        navigate(`/company/internship/${item._id}/edit`)
                      }
                      className="px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.15em] text-[#111] bg-[#f9f9f9] border border-[#e5e5e5] rounded-[10px] hover:bg-[#111] hover:text-[#fff] hover:border-[#111] transition-all outline-none cursor-pointer"
                    >
                      Edit Details
                    </button>

                    <button
                      disabled={loadingId === item._id}
                      onClick={() => toggleStatus(item._id, item.status)}
                      className={`ml-auto px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.15em] border rounded-[10px] transition-all outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
                        ${
                          isOpen
                            ? "text-[#991b1b] bg-[#fff] border-[#fecaca] hover:bg-[#fef2f2]"
                            : "text-[#166534] bg-[#fff] border-[#bbf7d0] hover:bg-[#f0fdf4]"
                        }
                      `}
                    >
                      {loadingId === item._id
                        ? "Updating..."
                        : isOpen
                          ? "Close Internship"
                          : "Open Internship"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
