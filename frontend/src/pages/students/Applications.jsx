import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../utils/constants";
import StudentNavBar from "../../components/navbars/StudentNavBar";

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchApplications = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/application/student/applied`,
        { withCredentials: true },
      );
      setApplications(res.data?.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const getStatusBadge = (status) => {
    let cls = "bg-[#f9f9f9] border-[#e5e5e5] text-[#333]";

    if (status === "accepted" || status === "offer_accepted") {
      cls = "bg-[#fff] border-[#008000] text-[#008000]";
    } else if (status === "shortlisted" || status === "interview") {
      cls = "bg-[#111] text-[#fff] border-[#111]";
    } else if (status === "rejected") {
      cls = "bg-[#fff] border-[#cc0000] text-[#cc0000]";
    }

    return (
      <span
        className={`inline-block px-3 py-1.5 rounded-[10px] text-[10px] font-black uppercase tracking-widest border ${cls}`}
      >
        {status.replace("_", " ")}
      </span>
    );
  };

  const renderStipend = (internship) => {
    if (!internship) return "—";
    if (internship.stipendType === "paid") {
      return `INR ${internship.stipendAmount}`;
    }
    if (internship.stipendType === "unpaid") {
      return "UNPAID";
    }
    return "N/A";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center font-sans">
        <p className="text-[14px] font-bold text-[#333] animate-pulse m-0 uppercase tracking-widest">
          Syncing Applications...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center p-4 font-sans text-[#333]">
        <div className="w-full max-w-md px-6 py-4 text-[12px] font-bold text-[#cc0000] border border-[#cc0000] rounded-[14px] uppercase tracking-widest text-center">
          {error}
        </div>
      </div>
    );
  }

  return (
    <>
      <StudentNavBar />
      <div className="min-h-screen bg-[#f9f9f9] text-[#333] font-sans pb-10">
        <main className="max-w-7xl mx-auto w-full px-4 md:px-6 py-6 flex flex-col gap-6">
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#e5e5e5] pb-4">
            <div className="flex flex-col gap-1">
              <h1 className="text-[23px] font-black text-[#333] m-0 tracking-tight leading-tight">
                Internship Applications
              </h1>
              <p className="text-[13px] font-bold text-[#333] opacity-60 m-0 uppercase tracking-widest">
                Personal Recruitment Tracking
              </p>
            </div>
            <div className="text-[11px] font-black text-[#111] bg-[#fff] border border-[#e5e5e5] px-3 py-1.5 rounded-[10px] uppercase tracking-widest">
              Count: {applications.length}
            </div>
          </header>

          {applications.length === 0 ? (
            <div className="bg-[#fff] border-2 border-dashed border-[#e5e5e5] rounded-[20px] p-20 text-center">
              <p className="text-[13px] font-bold text-[#333] opacity-40 m-0 uppercase tracking-widest">
                No active applications found
              </p>
            </div>
          ) : (
            <div className="bg-[#fff] border border-[#e5e5e5] rounded-[20px] shadow-sm overflow-hidden box-border">
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead className="bg-[#f9f9f9] border-b border-[#e5e5e5]">
                    <tr>
                      <th className="px-5 py-4 text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                        Opportunity
                      </th>
                      <th className="px-5 py-4 text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                        Organization
                      </th>
                      <th className="px-5 py-4 text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                        Type
                      </th>
                      <th className="px-5 py-4 text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                        Stipend
                      </th>
                      <th className="px-5 py-4 text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                        Submitted
                      </th>
                      <th className="px-5 py-4 text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                        Auth Code
                      </th>
                      <th className="px-5 py-4 text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest text-right">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f9f9f9]">
                    {applications.map((app) => (
                      <tr
                        key={app._id}
                        className="hover:bg-[#fcfcfc] transition-colors"
                      >
                        <td className="px-5 py-4">
                          <div className="text-[14px] font-black text-[#111]">
                            {app?.internship?.title || "Unknown"}
                          </div>
                          <div className="text-[10px] font-bold opacity-40 uppercase mt-0.5">
                            {app?.internship?.location || "Remote"}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="text-[13px] font-bold">
                            {app?.internship?.company?.companyName || "N/A"}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span className="text-[11px] font-bold uppercase tracking-tighter opacity-70">
                            {app?.internship?.mode || "N/A"}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span className="text-[13px] font-mono font-bold text-[#111]">
                            {renderStipend(app?.internship)}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="text-[12px] font-bold opacity-60">
                            {new Date(app.createdAt).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="text-[11px] font-mono text-[#333] opacity-40 uppercase truncate max-w-[120px]">
                            {app?.mentor?.email || "NOT_ASSIGNED"}
                          </div>
                        </td>

                        <td className="px-5 py-4 text-right">
                          {getStatusBadge(app.status)}
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
    </>
  );
};

export default Applications;
