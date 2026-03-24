import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../utils/constants";
import AdminNavBar from "../../components/navbars/AdminNavBar";

const VerifiedFacultyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchVerifiedRequests = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${BASE_URL}/api/admin/verified-faculty-requests`,
        { withCredentials: true },
      );

      setRequests(res.data.verifiedRequests || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to fetch verified faculty requests",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifiedRequests();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#0B0F19] font-sans flex flex-col box-border selection:bg-fuchsia-500/30 selection:text-fuchsia-200">
        <AdminNavBar />
        <main className="w-full flex-grow flex flex-col items-center justify-center px-4">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-white/10 border-t-fuchsia-500 rounded-full animate-spin"></div>
            <p className="text-fuchsia-400 font-bold tracking-widest uppercase text-[10px] animate-pulse m-0">
              Loading Verified Faculty
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full bg-[#0B0F19] font-sans flex flex-col box-border selection:bg-fuchsia-500/30 selection:text-fuchsia-200">
        <AdminNavBar />
        <main className="w-full max-w-7xl mx-auto flex-grow px-4 md:px-8 py-10 flex items-center justify-center">
          <div className="px-6 py-4 text-[11px] font-bold text-red-300 bg-red-500/10 border border-red-500/30 rounded-xl uppercase tracking-widest">
            {error}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#0B0F19] font-sans flex flex-col box-border text-white selection:bg-fuchsia-500/30 selection:text-fuchsia-200 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-fuchsia-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <AdminNavBar />

        <main className="w-full max-w-7xl mx-auto flex-grow px-4 md:px-8 py-10 md:py-16 max-w-[100vw]">
          <div className="mb-10 border-b border-white/10 pb-6">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 mb-3 mt-0">
              Verified Faculty
            </h2>
            <p className="text-white/40 font-medium text-sm md:text-base m-0 tracking-wide">
              List of approved and verified faculty members
            </p>
          </div>

          {requests.length === 0 ? (
            <div className="bg-[#0B0F19]/50 border border-white/10 rounded-3xl p-16 text-center shadow-inner">
              <p className="text-white/40 m-0 text-base font-medium">
                No verified faculty found
              </p>
            </div>
          ) : (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] overflow-hidden box-border transition-all duration-300 hover:border-white/20 w-full max-w-full">
              <div className="overflow-x-auto bg-[#0B0F19]/30 shadow-inner w-full no-scrollbar">
                <table className="w-full text-left border-collapse whitespace-nowrap min-w-max">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="px-6 py-5 text-[10px] font-bold text-violet-400 uppercase tracking-widest">
                        Name
                      </th>
                      <th className="px-6 py-5 text-[10px] font-bold text-violet-400 uppercase tracking-widest">
                        Email
                      </th>
                      <th className="px-6 py-5 text-[10px] font-bold text-violet-400 uppercase tracking-widest">
                        College
                      </th>
                      <th className="px-6 py-5 text-[10px] font-bold text-violet-400 uppercase tracking-widest">
                        Document
                      </th>
                      <th className="px-6 py-5 text-[10px] font-bold text-violet-400 uppercase tracking-widest">
                        Verified At
                      </th>
                      <th className="px-6 py-5 text-[10px] font-bold text-violet-400 uppercase tracking-widest">
                        Verified By
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/5">
                    {requests.map((req) => (
                      <tr
                        key={req._id}
                        className="hover:bg-white/5 transition-colors duration-300 group"
                      >
                        <td className="px-6 py-5 align-middle font-bold text-white/90 text-sm group-hover:text-fuchsia-300 transition-colors">
                          {req.requesterName}
                        </td>

                        <td className="px-6 py-5 align-middle font-medium text-white/50 text-xs tracking-wide">
                          {req.requesterEmail}
                        </td>

                        <td className="px-6 py-5 align-middle font-bold text-white/80 text-sm">
                          {req.college?.name}
                        </td>

                        <td className="px-6 py-5 align-middle">
                          {req.verificationDocumentUrl ? (
                            <a
                              href={req.verificationDocumentUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-block px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/80 font-bold text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all no-underline cursor-pointer outline-none hover:-translate-y-0.5"
                            >
                              View Doc
                            </a>
                          ) : (
                            <span className="inline-block px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-transparent border border-white/10 text-white/40">
                              Not provided
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-5 align-middle text-white/50 font-medium text-xs tracking-wide">
                          {req.verifiedAt
                            ? new Date(req.verifiedAt).toLocaleDateString(
                                undefined,
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                },
                              )
                            : "—"}
                        </td>

                        <td className="px-6 py-5 align-middle">
                          <span className="inline-block px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-violet-500/20 border border-violet-500/30 text-violet-300">
                            {req.verifiedBy?.name || "Admin"}
                          </span>
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
    </div>
  );
};

export default VerifiedFacultyRequests;
