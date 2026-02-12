import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../../utils/constants";

const InternshipHiringPage = () => {
  const { id } = useParams();

  const [internship, setInternship] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchApplicants();
  }, []);

  const fetchApplicants = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${BASE_URL}/api/application/internship/${id}/applicants`,
        { withCredentials: true }
      );

      setInternship(res.data.internship);
      setApplicants(res.data.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load applicants");
    } finally {
      setLoading(false);
    }
  };

  const handleApplicantStatusUpdate = async (
    applicationId,
    newStatus
  ) => {
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

      fetchApplicants();
    } catch (err) {
      console.error(err);
      alert("Status update failed");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!internship) return <p>No data found.</p>;

  const acceptedCount = applicants.filter(
    (a) => a.status === "accepted"
  ).length;

  return (
    <div className="p-6">
      {/* Internship Summary */}
      <div className="border p-4 rounded mb-6 shadow">
        <h2 className="text-2xl font-bold">
          {internship.title}
        </h2>
        <p>Status: {internship.status}</p>
        <p>
          Accepted: {acceptedCount} / {internship.positions}
        </p>
      </div>

      {/* Applicants */}
      <h3 className="text-xl font-semibold mb-4">
        Applicants ({applicants.length})
      </h3>

      {applicants.map((app) => (
        <div
          key={app._id}
          className="border p-4 mb-4 rounded"
        >
          <div className="flex justify-between">
            <div>
              <p className="font-semibold text-lg">
                {app.student.fullName}
              </p>
              <p className="text-sm">
                {app.student.course}
              </p>
              <p className="text-sm font-medium">
                Status: {app.status}
              </p>
            </div>

            <div className="flex gap-2 items-center">
              {app.status === "applied" && (
                <>
                  <button
                    disabled={internship.status !== "open"}
                    onClick={() =>
                      handleApplicantStatusUpdate(
                        app._id,
                        "shortlisted"
                      )
                    }
                    className="bg-yellow-500 text-white px-2 py-1 rounded"
                  >
                    Shortlist
                  </button>

                  <button
                    disabled={internship.status !== "open"}
                    onClick={() =>
                      handleApplicantStatusUpdate(
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
                    disabled={internship.status !== "open"}
                    onClick={() =>
                      handleApplicantStatusUpdate(
                        app._id,
                        "interview"
                      )
                    }
                    className="bg-purple-600 text-white px-2 py-1 rounded"
                  >
                    Move to Interview
                  </button>

                  <button
                    disabled={internship.status !== "open"}
                    onClick={() =>
                      handleApplicantStatusUpdate(
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
                    disabled={internship.status !== "open"}
                    onClick={() =>
                      handleApplicantStatusUpdate(
                        app._id,
                        "accepted"
                      )
                    }
                    className="bg-green-600 text-white px-2 py-1 rounded"
                  >
                    Accept
                  </button>

                  <button
                    disabled={internship.status !== "open"}
                    onClick={() =>
                      handleApplicantStatusUpdate(
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
                <span className="text-gray-500 font-medium">
                  Final Decision Made
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default InternshipHiringPage;
