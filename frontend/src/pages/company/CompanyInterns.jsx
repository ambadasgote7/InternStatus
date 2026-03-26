import React, { useEffect, useState } from "react";
import API from "../../api/api";
import { useNavigate } from "react-router-dom";
import CompanyNavBar from "../../components/navbars/CompanyNavBar";

export default function CompanyInterns() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInterns = async () => {
      try {
        const res = await API.get("/company/interns");
        setData(res?.data?.data || []);
      } catch (err) {
        console.error("Fetch interns error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInterns();
  }, []);

  const getStatusBadge = (status) => {
    const map = {
      ongoing: "bg-blue-100 text-blue-700",
      completed: "bg-green-100 text-green-700",
      terminated: "bg-red-100 text-red-700",
      offer_accepted: "bg-green-100 text-green-700",
    };

    return (
      <span
        className={`px-3 py-1 text-xs rounded ${map[status] || "bg-gray-100"}`}
      >
        {status}
      </span>
    );
  };

  const filteredData = data.filter((item) =>
    (item?.student?.fullName || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex justify-between mb-6">
          <h1 className="text-2xl font-bold">Company Interns</h1>

          <input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border px-3 py-2 rounded"
          />
        </div>

        {filteredData.length === 0 ? (
          <p>No interns found</p>
        ) : (
          <div className="space-y-4">
            {filteredData.map((item) => (
              <div
                key={item._id}
                className="bg-white p-4 rounded shadow flex justify-between"
              >
                <div>
                  <h2 className="font-semibold">
                    {item?.student?.fullName || "Unknown"}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {item?.internship?.title || "No Internship"}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {getStatusBadge(item.status)}

                  <button
                    onClick={() => navigate(`/company/intern/${item._id}`)}
                    className="bg-black text-white px-3 py-1 rounded"
                  >
                    View
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
