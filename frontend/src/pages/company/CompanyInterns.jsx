import React, { useEffect, useState } from "react";
import API from "../../api/api";
import { useNavigate } from "react-router-dom";

export default function CompanyInterns() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const fetchInterns = async () => {
    try {
      const res = await API.get("/company/interns");
      setData(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterns();
  }, []);

  const getStatusBadge = (status) => {
    let colorClass = "bg-[#f9f9f9] text-[#555] border-[#e5e5e5]"; // default

    if (status === "ongoing")
      colorClass = "bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe]";
    else if (status === "completed")
      colorClass = "bg-[#f0fdf4] text-[#166534] border-[#bbf7d0]";
    else if (status === "terminated")
      colorClass = "bg-[#fef2f2] text-[#991b1b] border-[#fecaca]";
    else if (status === "offer_accepted")
      colorClass = "bg-[#f0fdf4] text-[#166534] border-[#bbf7d0]";

    return (
      <span
        className={`inline-block px-3 py-1.5 rounded-[8px] text-[10px] font-black uppercase tracking-widest border ${colorClass}`}
      >
        {status.replace("_", " ")}
      </span>
    );
  };

  // Filter interns by name
  const filteredData = data.filter((item) => {
    const name = item.student?.fullName || "";
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f9f9f9]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#e5e5e5] border-t-[#111] rounded-full animate-spin"></div>
          <p className="text-[#111] font-bold tracking-widest uppercase text-[10px] animate-pulse m-0">
            Loading Interns
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9] p-4 md:p-8 font-sans box-border text-[#111]">
      <CompanyNavBar />
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        {/* Header & Search */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-[#e5e5e5] pb-6">
          <div>
            <div className="text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-[0.2em] mb-2">
              Internship Management
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-[#111] m-0 tracking-tighter uppercase">
              Company Interns
            </h2>
          </div>

          <div className="w-full md:w-auto md:min-w-[300px]">
            <input
              type="text"
              placeholder="Search by intern name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-5 py-3.5 text-[13px] font-medium text-[#111] bg-[#fff] border border-[#e5e5e5] rounded-[14px] outline-none transition-all duration-300 focus:border-[#111] focus:ring-1 focus:ring-[#111] placeholder:text-[#999] shadow-sm"
            />
          </div>
        </header>

        {/* Empty States */}
        {data.length === 0 ? (
          <div className="bg-[#fff] p-16 rounded-[24px] border border-dashed border-[#e5e5e5] text-center shadow-sm">
            <p className="text-[#999] m-0 text-[12px] font-bold uppercase tracking-widest">
              No interns found.
            </p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="bg-[#fff] p-16 rounded-[24px] border border-dashed border-[#e5e5e5] text-center shadow-sm">
            <p className="text-[#999] m-0 text-[12px] font-bold uppercase tracking-widest">
              No interns found matching "{searchTerm}".
            </p>
          </div>
        ) : (
          /* Streamlined List View */
          <div className="flex flex-col gap-4">
            {filteredData.map((item) => (
              <div
                key={item._id}
                className="bg-[#fff] border border-[#e5e5e5] rounded-[20px] p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-5 transition-all duration-300 hover:border-[#111] shadow-sm"
              >
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-[18px] font-black text-[#111] uppercase m-0 leading-tight">
                    {item.student?.fullName || "Unknown Intern"}
                  </h3>
                  <p className="text-[11px] font-bold text-[#555] uppercase tracking-[0.1em] m-0">
                    {item.internship?.title || "Unassigned"}
                  </p>
                </div>

                <div className="flex items-center gap-4 sm:gap-6">
                  {getStatusBadge(item.status)}
                  <button
                    onClick={() => navigate(`/company/intern/${item._id}`)}
                    className="px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.15em] text-[#111] bg-[#f9f9f9] border border-[#e5e5e5] rounded-[10px] hover:bg-[#111] hover:text-[#fff] hover:border-[#111] hover:-translate-y-0.5 transition-all duration-300 whitespace-nowrap cursor-pointer outline-none"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
