import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../utils/constants";
import AdminNavBar from "../../components/navbars/AdminNavBar";

const VerifiedCompanyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchVerifiedCompanyRequests = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${BASE_URL}/api/admin/verified-company-requests`,
        { withCredentials: true }
      );

      setRequests(res.data.verifiedRequests || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to fetch verified company requests"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifiedCompanyRequests();
  }, []);

  return (
    <>
      <AdminNavBar />

      <div className="min-h-screen bg-slate-100 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-slate-800">
              Verified Companies
            </h2>
            <p className="text-slate-500 mt-1">
              List of approved and verified companies
            </p>
          </div>

          {/* Loading */}
          {loading && (
            <div className="bg-white rounded-xl shadow p-6 text-center text-slate-600">
              Loading verified companies…
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
              {error}
            </div>
          )}

          {/* Empty */}
          {!loading && !error && requests.length === 0 && (
            <div className="bg-white rounded-xl shadow p-10 text-center">
              <p className="text-slate-500 text-lg">
                No verified companies found
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
                      <th className="px-4 py-3">Requester</th>
                      <th className="px-4 py-3">Company</th>
                      <th className="px-4 py-3">Document</th>
                      <th className="px-4 py-3">Verified At</th>
                      <th className="px-4 py-3">Verified By</th>
                    </tr>
                  </thead>

                  <tbody>
                    {requests.map((req) => (
                      <tr
                        key={req._id}
                        className="border-t hover:bg-slate-50 transition align-top"
                      >
                        {/* Requester */}
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-800">
                            {req.requesterName}
                          </div>
                          <div className="text-slate-500 text-xs">
                            {req.requesterEmail}
                          </div>
                        </td>

                        {/* Company */}
                        <td className="px-4 py-3 text-slate-600">
                          {req.companyName}
                        </td>

                        {/* Document */}
                        <td className="px-4 py-3">
                          {req.verificationDocumentUrl ? (
                            <a
                              href={req.verificationDocumentUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 font-medium hover:underline"
                            >
                              View Document
                            </a>
                          ) : (
                            <span className="italic text-slate-400">
                              Not provided
                            </span>
                          )}
                        </td>

                        {/* Verified At */}
                        <td className="px-4 py-3 text-slate-500">
                          {req.verifiedAt
                            ? new Date(req.verifiedAt).toLocaleString()
                            : "—"}
                        </td>

                        {/* Verified By */}
                        <td className="px-4 py-3 text-slate-600">
                          {req.verifiedBy?.name || "Admin"}
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

export default VerifiedCompanyRequests;
