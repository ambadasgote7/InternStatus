import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion"; 
import API from "../../../api/api";

export default function PendingRequests() {
  const navigate = useNavigate();

  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [list, setList] = useState([]);
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
      let items = res.data?.data?.data || [];

      items = items.map((item) => ({
        ...item,
        type: item.collegeName ? "college" : "company",
      }));

      setList(items);

      const collegeCount = items.filter((i) => i.type === "college").length;
      const companyCount = items.filter((i) => i.type === "company").length;

      setCounts({
        all: items.length,
        college: collegeCount,
        company: companyCount,
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

  const filteredList = list.filter((item) =>
    [
      item.requesterName,
      item.requesterEmail,
      item.collegeName,
      item.companyName,
    ]
      .filter(Boolean)
      .some((field) =>
        field.toLowerCase().includes(search.toLowerCase())
      )
  );

  const approve = async (id, type) => {
    try {
      const url = `/admin/onboarding/${type}/${id}/status`;
      await API.put(url, { status: "approved" });
      fetchData();
    } catch {
      alert("Approve failed");
    }
  };

  const reject = async (id, type) => {
    try {
      const reason = prompt("Enter rejection reason");
      if (!reason) return;
      const url = type === "college"
          ? `/college-onboarding/${id}/status`
          : `/company-onboarding/${id}/status`;

      await API.put(url, {
        status: "rejected",
        rejectionReason: reason,
      });
      fetchData();
    } catch {
      alert("Reject failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#2D3436] p-4 md:p-8 lg:p-12 font-['Nunito']">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tight">
              Pending <span className="text-[#6C5CE7]">Requests</span>
            </h1>
            <p className="text-[#2D3436] opacity-60 mt-1 font-semibold">
              Manage and verify incoming onboarding applications.
            </p>
          </div>

          <div className="relative w-full md:w-96 group">
            <input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full p-4 pl-12 bg-[#F5F6FA] border-2 border-transparent focus:border-[#6C5CE7] focus:bg-white rounded-2xl outline-none transition-all duration-300 font-bold shadow-sm"
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2D3436] opacity-40 group-focus-within:text-[#6C5CE7] group-focus-within:opacity-100 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
        </header>

        <div className="flex flex-wrap gap-4 mb-10">
          {["all", "college", "company"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-wider transition-all duration-300 shadow-sm ${
                filter === f 
                  ? "bg-[#6C5CE7] text-white shadow-[#6C5CE7]/30 shadow-lg scale-105" 
                  : "bg-[#F5F6FA] text-[#2D3436] opacity-70 hover:opacity-100 hover:bg-gray-200"
              }`}
            >
              {f} ({counts[f]})
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-50 font-bold italic">
               Loading records...
            </div>
          ) : filteredList.length === 0 ? (
            <div className="text-center py-20 bg-[#F5F6FA] rounded-[2rem] border-2 border-dashed border-gray-200">
              <p className="text-xl font-bold opacity-40">No pending requests found</p>
            </div>
          ) : (
            <AnimatePresence>
              {filteredList.map((item, index) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={item._id}
                  className="bg-white p-6 rounded-[1.5rem] border border-[#F5F6FA] shadow-sm hover:shadow-md transition-all group flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-[#F5F6FA] rounded-2xl flex items-center justify-center text-2xl group-hover:bg-[#6C5CE7]/10 transition-colors">
                        {item.type === "college" ? "🏫" : "🏢"}
                    </div>
                    <div>
                      <h3 className="font-black text-xl text-[#2D3436]">
                        {item.type === "college" ? item.collegeName : item.companyName}
                      </h3>
                      <p className="font-bold text-[#6C5CE7] text-sm">{item.requesterName}</p>
                      <p className="text-sm font-semibold opacity-50">{item.requesterEmail}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <button
                      onClick={() => navigate(`/admin/onboarding/${item.type}/${item._id}`)}
                      className="flex-1 md:flex-none px-5 py-2.5 bg-[#F5F6FA] text-[#2D3436] rounded-xl font-bold hover:bg-[#6C5CE7] hover:text-white transition-all duration-300"
                    >
                      Details
                    </button>

                    <button
                      onClick={() => approve(item._id, item.type)}
                      className="flex-1 md:flex-none px-5 py-2.5 bg-[#2ecc71] text-white rounded-xl font-bold shadow-lg shadow-green-200 hover:scale-105 transition-all"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() => reject(item._id, item.type)}
                      className="flex-1 md:flex-none px-5 py-2.5 bg-[#e74c3c] text-white rounded-xl font-bold shadow-lg shadow-red-200 hover:scale-105 transition-all"
                    >
                      Reject
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}