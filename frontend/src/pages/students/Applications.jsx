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
    let cls = "bg-[#F5F6FA] border-transparent text-[#2D3436]";

    if (status === "accepted" || status === "offer_accepted") {
      cls = "bg-emerald-50 border-emerald-200 text-emerald-600 shadow-sm";
    } else if (status === "shortlisted" || status === "interview") {
      cls = "bg-[#2D3436] text-[#FFFFFF] border-[#2D3436] shadow-sm";
    } else if (status === "rejected") {
      cls = "bg-rose-50 border-rose-200 text-rose-600 shadow-sm";
    }

    return (
      <span
        className={`inline-flex items-center px-3 py-1.5 rounded-[12px] text-[10px] font-black uppercase tracking-widest border transition-all duration-300 ${cls}`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full mr-2 ${
            status === "accepted" || status === "offer_accepted"
              ? "bg-emerald-500"
              : status === "shortlisted" || status === "interview"
                ? "bg-[#FFFFFF]"
                : status === "rejected"
                  ? "bg-rose-500"
                  : "bg-[#2D3436] opacity-40"
          }`}
        ></span>
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
      <div className="min-h-screen bg-[#FFFFFF] flex items-center justify-center font-['Nunito'] transition-all duration-300">
        <div className="flex flex-col items-center gap-4 animate-in fade-in duration-700">
          <div className="w-12 h-12 border-4 border-[#F5F6FA] border-t-[#6C5CE7] rounded-full animate-spin"></div>
          <p className="text-[12px] font-black text-[#6C5CE7] animate-pulse m-0 uppercase tracking-widest">
            Syncing Applications...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] flex items-center justify-center p-4 font-['Nunito'] text-[#2D3436] transition-all duration-300">
        <div className="w-full max-w-md px-6 py-5 text-[12px] font-black text-rose-600 bg-rose-50 border border-rose-200 rounded-[16px] uppercase tracking-widest text-center shadow-sm animate-in fade-in zoom-in duration-300">
          {error}
        </div>
      </div>
    );
  }

  return (
    <>
      <StudentNavBar />
      <div className="min-h-screen bg-[#FFFFFF] text-[#2D3436] font-['Nunito'] pb-12 transition-colors duration-500 selection:bg-[#6C5CE7]/20 selection:text-[#6C5CE7]">
        <main className="max-w-7xl mx-auto w-full px-4 md:px-8 py-8 flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#F5F6FA] pb-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl md:text-5xl font-black text-[#2D3436] m-0 tracking-tighter leading-tight uppercase">
                Internship Applications
              </h1>
              <p className="text-[13px] font-black text-[#6C5CE7] opacity-80 m-0 uppercase tracking-[0.2em]">
                Personal Recruitment Tracking
              </p>
            </div>
            <div className="text-[11px] font-black text-[#2D3436] bg-[#F5F6FA] border border-transparent px-5 py-3 rounded-[14px] uppercase tracking-widest shadow-sm">
              Count:{" "}
              <span className="text-[#6C5CE7] ml-1">{applications.length}</span>
            </div>
          </header>

          {applications.length === 0 ? (
            <div className="bg-[#F5F6FA] border-2 border-dashed border-[#6C5CE7]/20 rounded-[32px] p-20 text-center animate-in zoom-in duration-500">
              <p className="text-[14px] font-black text-[#2D3436] opacity-40 m-0 uppercase tracking-[0.15em]">
                No active applications found
              </p>
            </div>
          ) : (
            <div className="bg-[#FFFFFF] border border-[#F5F6FA] rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden box-border hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] transition-all duration-500">
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead className="bg-[#F5F6FA] bg-opacity-50 border-b border-[#F5F6FA]">
                    <tr>
                      <th className="px-8 py-6 text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-[0.15em]">
                        Opportunity
                      </th>
                      <th className="px-8 py-6 text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-[0.15em]">
                        Organization
                      </th>
                      <th className="px-8 py-6 text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-[0.15em]">
                        Type
                      </th>
                      <th className="px-8 py-6 text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-[0.15em]">
                        Stipend
                      </th>
                      <th className="px-8 py-6 text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-[0.15em]">
                        Submitted
                      </th>
                      <th className="px-8 py-6 text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-[0.15em]">
                        Auth Code
                      </th>
                      <th className="px-8 py-6 text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-[0.15em] text-right">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F5F6FA]">
                    {applications.map((app) => (
                      <tr
                        key={app._id}
                        className="hover:bg-[#F5F6FA]/40 transition-colors duration-300 group"
                      >
                        <td className="px-8 py-5">
                          <div className="text-[15px] font-black text-[#2D3436] group-hover:text-[#6C5CE7] transition-colors duration-300">
                            {app?.internship?.title || "Unknown"}
                          </div>
                          <div className="text-[10px] font-black text-[#2D3436] opacity-40 uppercase tracking-widest mt-1">
                            {app?.internship?.location || "Remote"}
                          </div>
                        </td>

                        <td className="px-8 py-5">
                          <div className="text-[14px] font-bold text-[#2D3436] opacity-80">
                            {app?.internship?.company?.companyName || "N/A"}
                          </div>
                        </td>

                        <td className="px-8 py-5">
                          <span className="text-[11px] font-black text-[#2D3436] bg-[#F5F6FA] px-2.5 py-1 rounded-md uppercase tracking-wider group-hover:bg-[#FFFFFF] transition-colors">
                            {app?.internship?.mode || "N/A"}
                          </span>
                        </td>

                        <td className="px-8 py-5">
                          <span className="text-[13px] font-mono font-bold text-[#2D3436]">
                            {renderStipend(app?.internship)}
                          </span>
                        </td>

                        <td className="px-8 py-5">
                          <div className="text-[13px] font-bold text-[#2D3436] opacity-60">
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

                        <td className="px-8 py-5">
                          <div className="text-[12px] font-mono font-bold text-[#2D3436] opacity-40 uppercase truncate max-w-[120px] bg-[#F5F6FA] px-2 py-1 rounded-md group-hover:bg-[#FFFFFF] transition-colors inline-block">
                            {app?.mentor?.email || "NOT_ASSIGNED"}
                          </div>
                        </td>

                        <td className="px-8 py-5 text-right">
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
