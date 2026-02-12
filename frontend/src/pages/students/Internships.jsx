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
      alert(err?.response?.data?.message || "Application failed");
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

  const renderStipend = (internship) => {
    if (internship.stipendType === "paid") {
      return `₹${internship.stipendAmount} / month`;
    }
    if (internship.stipendType === "unpaid") {
      return "Unpaid";
    }
    return "Not Disclosed";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 px-6 py-10">
      <div className="max-w-7xl mx-auto">

        <h1 className="text-4xl font-extrabold text-gray-800 mb-10 text-center">
          Explore Internships
        </h1>

        {/* Filters */}
        <div className="bg-white p-6 rounded-2xl shadow-lg mb-10 grid md:grid-cols-4 gap-4 border">
          <input
            type="text"
            name="search"
            placeholder="Search by title..."
            value={filters.search}
            onChange={handleFilterChange}
            className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <select
            name="mode"
            value={filters.mode}
            onChange={handleFilterChange}
            className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
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
            className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <button
            onClick={fetchInternships}
            className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition font-semibold"
          >
            Apply Filters
          </button>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="text-center py-20 text-gray-600 text-lg">
            Loading internships...
          </div>
        ) : internships.length === 0 ? (
          <div className="text-center py-20 text-gray-500 text-lg">
            No internships found.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {internships.map((internship) => (
              <div
                key={internship._id}
                className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition duration-300 p-6 flex flex-col justify-between border"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-bold text-gray-800">
                      {internship.title}
                    </h2>

                    <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                      {internship.mode}
                    </span>
                  </div>

                  <p className="text-sm text-gray-500 mb-1">
                    {internship.company?.companyName || "Unknown Company"}
                  </p>

                  {internship.company?.companyWebsite && (
                    <a
                      href={internship.company.companyWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 underline"
                    >
                      Visit Website
                    </a>
                  )}

                  <p className="text-gray-600 text-sm mt-4 mb-4 line-clamp-3">
                    {internship.description}
                  </p>

                  <div className="text-sm text-gray-600 space-y-1 mb-4">
                    <p><strong>Stipend:</strong> {renderStipend(internship)}</p>
                    <p><strong>Positions:</strong> {internship.positions}</p>
                    <p>
                      <strong>Deadline:</strong>{" "}
                      {new Date(
                        internship.applicationDeadline
                      ).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {internship.skillsRequired?.map((skill, i) => (
                      <span
                        key={i}
                        className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  disabled={
                    appliedIds.has(internship._id) ||
                    applyingId === internship._id
                  }
                  onClick={() => handleApply(internship._id)}
                  className={`w-full py-2 rounded-lg font-semibold transition ${
                    appliedIds.has(internship._id)
                      ? "bg-green-500 text-white cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {appliedIds.has(internship._id)
                    ? "Applied"
                    : applyingId === internship._id
                    ? "Applying..."
                    : "Apply Now"}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="flex justify-center mt-14 gap-3 flex-wrap">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() =>
                setFilters({ ...filters, page: i + 1 })
              }
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filters.page === i + 1
                  ? "bg-blue-600 text-white"
                  : "bg-white border hover:bg-gray-100"
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
