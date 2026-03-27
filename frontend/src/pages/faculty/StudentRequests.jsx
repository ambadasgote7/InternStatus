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
      <div className="min-h-screen bg-[#FFFFFF] flex items-center justify-center font-['Nunito'] transition-all duration-300">
        <div className="flex flex-col items-center gap-4 animate-in fade-in duration-700">
          <div className="w-12 h-12 border-4 border-[#F5F6FA] border-t-[#6C5CE7] rounded-full animate-spin"></div>
          <p className="text-[12px] font-black text-[#6C5CE7] animate-pulse m-0 uppercase tracking-widest">
            Scanning Institutional Uplinks...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFFFF] p-4 font-['Nunito'] text-[#2D3436] transition-all duration-300">
        <div className="w-full max-w-md px-6 py-5 text-[12px] font-black text-rose-600 bg-rose-50 border border-rose-200 rounded-[16px] uppercase tracking-widest text-center shadow-sm animate-in fade-in zoom-in duration-300">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#2D3436] font-['Nunito'] pb-12 transition-colors duration-500 selection:bg-[#6C5CE7]/20 selection:text-[#6C5CE7]">
      <main className="max-w-7xl mx-auto w-full px-4 md:px-8 py-8 flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#F5F6FA] pb-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl md:text-5xl font-black text-[#2D3436] m-0 tracking-tighter leading-tight uppercase">
              Pending Requests
            </h1>
            <p className="text-[13px] font-black text-[#6C5CE7] opacity-80 m-0 uppercase tracking-[0.2em]">
              Verification Terminal
            </p>
          </div>
        </header>

        {students.length === 0 ? (
          <div className="bg-[#F5F6FA] border-2 border-dashed border-[#6C5CE7]/20 rounded-[32px] p-20 text-center animate-in zoom-in duration-500">
            <p className="text-[14px] font-black text-[#2D3436] opacity-40 m-0 uppercase tracking-[0.15em]">
              No pending student uplinks detected
            </p>
          </div>
        ) : (
          <div className="bg-[#FFFFFF] border border-[#F5F6FA] rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden box-border hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] transition-all duration-500">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead className="bg-[#F5F6FA] bg-opacity-50 border-b border-[#F5F6FA]">
                  <tr>
                    <th className="px-8 py-6 text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-[0.15em]">
                      Candidate
                    </th>
                    <th className="px-8 py-6 text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-[0.15em]">
                      PRN Matrix
                    </th>
                    <th className="px-8 py-6 text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-[0.15em]">
                      Course / Level
                    </th>
                    <th className="px-8 py-6 text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-[0.15em] text-center">
                      Dossier
                    </th>
                    <th className="px-8 py-6 text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-[0.15em] text-right">
                      Verification
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5F6FA]">
                  {students.map((s) => (
                    <tr
                      key={s._id}
                      className="hover:bg-[#F5F6FA]/50 transition-colors duration-300 group"
                    >
                      <td className="px-8 py-5">
                        <div className="text-[15px] font-black text-[#2D3436] group-hover:text-[#6C5CE7] transition-colors">
                          {s.fullName}
                        </div>
                        <div className="text-[10px] font-black text-[#2D3436] opacity-40 uppercase tracking-widest mt-1">
                          {new Date(s.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-[13px] font-mono font-bold text-[#2D3436] opacity-60 bg-[#F5F6FA] px-2 py-1 rounded-md group-hover:bg-[#FFFFFF] transition-colors">
                          {s.prn}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="text-[14px] font-bold text-[#2D3436] opacity-80">
                          {s.course}
                        </div>
                        <div className="inline-block mt-1.5 text-[10px] font-black text-[#6C5CE7] bg-[#F5F6FA] px-2 py-1 rounded-md uppercase tracking-widest group-hover:bg-[#FFFFFF] transition-colors">
                          Year {s.year}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex justify-center items-center gap-3">
                          {s.collegeIdImageUrl && (
                            <a
                              href={s.collegeIdImageUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-4 py-2 rounded-[12px] bg-[#FFFFFF] border border-[#F5F6FA] text-[#2D3436] font-black text-[10px] uppercase tracking-widest hover:border-[#6C5CE7] hover:text-[#6C5CE7] hover:shadow-sm transition-all duration-300 no-underline outline-none transform hover:-translate-y-0.5"
                            >
                              ID Card
                            </a>
                          )}
                          {s.resumeFileUrl && (
                            <a
                              href={s.resumeFileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-4 py-2 rounded-[12px] bg-[#6C5CE7] text-[#FFFFFF] border border-transparent font-black text-[10px] uppercase tracking-widest hover:bg-opacity-90 hover:shadow-md transition-all duration-300 no-underline outline-none transform hover:-translate-y-0.5"
                            >
                              Resume
                            </a>
                          )}
                          {!s.collegeIdImageUrl && !s.resumeFileUrl && (
                            <span className="text-[11px] font-bold text-[#2D3436] opacity-30 italic bg-[#F5F6FA] px-3 py-1.5 rounded-lg">
                              No Files
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-3">
                          <button
                            disabled={actionLoading === s._id}
                            onClick={() =>
                              updateRequestStatus(s._id, "rejected")
                            }
                            className="px-6 py-2.5 text-[11px] font-black text-rose-600 bg-rose-50 border border-rose-200 rounded-[12px] hover:bg-rose-100 hover:shadow-sm transition-all duration-300 disabled:opacity-50 disabled:transform-none uppercase tracking-widest cursor-pointer outline-none transform hover:-translate-y-0.5"
                          >
                            Reject
                          </button>
                          <button
                            disabled={actionLoading === s._id}
                            onClick={() =>
                              updateRequestStatus(s._id, "approved")
                            }
                            className="px-6 py-2.5 text-[11px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-[12px] hover:bg-emerald-100 hover:shadow-sm transition-all duration-300 disabled:opacity-50 disabled:transform-none uppercase tracking-widest cursor-pointer outline-none transform hover:-translate-y-0.5 flex items-center justify-center min-w-[100px]"
                          >
                            {actionLoading === s._id ? (
                              <div className="w-3 h-3 border-2 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin"></div>
                            ) : (
                              "Approve"
                            )}
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
