import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../../utils/constants";

const InternshipHiringPage = () => {
  const { id } = useParams();

  const [internship, setInternship] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchApplicants();
  }, [page, statusFilter]);

  const fetchApplicants = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${BASE_URL}/api/application/internship/${id}/applicants`,
        {
          params: {
            page,
            status: statusFilter,
            search,
          },
          withCredentials: true,
        }
      );

      setInternship(res.data.internship);
      setApplicants(res.data.data);
      setMeta(res.data.meta);
    } catch (err) {
      console.error(err);
      alert("Failed to load applicants");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      const res = await axios.patch(
        `${BASE_URL}/api/application/${applicationId}/status`,
        { status: newStatus },
        { withCredentials: true }
      );

      const updated = res.data.data;

      setApplicants((prev) =>
        prev.map((app) =>
          app._id === updated._id ? updated : app
        )
      );
    } catch (err) {
      console.error(err);
      alert("Status update failed");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!internship) return <div className="p-6">No data found.</div>;

  const acceptedCount = applicants.filter(
    (a) => a.status === "accepted"
  ).length;

  const positionsFilled =
    acceptedCount >= internship.positions;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className=" shadow rounded p-6 mb-6">
        <h1 className="text-2xl font-bold mb-2">
          {internship.title}
        </h1>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Status: {internship.status}</span>
          <span>
            Accepted: {acceptedCount} / {internship.positions}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className=" shadow rounded p-4 mb-6 flex flex-wrap gap-4 items-center">
        <input
          type="text"
          placeholder="Search by student name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded w-60"
        />

        <select
          value={statusFilter}
          onChange={(e) => {
            setPage(1);
            setStatusFilter(e.target.value);
          }}
          className="border p-2 rounded"
        >
          <option value="">All Status</option>
          <option value="applied">Applied</option>
          <option value="shortlisted">Shortlisted</option>
          <option value="interview">Interview</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
        </select>

        <button
          onClick={() => {
            setPage(1);
            fetchApplicants();
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Search
        </button>
      </div>

      {/* Applicants Table */}
      <div className="shadow rounded overflow-x-auto text-black">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100 text-left text-sm">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Course</th>
              <th className="p-3">Year</th>
              <th className="p-3">Skills</th>
              <th className="p-3">Resume</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {applicants.map((app) => (
              <tr
                key={app._id}
                className="border-t text-sm hover:bg-gray-50"
              >
                <td className="p-3 font-medium">
                  {app.student?.userId?.fullName}
                </td>

                <td className="p-3">
                  {app.student?.userId?.email}
                </td>

                <td className="p-3">
                  {app.student?.course}
                </td>

                <td className="p-3">
                  {app.student?.year}
                </td>

                <td className="p-3">
                  {app.student?.skills?.map(
                    (skill, i) => (
                      <span
                        key={i}
                        className="bg-gray-200 text-xs px-2 py-1 rounded mr-1"
                      >
                        {skill}
                      </span>
                    )
                  )}
                </td>

                <td className="p-3">
                  {app.student?.resumeFileUrl ? (
                    <a
                      href={app.student.resumeFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      View
                    </a>
                  ) : (
                    "N/A"
                  )}
                </td>

                <td className="p-3 font-semibold capitalize">
                  {app.status}
                </td>

                <td className="p-3 text-center">
                  {app.status === "applied" && (
                    <>
                      <button
                        disabled={
                          internship.status !== "open"
                        }
                        onClick={() =>
                          handleStatusUpdate(
                            app._id,
                            "shortlisted"
                          )
                        }
                        className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
                      >
                        Shortlist
                      </button>

                      <button
                        disabled={
                          internship.status !== "open"
                        }
                        onClick={() =>
                          handleStatusUpdate(
                            app._id,
                            "rejected"
                          )
                        }
                        className="bg-red-600 text-white px-2 py-1 rounded"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {app.status === "shortlisted" && (
                    <>
                      <button
                        disabled={
                          internship.status !== "open"
                        }
                        onClick={() =>
                          handleStatusUpdate(
                            app._id,
                            "interview"
                          )
                        }
                        className="bg-purple-600 text-white px-2 py-1 rounded mr-2"
                      >
                        Interview
                      </button>

                      <button
                        disabled={
                          internship.status !== "open"
                        }
                        onClick={() =>
                          handleStatusUpdate(
                            app._id,
                            "rejected"
                          )
                        }
                        className="bg-red-600 text-white px-2 py-1 rounded"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {app.status === "interview" && (
                    <>
                      <button
                        disabled={
                          internship.status !== "open" ||
                          positionsFilled
                        }
                        onClick={() =>
                          handleStatusUpdate(
                            app._id,
                            "accepted"
                          )
                        }
                        className="bg-green-600 text-white px-2 py-1 rounded mr-2"
                      >
                        Accept
                      </button>

                      <button
                        disabled={
                          internship.status !== "open"
                        }
                        onClick={() =>
                          handleStatusUpdate(
                            app._id,
                            "rejected"
                          )
                        }
                        className="bg-red-600 text-white px-2 py-1 rounded"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {(app.status === "accepted" ||
                    app.status === "rejected") && (
                    <span className="text-gray-500">
                      Finalized
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4 mt-6">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="bg-gray-300 px-3 py-1 rounded"
        >
          Prev
        </button>

        <span className="text-sm">
          Page {meta.page || 1} of {meta.pages || 1}
        </span>

        <button
          disabled={page === meta.pages}
          onClick={() => setPage((p) => p + 1)}
          className="bg-gray-300 px-3 py-1 rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default InternshipHiringPage;
