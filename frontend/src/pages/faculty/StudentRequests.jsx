import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../utils/constants";

const StudentRequests = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  const fetchRequests = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/faculty/pending-student-requests`,
        { withCredentials: true },
      );
      setStudents(res.data.pendingRequests || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load student requests",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const updateRequestStatus = async (id, status) => {
    try {
      setActionLoading(id);
      await axios.post(
        `${BASE_URL}/api/faculty/student/${id}/${status}`,
        {},
        { withCredentials: true },
      );
      setStudents((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center font-sans">
        <p className="text-[14px] font-bold text-[#333] animate-pulse m-0">
          Scanning Institutional Uplinks...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9f9f9] p-4 font-sans text-[#333]">
        <div className="w-full max-w-md px-6 py-4 text-[12px] font-bold text-[#cc0000] border border-[#cc0000] rounded-[14px] uppercase tracking-widest text-center">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#333] font-sans pb-10">
      <main className="max-w-7xl mx-auto w-full px-4 md:px-6 py-6 flex flex-col gap-6">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#e5e5e5] pb-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-[23px] font-black text-[#333] m-0 tracking-tight leading-tight">
              Pending Requests
            </h1>
            <p className="text-[13px] font-bold text-[#333] opacity-60 m-0 uppercase tracking-widest">
              Verification Terminal
            </p>
          </div>
        </header>

        {students.length === 0 ? (
          <div className="bg-[#fff] border-2 border-dashed border-[#e5e5e5] rounded-[20px] p-20 text-center">
            <p className="text-[13px] font-bold text-[#333] opacity-40 m-0 uppercase tracking-widest">
              No pending student uplinks detected
            </p>
          </div>
        ) : (
          <div className="bg-[#fff] border border-[#e5e5e5] rounded-[20px] shadow-sm overflow-hidden box-border">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead className="bg-[#f9f9f9] border-b border-[#e5e5e5]">
                  <tr>
                    <th className="px-5 py-3 text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                      Candidate
                    </th>
                    <th className="px-5 py-3 text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                      PRN Matrix
                    </th>
                    <th className="px-5 py-3 text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                      Course / Level
                    </th>
                    <th className="px-5 py-3 text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest text-center">
                      Dossier
                    </th>
                    <th className="px-5 py-3 text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest text-right">
                      Verification
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e5e5]">
                  {students.map((s) => (
                    <tr
                      key={s._id}
                      className="hover:bg-[#fcfcfc] transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="text-[14px] font-bold text-[#333]">
                          {s.fullName}
                        </div>
                        <div className="text-[10px] font-bold opacity-40 uppercase mt-0.5">
                          {new Date(s.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-[12px] font-mono text-[#333] opacity-70">
                          {s.prn}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-[13px] font-bold text-[#333]">
                          {s.course}
                        </div>
                        <div className="text-[10px] font-black text-[#111] uppercase tracking-tighter mt-1">
                          Year {s.year}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-center items-center gap-2">
                          {s.collegeIdImageUrl && (
                            <a
                              href={s.collegeIdImageUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 rounded-[10px] bg-[#f9f9f9] border border-[#e5e5e5] text-[#333] font-bold text-[10px] uppercase tracking-widest hover:border-[#333] transition-colors no-underline"
                            >
                              ID Card
                            </a>
                          )}
                          {s.resumeFileUrl && (
                            <a
                              href={s.resumeFileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 rounded-[10px] bg-[#111] text-[#fff] font-bold text-[10px] uppercase tracking-widest hover:opacity-80 transition-opacity no-underline"
                            >
                              Resume
                            </a>
                          )}
                          {!s.collegeIdImageUrl && !s.resumeFileUrl && (
                            <span className="text-[11px] font-bold opacity-30 italic">
                              No Files
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            disabled={actionLoading === s._id}
                            onClick={() =>
                              updateRequestStatus(s._id, "approved")
                            }
                            className="px-4 py-2 text-[11px] font-bold text-[#fff] bg-[#111] border-none rounded-[10px] hover:opacity-80 transition-opacity disabled:opacity-30 uppercase tracking-widest cursor-pointer"
                          >
                            {actionLoading === s._id ? "..." : "Approve"}
                          </button>
                          <button
                            disabled={actionLoading === s._id}
                            onClick={() =>
                              updateRequestStatus(s._id, "rejected")
                            }
                            className="px-4 py-2 text-[11px] font-bold text-[#cc0000] bg-[#fff] border border-[#cc0000] rounded-[10px] hover:bg-[#cc0000] hover:text-[#fff] transition-colors disabled:opacity-30 uppercase tracking-widest cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentRequests;
