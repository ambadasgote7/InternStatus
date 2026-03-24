import React, { useEffect, useState } from "react";
import API from "../../api/api";
import { useNavigate } from "react-router-dom";
import StudentNavBar from "../../components/navbars/StudentNavBar";

export default function MyApplications() {
  const [data, setData] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const res = await API.get("/applications/my");
      setData(res.data.data || []);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to load applications");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStatusBadge = (status) => {
    let cls = "bg-[#f9f9f9] border-[#e5e5e5] text-[#333]";

    if (["selected", "offer_accepted", "completed"].includes(status)) {
      cls = "bg-[#fff] border-[#008000] text-[#008000]";
    } else if (["applied", "shortlisted", "ongoing"].includes(status)) {
      cls = "bg-[#111] text-[#fff] border-[#111]";
    } else if (["rejected", "terminated"].includes(status)) {
      cls = "bg-[#fff] border-[#cc0000] text-[#cc0000]";
    }

    return (
      <span
        className={`px-2.5 py-1 rounded-[10px] text-[9px] font-black uppercase tracking-widest border ${cls}`}
      >
        {status.replace("_", " ")}
      </span>
    );
  };

  const actionHandler = async (id, action) => {
    try {
      setLoadingId(id);
      if (action === "withdraw") {
        await API.patch(`/applications/${id}/withdraw`);
      } else {
        await API.patch(`/applications/${id}/offer`, {
          decision: action,
        });
      }
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Action failed");
    } finally {
      setLoadingId(null);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <>
      <StudentNavBar />

      <div className="min-h-screen bg-[#f9f9f9] text-[#333] font-sans pb-10">
        <main className="max-w-4xl mx-auto w-full px-4 md:px-6 py-6 flex flex-col gap-6">
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#e5e5e5] pb-4">
            <div className="flex flex-col gap-1">
              <h1 className="text-[23px] font-black text-[#333] m-0 tracking-tight leading-tight">
                My Applications
              </h1>
              <p className="text-[13px] font-bold text-[#333] opacity-60 m-0 uppercase tracking-widest">
                Submission & Offer Tracking
              </p>
            </div>
          </header>

          {data.length === 0 ? (
            <div className="bg-[#fff] border-2 border-dashed border-[#e5e5e5] rounded-[20px] p-20 text-center">
              <p className="text-[13px] font-bold text-[#333] opacity-40 m-0 uppercase tracking-widest">
                No application history found
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {data.map((app) => {
                const internship = app.internship || {};
                const canWithdraw =
                  app.status === "applied" || app.status === "shortlisted";
                const canAccept = app.status === "selected";
                const waitingStart = app.status === "offer_accepted";
                const isExpanded = expandedId === app._id;
                const canTrack =
                  app.status === "ongoing" || app.status === "completed";

                return (
                  <div
                    key={app._id}
                    className="bg-[#fff] border border-[#e5e5e5] rounded-[20px] shadow-sm overflow-hidden transition-all hover:border-[#333]"
                  >
                    <div className="p-5 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[17px] font-black text-[#333] m-0 leading-tight truncate">
                          {internship.title}
                        </h3>
                        <p className="text-[11px] font-bold text-[#333] opacity-50 uppercase tracking-widest mt-1">
                          {internship.company?.name}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 mt-2 md:mt-0">
                        {getStatusBadge(app.status)}
                        <button
                          onClick={() => toggleExpand(app._id)}
                          className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#333] bg-[#f9f9f9] border border-[#e5e5e5] rounded-[10px] hover:border-[#333] transition-all cursor-pointer"
                        >
                          {isExpanded ? "Less Info" : "More Info"}
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="p-5 md:p-6 pt-0 border-t border-[#f9f9f9] bg-[#fcfcfc] transition-all">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">
                              Work Mode
                            </span>
                            <span className="text-[13px] font-black text-[#111] capitalize">
                              {internship.mode}
                            </span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">
                              Submission Date
                            </span>
                            <span className="text-[13px] font-bold text-[#111]">
                              {new Date(app.appliedAt).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col md:flex-row gap-4 mb-6">
                          {app.resumeSnapshot && (
                            <a
                              href={app.resumeSnapshot}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-block px-5 py-3 bg-[#fff] border border-[#333] text-[#333] text-[11px] font-black uppercase tracking-widest rounded-[12px] hover:bg-[#111] hover:text-[#fff] transition-all no-underline text-center shadow-sm"
                            >
                              View Submitted Resume
                            </a>
                          )}
                          {app.mentor && (
                            <div className="flex flex-col justify-center px-5 py-3 bg-[#fff] border border-[#e5e5e5] rounded-[12px]">
                              <span className="text-[9px] font-bold opacity-40 uppercase tracking-widest">
                                Assigned Supervisor
                              </span>
                              <span className="text-[12px] font-black text-[#111]">
                                {app.mentor?.fullName}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-3 pt-5 border-t border-[#e5e5e5]">
                          {canWithdraw && (
                            <button
                              disabled={loadingId === app._id}
                              onClick={() => actionHandler(app._id, "withdraw")}
                              className="px-5 py-3 text-[11px] font-bold text-[#cc0000] bg-[#fff] border border-[#cc0000] rounded-[12px] hover:bg-[#cc0000] hover:text-[#fff] transition-all disabled:opacity-30 uppercase tracking-widest cursor-pointer"
                            >
                              {loadingId === app._id
                                ? "..."
                                : "Withdraw Submission"}
                            </button>
                          )}

                          {canTrack && (
                            <button
                              onClick={() =>
                                navigate(`/student/intern/${app._id}/track`)
                              }
                              className="px-6 py-3 text-[11px] font-black text-[#fff] bg-[#111] rounded-[12px] border-none hover:opacity-80 transition-opacity uppercase tracking-widest cursor-pointer"
                            >
                              Access Task Console
                            </button>
                          )}

                          {canAccept && (
                            <div className="flex gap-2">
                              <button
                                disabled={loadingId === app._id}
                                onClick={() => actionHandler(app._id, "accept")}
                                className="px-6 py-3 text-[11px] font-black text-[#fff] bg-[#008000] border-none rounded-[12px] hover:opacity-80 transition-opacity disabled:opacity-30 uppercase tracking-widest cursor-pointer"
                              >
                                {loadingId === app._id
                                  ? "..."
                                  : "Confirm Offer"}
                              </button>

                              <button
                                disabled={loadingId === app._id}
                                onClick={() =>
                                  actionHandler(app._id, "decline")
                                }
                                className="px-6 py-3 text-[11px] font-bold text-[#cc0000] bg-[#fff] border border-[#cc0000] rounded-[12px] hover:bg-[#cc0000] hover:text-[#fff] transition-all disabled:opacity-30 uppercase tracking-widest cursor-pointer"
                              >
                                {loadingId === app._id
                                  ? "..."
                                  : "Decline Offer"}
                              </button>
                            </div>
                          )}

                          {waitingStart && (
                            <div className="flex items-center px-4 py-3 bg-[#f9f9f9] border border-[#e5e5e5] rounded-[12px]">
                              <span className="text-[10px] font-black text-[#333] opacity-40 uppercase tracking-[0.05em]">
                                Awaiting official commencement
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
