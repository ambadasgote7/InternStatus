import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../utils/constants";
import AdminNavBar from "../../components/navbars/AdminNavBar";

const FacultyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

const fetchPendingRequests = async () => {
  try {
    setLoading(true);

    const res = await axios.get(
      `${BASE_URL}/api/admin/pending-faculty-requests`,
      { withCredentials: true }
    );

    setRequests(res.data.pendingRequests || []);
  } catch (err) {
    setError(
      err.response?.data?.message || "Failed to fetch faculty requests"
    );
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const approveRequest = async (id) => {
    try {
      setActionLoading(id);
      await axios.post(
        `${BASE_URL}/api/admin/faculty/${id}/approve`,
        {},
        { withCredentials: true }
      );

      // remove approved request from list
      setRequests((prev) => prev.filter((req) => req._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Approval failed");
    } finally {
      setActionLoading(null);
    }
  };

  const rejectRequest = async (id) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;

    try {
      setActionLoading(id);
      await axios.post(
        `${BASE_URL}/api/admin/faculty/${id}/reject`,
        { reason },
        { withCredentials: true }
      );

      // remove rejected request from list
      setRequests((prev) => prev.filter((req) => req._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Rejection failed");
    } finally {
      setActionLoading(null);
    }
  };

 return (
  <>
    <AdminNavBar />

    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-slate-800">
            Pending Faculty Requests
          </h2>
          <p className="text-slate-500 mt-1">
            Review and approve faculty verification requests
          </p>
        </div>

        {/* States */}
        {loading && (
          <div className="bg-white rounded-xl shadow p-6 text-center text-slate-600">
            Loading faculty requests…
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
            {error}
          </div>
        )}

        {!loading && !error && requests.length === 0 && (
          <div className="bg-white rounded-xl shadow p-10 text-center">
            <p className="text-slate-500 text-lg">
              No pending faculty requests 🎉
            </p>
          </div>
        )}

        {/* Table */}
        {!loading && !error && requests.length > 0 && (
          <div className="bg-white rounded-xl shadow border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-200 sticky top-0 z-10">
                  <tr className="text-slate-700 font-semibold">
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">College</th>
                    <th className="px-4 py-3">Document</th>
                    <th className="px-4 py-3">Requested At</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {requests.map((req) => (
                    <tr
                      key={req._id}
                      className="border-t hover:bg-slate-50 transition"
                    >
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {req.requesterName}
                      </td>

                      <td className="px-4 py-3 text-slate-600">
                        {req.requesterEmail}
                      </td>

                      <td className="px-4 py-3 text-slate-600">
                        {req.collegeName}
                      </td>

                      <td className="px-4 py-3">
                        <a
                          href={req.verificationDocumentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 font-medium hover:underline"
                        >
                          View Document
                        </a>
                      </td>

                      <td className="px-4 py-3 text-slate-500">
                        {new Date(req.createdAt).toLocaleString()}
                      </td>

                      <td className="px-4 py-3 text-center space-x-2">
                        <button
                          disabled={actionLoading === req._id}
                          onClick={() => approveRequest(req._id)}
                          className="px-4 py-1.5 rounded-md bg-green-600 text-white font-medium
                                     hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Approve
                        </button>

                        <button
                          disabled={actionLoading === req._id}
                          onClick={() => rejectRequest(req._id)}
                          className="px-4 py-1.5 rounded-md bg-red-600 text-white font-medium
                                     hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  </>
);

};

export default FacultyRequests;
