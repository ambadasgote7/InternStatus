import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../../api/api";

export default function VerifiedOnboardings() {
  const navigate = useNavigate();

  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [colleges, setColleges] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [counts, setCounts] = useState({ all: 0, college: 0, company: 0 });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/admin/onboarding/verified?type=${filter}`);
      const collegeList = res.data?.data?.colleges || [];
      const companyList = res.data?.data?.companies || [];

      setColleges(collegeList);
      setCompanies(companyList);
      setCounts({
        all: collegeList.length + companyList.length,
        college: collegeList.length,
        company: companyList.length,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filter]);

  const list = [
    ...colleges.map((c) => ({ ...c, type: "college" })),
    ...companies.map((c) => ({ ...c, type: "company" })),
  ];

  const filteredList = list.filter(
    (item) =>
      item.requesterName?.toLowerCase().includes(search.toLowerCase()) ||
      item.requesterEmail?.toLowerCase().includes(search.toLowerCase()) ||
      item.collegeName?.toLowerCase().includes(search.toLowerCase()) ||
      item.companyName?.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center font-sans">
        <p className="text-[14px] font-bold text-[#333] animate-pulse m-0 uppercase tracking-widest">
          Indexing Verified Directory...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#333] font-sans pb-10">
      <main className="max-w-7xl mx-auto w-full px-4 md:px-6 py-6 flex flex-col gap-6">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#e5e5e5] pb-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-[23px] font-black text-[#333] m-0 tracking-tight leading-tight">
              Verified Onboardings
            </h1>
            <p className="text-[13px] font-bold text-[#333] opacity-60 m-0 uppercase tracking-widest">
              Authorized Institutional Directory
            </p>
          </div>
        </header>

        <section className="bg-[#fff] border border-[#e5e5e5] rounded-[20px] p-5 md:p-6 shadow-sm flex flex-col lg:flex-row gap-5 justify-between items-center">
          <div className="w-full lg:max-w-md">
            <input
              type="text"
              placeholder="Search directory records..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-3 text-[13px] text-[#333] bg-[#fff] border border-[#333] rounded-[14px] outline-none"
            />
          </div>

          <div className="flex gap-2 p-1 bg-[#f9f9f9] border border-[#e5e5e5] rounded-[14px]">
            {[
              { id: "all", label: "All Records", count: counts.all },
              { id: "college", label: "Colleges", count: counts.college },
              { id: "company", label: "Companies", count: counts.company },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-6 py-2 rounded-[10px] text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer border-none ${
                  filter === tab.id
                    ? "bg-[#111] text-[#fff]"
                    : "text-[#333] opacity-40 hover:opacity-100"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </section>

        {filteredList.length === 0 ? (
          <div className="bg-[#fff] border-2 border-dashed border-[#e5e5e5] rounded-[20px] p-20 text-center">
            <p className="text-[13px] font-bold text-[#333] opacity-40 m-0 uppercase tracking-widest">
              No matching verified entities found
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredList.map((item) => (
              <div
                key={item._id}
                className="bg-[#fff] border border-[#e5e5e5] rounded-[20px] shadow-sm hover:border-[#333] transition-all flex flex-col"
              >
                <div className="p-6 flex-grow flex flex-col gap-5">
                  <div className="flex justify-between items-start">
                    <span className="px-2.5 py-1 rounded-[10px] text-[9px] font-black uppercase tracking-widest bg-[#f9f9f9] border border-[#e5e5e5]">
                      {item.type}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <h3 className="text-[18px] font-black text-[#111] m-0 leading-tight">
                      {item.type === "college"
                        ? item.collegeName
                        : item.companyName}
                    </h3>
                  </div>

                  <div className="flex flex-col gap-4 py-4 border-y border-[#f9f9f9] mt-auto">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">
                        Official Requester
                      </span>
                      <div className="flex flex-col">
                        <span className="text-[13px] font-bold text-[#111]">
                          {item.requesterName || "Not Documented"}
                        </span>
                        <span className="text-[11px] font-mono text-[#333] opacity-60">
                          {item.requesterEmail}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-[#fcfcfc] border-t border-[#f9f9f9] rounded-b-[20px]">
                  <button
                    onClick={() =>
                      navigate(`/admin/onboarding/${item.type}/${item._id}`)
                    }
                    className="w-full py-3 bg-[#f9f9f9] border border-[#333] text-[#333] text-[11px] font-black uppercase tracking-widest rounded-[10px] hover:bg-[#333] hover:text-[#fff] transition-all cursor-pointer"
                  >
                    View Record Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
