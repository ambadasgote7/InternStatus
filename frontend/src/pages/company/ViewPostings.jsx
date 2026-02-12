import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../../utils/constants";

const ViewPostings = () => {
  const navigate = useNavigate();

  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInternships();
  }, []);

  const fetchInternships = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${BASE_URL}/api/internships/company/internships`,
        {
          withCredentials: true, // ✅ send cookie
        }
      );

      setInternships(res.data.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load internships");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await axios.patch(
        `${BASE_URL}/api/internships/company/internships/${id}/status`,
        { status: newStatus },
        {
          withCredentials: true, // ✅ send cookie
        }
      );

      const updated = res.data.data;

      setInternships((prev) =>
        prev.map((item) =>
          item._id === updated._id ? updated : item
        )
      );
    } catch (err) {
      console.error(err);
      alert("Status update failed");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">
        Your Internship Postings
      </h2>

      {internships.length === 0 && (
        <p>No internships posted yet.</p>
      )}

      {internships.map((internship) => (
        <div
          key={internship._id}
          className="border p-5 rounded shadow mb-6"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-semibold">
                {internship.title}
              </h3>

              <p className="text-sm text-gray-600 mt-1">
                Mode: {internship.mode}
              </p>

              <p className="text-sm">
                Stipend: ₹{internship.stipend || 0}
              </p>

              <p className="text-sm">
                Deadline:{" "}
                {new Date(
                  internship.applicationDeadline
                ).toLocaleDateString()}
              </p>

              <p className="text-sm">
                Positions: {internship.positions}
              </p>

              <p className="text-sm font-medium mt-1">
                Status: {internship.status}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {/* Status Dropdown */}
              <select
                value={internship.status}
                disabled={internship.status === "completed"}
                onChange={(e) =>
                  handleStatusChange(
                    internship._id,
                    e.target.value
                  )
                }
                className="border p-2 rounded"
              >
                <option value="draft">Draft</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
                <option value="completed">Completed</option>
              </select>

              {/* Navigate to Hiring Page */}
              <button
                onClick={() =>
                  navigate(
                    `/company/internship/${internship._id}`
                  )
                }
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                View Applicants
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ViewPostings;
