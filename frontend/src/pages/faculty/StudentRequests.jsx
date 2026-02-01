import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../utils/constants";
import {
  FileText,
  Download,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";

const StudentRequests = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  /* ================= FETCH ================= */
  const fetchRequests = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/faculty/pending-student-requests`,
        { withCredentials: true }
      );
      setStudents(res.data.pendingRequests || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load student requests"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  /* ================= ACTION ================= */
  const updateRequestStatus = async (id, status) => {
    try {
      setActionLoading(id);

      await axios.post(
        `${BASE_URL}/api/faculty/student/${id}/${status}`,
        {},
        { withCredentials: true }
      );

      // remove row after action
      setStudents((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-slate-600" />
      </div>
    );
  }

  /* ================= ERROR ================= */
  if (error) {
    return (
      <div className="flex items-center gap-2 p-4 bg-rose-50 text-rose-700 rounded-xl">
        <AlertCircle />
        {error}
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        Pending Student Requests
      </h1>

      {students.length === 0 ? (
        <p className="text-slate-500">No pending requests</p>
      ) : (
        <div className="overflow-x-auto border rounded-xl shadow">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">PRN</th>
                <th className="px-4 py-3 text-left">College</th>
                <th className="px-4 py-3 text-left">Course</th>
                <th className="px-4 py-3 text-left">Year</th>
                <th className="px-4 py-3 text-left">Documents</th>
                <th className="px-4 py-3 text-left">Submitted</th>
                <th className="px-4 py-3 text-left">Action</th>
              </tr>
            </thead>

            <tbody>
              {students.map((s) => (
                <tr key={s._id} className="border-t">
                  <td className="px-4 py-3 font-medium">{s.fullName}</td>
                  <td className="px-4 py-3">{s.prn}</td>
                  <td className="px-4 py-3">{s.college?.name || "—"}</td>
                  <td className="px-4 py-3">{s.course}</td>
                  <td className="px-4 py-3">{s.year}</td>

                  {/* DOCUMENTS */}
                  <td className="px-4 py-3 space-y-2">
                    {s.collegeIdImageUrl && (
                      <a
                        href={s.collegeIdImageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 text-indigo-600 hover:underline"
                      >
                        <FileText className="w-4 h-4" />
                        College ID
                      </a>
                    )}
                    {s.resumeFileUrl && (
                      <a
                        href={s.resumeFileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 text-emerald-600 hover:underline"
                      >
                        <Download className="w-4 h-4" />
                        Resume
                      </a>
                    )}
                  </td>

                  <td className="px-4 py-3 text-slate-500">
                    {new Date(s.createdAt).toLocaleDateString()}
                  </td>

                  {/* ACTIONS */}
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <button
                        disabled={actionLoading === s._id}
                        onClick={() =>
                          updateRequestStatus(s._id, "approved")
                        }
                        className="flex items-center gap-1 text-emerald-600 cursor-pointer disabled:opacity-50"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Accept
                      </button>

                      <button
                        disabled={actionLoading === s._id}
                        onClick={() =>
                          updateRequestStatus(s._id, "rejected")
                        }
                        className="flex items-center gap-1 text-rose-600 cursor-pointer disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StudentRequests;
