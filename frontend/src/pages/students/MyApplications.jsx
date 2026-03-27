import React, { useEffect, useState } from "react";
import API from "../../api/api";
import { useNavigate } from "react-router-dom";
import StudentNavBar from "../../components/navbars/StudentNavBar";

// ==========================================
// 1. Reusable Status Badge Component
// ==========================================
const StatusBadge = ({ status }) => {
  let cls = "bg-[#F5F6FA] border-transparent text-[#2D3436] opacity-60";
  let dotCls = "bg-[#2D3436] opacity-40";

  if (["selected", "offer_accepted", "completed"].includes(status)) {
    cls = "bg-emerald-50 border-emerald-200 text-emerald-600 shadow-sm";
    dotCls = "bg-emerald-500";
  } else if (["applied", "shortlisted", "ongoing"].includes(status)) {
    cls = "bg-[#2D3436] text-[#FFFFFF] border-[#2D3436] shadow-sm";
    dotCls = "bg-[#FFFFFF]";
  } else if (["rejected", "terminated"].includes(status)) {
    cls = "bg-rose-50 border-rose-200 text-rose-600 shadow-sm";
    dotCls = "bg-rose-500";
  }

  return (
    <span
      className={`inline-flex items-center px-3 py-1.5 rounded-[12px] text-[10px] font-black uppercase tracking-widest border transition-all duration-300 ${cls}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full mr-2 ${dotCls}`}></span>
      {status.replace("_", " ")}
    </span>
  );
};

