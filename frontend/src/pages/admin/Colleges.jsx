import axios from "axios";
import { BASE_URL } from "../../utils/constants";
import { useEffect, useState } from "react";
import AdminNavBar from "../../components/navbars/AdminNavBar";

const Colleges = () => {
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchColleges = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/college`,
        { withCredentials: true }
      );
      setColleges(res.data.colleges);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load colleges");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColleges();
  }, []);

  const filteredColleges = colleges.filter((college) =>
    college.name.toLowerCase().includes(search.toLowerCase()) ||
    college.location.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <p>Loading colleges...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavBar />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-1">
          Colleges
        </h1>
        <p className="text-gray-500 mb-4">
          List of all registered colleges
        </p>

        {/* 🔍 Search Filter */}
        <input
          type="text"
          placeholder="Search by college name or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full mb-6 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {filteredColleges.length === 0 ? (
          <div className=" p-6 rounded-lg shadow text-center text-gray-500">
            No colleges found
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">
                    College Name
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">
                    Location
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredColleges.map((college, index) => (
                  <tr
                    key={college._id}
                    className={`border-t ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-gray-100 transition`}
                  >
                    <td className="px-6 py-3 text-gray-800">
                      {college.name}
                    </td>
                    <td className="px-6 py-3 text-gray-600">
                      {college.location}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Colleges;
