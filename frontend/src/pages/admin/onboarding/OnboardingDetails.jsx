import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../../api/api";

export default function VerifiedOnboardings() {
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

  /* ================= FETCH ================= */

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

  /* ================= MERGE ================= */

  const list = [
    ...colleges.map((c) => ({ ...c, type: "college" })),
    ...companies.map((c) => ({ ...c, type: "company" })),
  ];

  /* ================= SEARCH ================= */

  const filteredList = list.filter(
    (item) =>
      item.requesterName?.toLowerCase().includes(search.toLowerCase()) ||
      item.requesterEmail?.toLowerCase().includes(search.toLowerCase()) ||
      item.collegeName?.toLowerCase().includes(search.toLowerCase()) ||
      item.companyName?.toLowerCase().includes(search.toLowerCase()),
  );

  /* ================= UI ================= */

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Verified Onboardings</h2>

      {/* FILTER BUTTONS */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded ${
            filter === "all" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          All
        </button>

        <button
          onClick={() => setFilter("college")}
          className={`px-4 py-2 rounded ${
            filter === "college" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Colleges
        </button>

        <button
          onClick={() => setFilter("company")}
          className={`px-4 py-2 rounded ${
            filter === "company" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Companies
        </button>
      </div>

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search..."
        className="border px-3 py-2 rounded mb-5 w-full max-w-md"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* LIST */}
      {loading ? (
        <p>Loading...</p>
      ) : filteredList.length === 0 ? (
        <p>No verified onboardings</p>
      ) : (
        <div className="grid gap-4">
          {filteredList.map((item) => (
            <div
              key={item._id}
              className="border p-4 rounded shadow-sm bg-white"
            >
              <div className="flex justify-between">
                <div>
                  <p className="font-semibold">
                    {item.type === "college"
                      ? item.collegeName
                      : item.companyName}
                  </p>

                  <p className="text-sm text-gray-600">{item.requesterEmail}</p>

                  <p className="text-xs text-gray-500 mt-1">
                    Type: {item.type}
                  </p>
                </div>

                <div>
                  <button
                    onClick={() =>
                      navigate(`/admin/onboarding/${item.type}/${item._id}`)
                    }
                    className="px-3 py-1 bg-gray-200 rounded"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
