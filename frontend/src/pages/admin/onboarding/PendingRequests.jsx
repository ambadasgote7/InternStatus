import { useEffect, useState } from "react";
import AdminNavBar from "../../../components/navbars/AdminNavBar";
import { useNavigate } from "react-router-dom";

export default function PendingRequests() {
  const navigate = useNavigate();

  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const [colleges, setColleges] = useState([]);
  const [companies, setCompanies] = useState([]);

  const [counts, setCounts] = useState({
    all: 0,
    college: 0,
    company: 0,
  });

  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/admin/onboarding/pending?type=${filter}`);

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

  const approve = async (id, type) => {
    try {
      const url =
        type === "college"
          ? `/college-onboarding/${id}/status`
          : `/company-onboarding/${id}/status`;

      await API.put(url, { status: "approved" });
      fetchData();
    } catch (err) {
      alert("Approve failed");
    }
  };

  const reject = async (id, type) => {
    try {
      const reason = prompt("Enter rejection reason");
      if (!reason) return;

      const url =
        type === "college"
          ? `/college-onboarding/${id}/status`
          : `/company-onboarding/${id}/status`;

      await API.put(url, {
        status: "rejected",
        rejectionReason: reason,
      });

      fetchData();
    } catch (err) {
      alert("Reject failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#333] flex flex-col font-sans pb-10">
      <main className="max-w-7xl mx-auto w-full px-4 md:px-6 py-6 flex flex-col gap-5">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#e5e5e5] pb-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-[23px] font-black text-[#333] m-0 tracking-tight leading-tight">
              Pending Requests
            </h1>
            <p className="text-[13px] font-bold text-[#333] opacity-60 m-0 mt-1 uppercase tracking-widest">
              Awaiting Verification
            </p>
          </div>

          <input
            type="text"
            placeholder="Search registrations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-80 px-4 py-2.5 text-[13px] text-[#333] bg-[#fff] border border-[#e5e5e5] rounded-[14px] outline-none transition-colors focus:border-[#333] shadow-sm"
          />
        </div>

        <div className="flex gap-2">
          {[
            { id: "all", label: "All", count: counts.all },
            { id: "college", label: "Colleges", count: counts.college },
            { id: "company", label: "Companies", count: counts.company },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              className={`px-5 py-2 rounded-[14px] text-[12px] font-bold uppercase tracking-widest transition-all cursor-pointer border-none ${
                filter === t.id
                  ? "bg-[#111] text-[#fff]"
                  : "bg-[#fff] text-[#333] border border-[#e5e5e5] hover:bg-[#f9f9f9]"
              }`}
            >
              {t.label} ({t.count})
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <p className="text-[14px] font-bold text-[#333] animate-pulse">
              Loading pending requests...
            </p>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="bg-[#fff] border-2 border-dashed border-[#e5e5e5] rounded-[20px] p-10 text-center">
            <p className="text-[13px] font-bold text-[#333] opacity-60 m-0">
              No pending requests found.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredList.map((item) => (
              <div
                key={item._id}
                className="bg-[#fff] border border-[#e5e5e5] rounded-[20px] p-5 shadow-sm hover:border-[#333] transition-colors flex flex-col md:flex-row md:justify-between md:items-center gap-5"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-[10px] text-[9px] font-black uppercase tracking-widest bg-[#f9f9f9] border border-[#e5e5e5] text-[#333]">
                      {item.type}
                    </span>
                    <h3 className="text-[17px] font-black text-[#333] m-0 truncate">
                      {item.type === "college"
                        ? item.collegeName
                        : item.companyName}
                    </h3>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-[13px] font-bold text-[#333]">
                      {item.requesterName}
                    </span>
                    <span className="text-[12px] font-medium text-[#333] opacity-60">
                      {item.requesterEmail}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 md:border-l border-[#e5e5e5] md:pl-5">
                  <button
                    onClick={() =>
                      navigate(`/admin/onboarding/${item.type}/${item._id}`)
                    }
                    className="px-4 py-2 text-[11px] font-bold uppercase tracking-widest bg-[#f9f9f9] border border-[#e5e5e5] text-[#333] rounded-[12px] hover:border-[#333] transition-colors cursor-pointer"
                  >
                    Details
                  </button>

                  <button
                    onClick={() => approve(item._id, item.type)}
                    className="px-4 py-2 text-[11px] font-bold uppercase tracking-widest bg-[#111] text-[#fff] border-none rounded-[12px] hover:opacity-80 transition-opacity cursor-pointer"
                  >
                    Approve
                  </button>

                  <button
                    onClick={() => reject(item._id, item.type)}
                    className="px-4 py-2 text-[11px] font-bold uppercase tracking-widest bg-[#fff] border border-[#cc0000] text-[#cc0000] rounded-[12px] hover:bg-[#f9f9f9] transition-colors cursor-pointer"
                  >
                    Reject
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