// ==========================================
// 2. Individual Application Row Component
// ==========================================
const ApplicationRow = ({
  app,
  loadingId,
  expandedId,
  toggleExpand,
  actionHandler,
  navigate,
}) => {
  const internship = app.internship || {};
  const isExpanded = expandedId === app._id;

  // Logic Booleans
  const canWithdraw = app.status === "applied" || app.status === "shortlisted";
  const canAccept = app.status === "selected";
  const waitingStart = app.status === "offer_accepted";
  const canTrack = app.status === "ongoing" || app.status === "completed";

  return (
    <React.Fragment>
      {/* Main Table Row */}
      <tr
        className={`border-b border-[#F5F6FA] transition-all duration-300 hover:bg-[#F5F6FA]/40 group cursor-pointer ${isExpanded ? "bg-[#F5F6FA]/60" : ""}`}
        onClick={() => toggleExpand(app._id)}
      >
        <td className="p-6 md:px-8 md:py-6 align-middle">
          <div className="flex flex-col">
            <h3 className="text-[16px] font-black text-[#2D3436] m-0 leading-tight group-hover:text-[#6C5CE7] transition-colors duration-300 truncate max-w-[200px] sm:max-w-[300px]">
              {internship.title}
            </h3>
            <p className="text-[11px] font-black text-[#2D3436] opacity-40 uppercase tracking-widest mt-1.5 truncate">
              {internship.company?.name}
            </p>
          </div>
        </td>

        <td className="p-6 md:px-8 md:py-6 align-middle whitespace-nowrap">
          <span className="text-[13px] font-bold text-[#2D3436] opacity-80">
            {new Date(app.appliedAt).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
        </td>

        <td className="p-6 md:px-8 md:py-6 align-middle whitespace-nowrap">
          <StatusBadge status={app.status} />
        </td>

        <td className="p-6 md:px-8 md:py-6 align-middle text-right whitespace-nowrap">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleExpand(app._id);
            }}
            className={`px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-[12px] transition-all duration-300 cursor-pointer outline-none transform active:scale-95 shadow-sm
              ${
                isExpanded
                  ? "bg-[#6C5CE7] text-[#FFFFFF] border-transparent hover:shadow-md hover:-translate-y-0.5"
                  : "bg-[#FFFFFF] text-[#2D3436] border border-[#F5F6FA] hover:border-[#6C5CE7] hover:text-[#6C5CE7] hover:-translate-y-0.5"
              }`}
          >
            {isExpanded ? "Less Info" : "More Info"}
          </button>
        </td>
      </tr>

      {/* Expanded Details Drawer (Compact & Space-Friendly) */}
      {isExpanded && (
        <tr className="bg-[#FFFFFF] border-b border-[#F5F6FA] shadow-inner animate-in fade-in slide-in-from-top-2 duration-300">
          <td colSpan={4} className="p-6 md:px-8 md:py-6">
            <div className="flex flex-col gap-6">
              {/* Top Details - Compact Horizontal Flexbox */}
              <div className="flex flex-wrap items-center gap-x-12 gap-y-4 p-5 bg-[#F5F6FA] rounded-[20px] border border-transparent hover:border-[#6C5CE7]/10 transition-colors">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-black text-[#2D3436] opacity-40 uppercase tracking-[0.15em]">
                    Work Mode
                  </span>
                  <span className="text-[14px] font-black text-[#6C5CE7] capitalize bg-[#FFFFFF] px-3 py-1 rounded-[8px] shadow-sm w-max">
                    {internship.mode}
                  </span>
                </div>

                {app.mentor && (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-black text-[#2D3436] opacity-40 uppercase tracking-[0.15em]">
                      Supervisor
                    </span>
                    <span className="text-[14px] font-bold text-[#2D3436]">
                      {app.mentor.fullName}
                    </span>
                  </div>
                )}

                {app.resumeSnapshot && (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-black text-[#2D3436] opacity-40 uppercase tracking-[0.15em]">
                      Document
                    </span>
                    <a
                      href={app.resumeSnapshot}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[13px] font-black text-[#6C5CE7] underline decoration-[#6C5CE7]/30 underline-offset-4 hover:decoration-[#6C5CE7] transition-all"
                    >
                      View Resume
                    </a>
                  </div>
                )}
              </div>

              {/* Action Buttons - Compact Row */}
              <div className="flex flex-wrap gap-3 pt-2">
                {canWithdraw && (
                  <button
                    disabled={loadingId === app._id}
                    onClick={() => actionHandler(app._id, "withdraw")}
                    className="px-6 py-3 text-[10px] font-black text-rose-600 bg-rose-50 border border-rose-200 rounded-[14px] hover:bg-rose-100 hover:shadow-sm transition-all duration-300 disabled:opacity-50 disabled:transform-none uppercase tracking-widest cursor-pointer outline-none transform hover:-translate-y-0.5"
                  >
                    {loadingId === app._id ? (
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 border-2 border-rose-600/30 border-t-rose-600 rounded-full animate-spin"></span>
                        Processing...
                      </div>
                    ) : (
                      "Withdraw Submission"
                    )}
                  </button>
                )}

                {canTrack && (
                  <button
                    onClick={() => navigate(`/student/intern/${app._id}/track`)}
                    className="px-6 py-3 text-[10px] font-black text-[#FFFFFF] bg-[#6C5CE7] rounded-[14px] border-none hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 uppercase tracking-[0.15em] cursor-pointer outline-none transform active:scale-95"
                  >
                    Access Task Console
                  </button>
                )}

                {canAccept && (
                  <>
                    <button
                      disabled={loadingId === app._id}
                      onClick={() => actionHandler(app._id, "accept")}
                      className="px-6 py-3 text-[10px] font-black text-[#FFFFFF] bg-emerald-500 border-none rounded-[14px] hover:bg-emerald-600 hover:shadow-md transition-all duration-300 disabled:opacity-50 disabled:transform-none uppercase tracking-[0.15em] cursor-pointer outline-none transform hover:-translate-y-0.5 active:scale-95"
                    >
                      {loadingId === app._id ? (
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 border-2 border-[#FFFFFF]/30 border-t-[#FFFFFF] rounded-full animate-spin"></span>
                          Processing...
                        </div>
                      ) : (
                        "Confirm Offer"
                      )}
                    </button>

                    <button
                      disabled={loadingId === app._id}
                      onClick={() => actionHandler(app._id, "decline")}
                      className="px-6 py-3 text-[10px] font-black text-rose-600 bg-rose-50 border border-rose-200 rounded-[14px] hover:bg-rose-100 hover:shadow-sm transition-all duration-300 disabled:opacity-50 disabled:transform-none uppercase tracking-widest cursor-pointer outline-none transform hover:-translate-y-0.5"
                    >
                      {loadingId === app._id ? (
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 border-2 border-rose-600/30 border-t-rose-600 rounded-full animate-spin"></span>
                          Processing...
                        </div>
                      ) : (
                        "Decline Offer"
                      )}
                    </button>
                  </>
                )}

                {waitingStart && (
                  <div className="px-6 py-3 bg-[#F5F6FA] border border-transparent rounded-[14px] flex items-center shadow-sm">
                    <span className="text-[10px] font-black text-[#2D3436] opacity-50 uppercase tracking-[0.15em] flex items-center">
                      <span className="w-2 h-2 rounded-full bg-[#6C5CE7] mr-2 animate-pulse"></span>
                      Awaiting official commencement
                    </span>
                  </div>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </React.Fragment>
  );
};

// ==========================================
// 3. Main Applications Component
// ==========================================
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

  const actionHandler = async (id, action) => {
    try {
      setLoadingId(id);
      if (action === "withdraw") {
        await API.patch(`/applications/${id}/withdraw`);
      } else {
        await API.patch(`/applications/${id}/offer`, { decision: action });
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
      <div className="min-h-screen bg-[#FFFFFF] text-[#2D3436] font-['Nunito'] pb-12 transition-all duration-500 selection:bg-[#6C5CE7]/20 selection:text-[#6C5CE7]">
        <main className="max-w-6xl mx-auto w-full px-4 md:px-8 py-8 flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Header Section */}
          <header className="flex flex-col md:flex-row justify-between md:items-end gap-6 border-b border-[#F5F6FA] pb-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl md:text-5xl font-black text-[#2D3436] m-0 tracking-tighter leading-tight uppercase">
                My Applications
              </h1>
              <p className="text-[13px] font-black text-[#6C5CE7] opacity-80 m-0 uppercase tracking-[0.2em]">
                Submission & Offer Tracking
              </p>
            </div>
            <div className="text-[11px] font-black text-[#2D3436] bg-[#F5F6FA] border border-transparent px-5 py-3 rounded-[14px] uppercase tracking-widest shadow-sm">
              Total Count:{" "}
              <span className="text-[#6C5CE7] ml-1">{data.length}</span>
            </div>
          </header>

          {/* Data Handling */}
          {data.length === 0 ? (
            <div className="bg-[#F5F6FA] border-2 border-dashed border-[#6C5CE7]/20 rounded-[32px] p-24 text-center animate-in zoom-in duration-500">
              <p className="text-[14px] font-black text-[#2D3436] opacity-40 m-0 uppercase tracking-[0.15em]">
                No application history found
              </p>
            </div>
          ) : (
            <div className="bg-[#FFFFFF] border border-[#F5F6FA] rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-x-auto box-border hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] transition-all duration-500 animate-in slide-in-from-bottom-8">
              <table className="w-full text-left border-collapse min-w-max">
                <thead>
                  <tr className="border-b border-[#F5F6FA] bg-[#F5F6FA] bg-opacity-50">
                    <th className="px-8 py-6 text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-[0.15em]">
                      Role & Company
                    </th>
                    <th className="px-8 py-6 text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-[0.15em] whitespace-nowrap">
                      Applied On
                    </th>
                    <th className="px-8 py-6 text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-[0.15em]">
                      Status
                    </th>
                    <th className="px-8 py-6 text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-[0.15em] text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((app) => (
                    <ApplicationRow
                      key={app._id}
                      app={app}
                      loadingId={loadingId}
                      expandedId={expandedId}
                      toggleExpand={toggleExpand}
                      actionHandler={actionHandler}
                      navigate={navigate}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
