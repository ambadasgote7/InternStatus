import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../utils/constants";

const Internships = () => {
  const [internships, setInternships] = useState([]);
  const [appliedIds, setAppliedIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [applyingId, setApplyingId] = useState(null);

  const [filters, setFilters] = useState({
    search: "",
    mode: "",
    skill: "",
    page: 1,
  });

  const [totalPages, setTotalPages] = useState(1);

  // Fetch internships
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
  const fetchAppliedInternships = async () => {
  try {
    const res = await axios.get(
      `${BASE_URL}/api/internships/student/applied`,
      { withCredentials: true }
    );

    setAppliedIds(new Set(res.data.data));
  } catch (err) {
    console.error(err);
  }
};


  useEffect(() => {
    fetchInternships();
    fetchAppliedInternships();
  }, [filters]);

  const handleApply = async (id) => {
    try {
      setApplyingId(id);

      await axios.post(
        `${BASE_URL}/api/internships/${id}/apply`,
        {},
        { withCredentials: true }
      );

      setAppliedIds((prev) => new Set(prev).add(id));
    } catch (err) {
      alert(
        err?.response?.data?.message || "Application failed"
      );
    } finally {
      setApplyingId(null);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
      page: 1,
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 px-6 py-8">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-3xl font-bold mb-6">Available Internships</h1>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow mb-6 grid md:grid-cols-4 gap-4">

          <input
            type="text"
            name="search"
            placeholder="Search by title..."
            value={filters.search}
            onChange={handleFilterChange}
            className="border rounded-lg px-3 py-2"
          />

          <select
            name="mode"
            value={filters.mode}
            onChange={handleFilterChange}
            className="border rounded-lg px-3 py-2"
          >
            <option value="">All Modes</option>
            <option value="remote">Remote</option>
            <option value="onsite">Onsite</option>
            <option value="hybrid">Hybrid</option>
          </select>

          <input
            type="text"
            name="skill"
            placeholder="Filter by skill..."
            value={filters.skill}
            onChange={handleFilterChange}
            className="border rounded-lg px-3 py-2"
          />

          <button
            onClick={fetchInternships}
            className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition"
          >
            Apply Filters
          </button>
        </div>

        {/* Internship List */}
        {loading ? (
          <div className="text-center py-10">Loading internships...</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {internships.map((internship) => (
              <div
                key={internship._id}
                className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition"
              >
                <h2 className="text-xl font-semibold mb-2">
                  {internship.title}
                </h2>

                <p className="text-gray-600 text-sm mb-2">
                  {internship.description.slice(0, 120)}...
                </p>

                <div className="text-sm text-gray-500 mb-2">
                  <p>Mode: {internship.mode}</p>
                  <p>
                    Deadline:{" "}
                    {new Date(
                      internship.applicationDeadline
                    ).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {internship.skillsRequired?.map((skill, i) => (
                    <span
                      key={i}
                      className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <button
                  disabled={
                    appliedIds.has(internship._id) ||
                    applyingId === internship._id
                  }
                  onClick={() => handleApply(internship._id)}
                  className={`w-full py-2 rounded-lg font-medium transition ${
                    appliedIds.has(internship._id)
                      ? "bg-green-500 text-white cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {appliedIds.has(internship._id)
                    ? "Applied"
                    : applyingId === internship._id
                    ? "Applying..."
                    : "Apply"}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="flex justify-center mt-8 gap-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() =>
                setFilters({ ...filters, page: i + 1 })
              }
              className={`px-3 py-1 rounded ${
                filters.page === i + 1
                  ? "bg-blue-600 text-white"
                  : "bg-white border"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Internships;
