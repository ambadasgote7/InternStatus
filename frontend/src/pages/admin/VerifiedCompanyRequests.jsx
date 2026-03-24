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
        { withCredentials: true },
      );
      setRequests(res.data.verifiedRequests || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to fetch verified company requests",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifiedCompanyRequests();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#f9f9f9] flex flex-col font-sans">
        <AdminNavBar />
        <main className="flex-grow flex items-center justify-center">
          <p className="text-[14px] font-bold text-[#333] animate-pulse m-0">
            Loading Verified Companies...
          </p>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full bg-[#f9f9f9] flex flex-col font-sans">
        <AdminNavBar />
        <main className="flex-grow flex items-center justify-center p-4">
          <div className="px-4 py-3 text-[13px] font-bold text-[#cc0000] bg-[#fff] border border-[#cc0000] rounded-[14px]">
            {error}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#f9f9f9] text-[#333] flex flex-col font-sans pb-10">
      <AdminNavBar />

      <main className="max-w-7xl mx-auto w-full px-4 md:px-6 py-6 flex flex-col gap-5">
        <div className="border-b border-[#e5e5e5] pb-4">
          <h2 className="text-[23px] font-black text-[#333] m-0 tracking-tight leading-tight">
            Verified Companies
          </h2>
          <p className="text-[13px] font-bold text-[#333] opacity-60 m-0 mt-1">
            List of approved and verified company accounts
          </p>
        </div>

        {requests.length === 0 ? (
          <div className="bg-[#fff] border-2 border-dashed border-[#e5e5e5] rounded-[20px] p-10 text-center">
            <p className="text-[13px] font-bold text-[#333] opacity-60 m-0">
              No verified companies found
            </p>
          </div>
        ) : (
          <div className="bg-[#fff] border border-[#e5e5e5] rounded-[20px] shadow-sm overflow-hidden box-border transition-all">
            <div className="overflow-x-auto no-scrollbar w-full">
              <table className="w-full text-left border-collapse whitespace-nowrap min-w-max">
                <thead className="bg-[#f9f9f9] border-b border-[#e5e5e5]">
                  <tr>
                    <th className="px-5 py-3 text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                      Requester
                    </th>
                    <th className="px-5 py-3 text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                      Company
                    </th>
                    <th className="px-5 py-3 text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest text-center">
                      Document
                    </th>
                    <th className="px-5 py-3 text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                      Verified At
                    </th>
                    <th className="px-5 py-3 text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest text-right">
                      Verified By
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#e5e5e5]">
                  {requests.map((req) => (
                    <tr
                      key={req._id}
                      className="hover:bg-[#f9f9f9] transition-colors duration-200"
                    >
                      <td className="px-5 py-3">
                        <div className="font-bold text-[#333] text-[13px] m-0">
                          {req.requesterName}
                        </div>
                        <div className="text-[#333] opacity-50 font-bold text-[11px] m-0">
                          {req.requesterEmail}
                        </div>
                      </td>

                      <td className="px-5 py-3 font-bold text-[#333] text-[13px]">
                        {req.companyName}
                      </td>

                      <td className="px-5 py-3 text-center">
                        {req.verificationDocumentUrl ? (
                          <a
                            href={req.verificationDocumentUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-block px-3 py-1.5 rounded-[12px] bg-[#f9f9f9] border border-[#e5e5e5] text-[#333] font-bold text-[11px] uppercase tracking-widest hover:border-[#333] transition-colors no-underline"
                          >
                            View
                          </a>
                        ) : (
                          <span className="text-[11px] font-bold uppercase text-[#333] opacity-30">
                            —
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-3 text-[#333] opacity-70 font-bold text-[13px]">
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

                      <td className="px-5 py-3 text-right">
                        <span className="inline-block px-2.5 py-1 rounded-[14px] bg-[#111] text-[#fff] text-[10px] font-bold uppercase tracking-widest">
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
  );
};

export default VerifiedCompanyRequests;
