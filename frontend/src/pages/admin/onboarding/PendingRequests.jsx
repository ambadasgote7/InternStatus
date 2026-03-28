import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

      const res = await API.get(
        `/admin/onboarding/pending?type=${filter}`
      );

      let items = res.data?.data?.data || [];

      // 🔥 CRITICAL FIX: normalize type (backend safety)
      items = items.map((item) => ({
        ...item,
        type: item.collegeName ? "college" : "company",
      }));

      setList(items);

      // ✅ correct counts
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

  // ✅ Search filter
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

      const url =
        type === "college"
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
    <div className="min-h-screen bg-white text-[#2D3436] p-6">
      <h1 className="text-3xl font-black mb-6">Pending Requests</h1>

      <input
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-6 p-3 w-full max-w-md bg-gray-100 rounded-xl"
      />

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        {["all", "college", "company"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl ${
              filter === f ? "bg-purple-600 text-white" : "bg-gray-200"
            }`}
          >
            {f} ({counts[f]})
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <p>Loading...</p>
      ) : filteredList.length === 0 ? (
        <p>No data</p>
      ) : (
        filteredList.map((item) => (
          <div
            key={item._id}
            className="p-5 mb-4 border rounded-xl flex justify-between items-center"
          >
            <div>
              <p className="font-bold text-lg">
                {item.type === "college"
                  ? item.collegeName
                  : item.companyName}
              </p>
              <p>{item.requesterName}</p>
              <p className="text-sm text-gray-500">
                {item.requesterEmail}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() =>
                  navigate(`/admin/onboarding/${item.type}/${item._id}`)
                }
                className="px-3 py-2 bg-gray-200 rounded"
              >
                Details
              </button>

              <button
                onClick={() => approve(item._id, item.type)}
                className="px-3 py-2 bg-green-500 text-white rounded"
              >
                Approve
              </button>

              <button
                onClick={() => reject(item._id, item.type)}
                className="px-3 py-2 bg-red-500 text-white rounded"
              >
                Reject
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}