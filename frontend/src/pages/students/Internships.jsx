import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../utils/constants";
import { useNavigate } from "react-router-dom";

const Internships = () => {
  const navigate = useNavigate();

  const [internships, setInternships] = useState([]);
  const [appliedSet, setAppliedSet] = useState(new Set());
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
    mode: "",
    skill: "",
    page: 1,
  });

  const [totalPages, setTotalPages] = useState(1);

  const fetchInternships = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/api/internships`, {
        params: filters,
        withCredentials: true,
      });
      setInternships(res.data.data);
      setTotalPages(res.data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplied = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/application/student/applied`,
        { withCredentials: true },
      );
      const apps = res.data.data || [];
      const ids = new Set(apps.map((app) => app.internship?._id?.toString()));
      setAppliedSet(ids);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchInternships();
    fetchApplied();
  }, [filters]);

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
      page: 1,
    });
  };

  const renderStipend = (internship) => {
    if (internship.stipendType === "paid") {
      return `INR ${internship.stipendAmount}`;
    }
    if (internship.stipendType === "unpaid") {
      return "Unpaid";
    }
    return "N/A";
  };

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#333] font-sans pb-10">
      <main className="max-w-7xl mx-auto w-full px-4 md:px-6 py-6 flex flex-col gap-6">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#e5e5e5] pb-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-[23px] font-black text-[#333] m-0 tracking-tight leading-tight">
              Explore Internships
            </h1>
            <p className="text-[13px] font-bold text-[#333] opacity-60 m-0 uppercase tracking-widest">
              Available Career Opportunities
            </p>
          </div>
        </header>

        <section className="bg-[#fff] border border-[#e5e5e5] rounded-[20px] p-4 md:p-6 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black opacity-40 uppercase tracking-widest ml-1">
              Search Keywords
            </label>
            <input
              type="text"
              name="search"
              placeholder="e.g. Frontend Developer"
              value={filters.search}
              onChange={handleFilterChange}
              className="w-full px-4 py-2.5 text-[13px] bg-[#fff] border border-[#333] rounded-[12px] outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black opacity-40 uppercase tracking-widest ml-1">
              Work Mode
            </label>
            <select
              name="mode"
              value={filters.mode}
              onChange={handleFilterChange}
              className="w-full px-4 py-2.5 text-[13px] border border-[#333] rounded-[12px] outline-none appearance-none cursor-pointer"
            >
              <option value="">All Modes</option>
              <option value="remote">Remote</option>
              <option value="onsite">Onsite</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black opacity-40 uppercase tracking-widest ml-1">
              Stack Filter
            </label>
            <input
              type="text"
              name="skill"
              placeholder="e.g. React, Python"
              value={filters.skill}
              onChange={handleFilterChange}
              className="w-full px-4 py-2.5 text-[13px] border border-[#333] rounded-[12px] outline-none"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={fetchInternships}
              className="w-full py-2.5 bg-[#111] text-[#fff] text-[11px] font-black uppercase tracking-widest rounded-[12px] border-none cursor-pointer hover:opacity-80 transition-opacity"
            >
              Refresh Listings
            </button>
          </div>
        </section>

        {loading ? (
          <div className="py-20 text-center">
            <p className="text-[14px] font-bold text-[#333] animate-pulse uppercase tracking-widest">
              Scanning Opportunities...
            </p>
          </div>
        ) : internships.length === 0 ? (
          <div className="bg-[#fff] border-2 border-dashed border-[#e5e5e5] rounded-[20px] p-20 text-center">
            <p className="text-[13px] font-bold text-[#333] opacity-40 m-0 uppercase tracking-widest">
              No matching internship records found
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {internships.map((internship) => {
              const isApplied = appliedSet.has(internship._id.toString());
              return (
                <div
                  key={internship._id}
                  className="bg-[#fff] border border-[#e5e5e5] rounded-[20px] shadow-sm hover:border-[#333] transition-all flex flex-col overflow-hidden"
                >
                  <div className="p-6 flex-grow flex flex-col">
                    <div className="flex justify-between items-start mb-4 gap-2">
                      <div className="flex-1 min-w-0">
                        <h2 className="text-[17px] font-black text-[#333] m-0 leading-tight truncate">
                          {internship.title}
                        </h2>
                        <p className="text-[11px] font-bold opacity-50 uppercase tracking-widest mt-1">
                          {internship.company?.companyName}
                        </p>
                      </div>
                      {isApplied && (
                        <span className="px-2 py-1 rounded-[8px] text-[9px] font-black uppercase tracking-widest bg-[#f9f9f9] border border-[#008000] text-[#008000]">
                          Applied
                        </span>
                      )}
                    </div>

                    <div className="mb-6">
                      <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest block mb-1">
                        Hub Location
                      </span>
                      <span className="text-[13px] font-bold">
                        {internship.location || "Remote"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-auto pt-5 border-t border-[#f9f9f9]">
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-bold opacity-40 uppercase tracking-widest">
                          Mode
                        </span>
                        <span className="text-[12px] font-black text-[#111] capitalize">
                          {internship.mode}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1 text-right">
                        <span className="text-[9px] font-bold opacity-40 uppercase tracking-widest">
                          Compensation
                        </span>
                        <span className="text-[12px] font-black text-[#008000]">
                          {renderStipend(internship)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-[#fcfcfc] border-t border-[#f9f9f9]">
                    <button
                      onClick={() =>
                        navigate(`/student/internships/${internship._id}`)
                      }
                      className="w-full py-2.5 bg-[#f9f9f9] border border-[#333] text-[#333] text-[11px] font-black uppercase tracking-widest rounded-[10px] hover:bg-[#333] hover:text-[#fff] transition-all cursor-pointer"
                    >
                      Analyze Opportunity
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center mt-6 gap-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => {
                  setFilters({ ...filters, page: i + 1 });
                  window.scrollTo(0, 0);
                }}
                className={`w-10 h-10 rounded-[10px] font-black text-[12px] transition-all cursor-pointer border ${
                  filters.page === i + 1
                    ? "bg-[#111] text-[#fff] border-[#111]"
                    : "bg-[#fff] border-[#e5e5e5] text-[#333] hover:border-[#333]"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Internships;
