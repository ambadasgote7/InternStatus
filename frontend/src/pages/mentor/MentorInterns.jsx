import { useEffect, useState } from "react";
import API from "../../api/api";
import { useNavigate } from "react-router-dom";

const MentorInterns = () => {
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchInterns = async () => {
    try {
      const res = await API.get("/mentor/interns");
      setInterns(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch interns", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.patch(`/mentor/interns/${id}/status`, { status });
      fetchInterns();
    } catch (err) {
      console.error("Status update failed", err);
    }
  };

  useEffect(() => {
    fetchInterns();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center font-sans">
        <p className="text-[14px] font-bold text-[#333] animate-pulse m-0">
          Syncing Intern Cohort...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#333] font-sans pb-10">
      <main className="max-w-7xl mx-auto w-full px-4 md:px-6 py-6 flex flex-col gap-6">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#e5e5e5] pb-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-[23px] font-black text-[#333] m-0 tracking-tight leading-tight">
              My Interns
            </h1>
            <p className="text-[13px] font-bold text-[#333] opacity-60 m-0 uppercase tracking-widest">
              Active Mentorship Roster
            </p>
          </div>
          <div className="text-[11px] font-black text-[#111] bg-[#fff] border border-[#e5e5e5] px-3 py-1.5 rounded-[10px] uppercase tracking-widest">
            Total Interns: {interns.length}
          </div>
        </header>

        {interns.length === 0 ? (
          <div className="bg-[#fff] border-2 border-dashed border-[#e5e5e5] rounded-[20px] p-20 text-center">
            <p className="text-[13px] font-bold text-[#333] opacity-40 m-0 uppercase tracking-widest">
              No interns assigned to your profile
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {interns.map((intern) => (
              <div
                key={intern.applicationId}
                className="bg-[#fff] border border-[#e5e5e5] rounded-[20px] shadow-sm hover:border-[#333] transition-all flex flex-col p-6"
              >
                <div className="flex justify-between items-start mb-5">
                  <div className="flex-1 min-w-0 pr-2">
                    <h2 className="text-[17px] font-black text-[#333] m-0 leading-tight truncate">
                      {intern.studentName}
                    </h2>
                    <p className="text-[12px] font-bold text-[#333] opacity-50 truncate mt-1">
                      {intern.studentEmail}
                    </p>
                  </div>
                  <span className="px-2 py-1 rounded-[10px] text-[9px] font-black uppercase tracking-widest bg-[#f9f9f9] border border-[#e5e5e5]">
                    {intern.status}
                  </span>
                </div>

                <div className="flex flex-col gap-4 py-4 border-y border-[#f9f9f9]">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">
                      Internship Program
                    </span>
                    <span className="text-[13px] font-bold text-[#333] leading-tight">
                      {intern.internshipTitle}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">
                        Mode
                      </span>
                      <span className="text-[13px] font-bold">
                        {intern.mode}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">
                        Location
                      </span>
                      <span className="text-[13px] font-bold truncate">
                        {intern.location}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">
                      Timeline
                    </span>
                    <span className="text-[12px] font-mono font-bold text-[#111] uppercase mt-0.5">
                      {intern.startDate
                        ? new Date(intern.startDate).toLocaleDateString(
                            "en-IN",
                            { day: "2-digit", month: "short" },
                          )
                        : "—"}
                      <span className="mx-2 opacity-30">/</span>
                      {intern.endDate
                        ? new Date(intern.endDate).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                          })
                        : "Ongoing"}
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {intern.status === "offer_accepted" && (
                    <button
                      onClick={() =>
                        updateStatus(intern.applicationId, "ongoing")
                      }
                      className="px-4 py-2 bg-[#111] text-[#fff] text-[11px] font-bold rounded-[10px] border-none cursor-pointer uppercase tracking-widest hover:opacity-80 transition-opacity"
                    >
                      Start
                    </button>
                  )}

                  {intern.status === "ongoing" && (
                    <>
                      <button
                        onClick={() =>
                          updateStatus(intern.applicationId, "completed")
                        }
                        className="px-4 py-2 bg-[#111] text-[#fff] text-[11px] font-bold rounded-[10px] border-none cursor-pointer uppercase tracking-widest hover:opacity-80 transition-opacity"
                      >
                        Complete
                      </button>
                      <button
                        onClick={() =>
                          updateStatus(intern.applicationId, "terminated")
                        }
                        className="px-4 py-2 bg-[#fff] border border-[#cc0000] text-[#cc0000] text-[11px] font-bold rounded-[10px] cursor-pointer uppercase tracking-widest hover:bg-[#cc0000] hover:text-[#fff] transition-colors"
                      >
                        Terminate
                      </button>
                    </>
                  )}

                  {intern.status === "completed" &&
                    intern.report &&
                    intern.report.status !== "generated" && (
                      <button
                        onClick={() =>
                          window.open(intern.report.reportUrl, "_blank")
                        }
                        className="px-4 py-2 bg-[#f9f9f9] border border-[#333] text-[#333] text-[11px] font-bold rounded-[10px] cursor-pointer uppercase tracking-widest hover:bg-[#333] hover:text-[#fff] transition-all"
                      >
                        Report
                      </button>
                    )}

                  <button
                    onClick={() =>
                      navigate(`/mentor/intern/${intern.applicationId}/track`)
                    }
                    className="px-4 py-2 bg-[#f9f9f9] border border-[#e5e5e5] text-[#333] text-[11px] font-bold rounded-[10px] cursor-pointer uppercase tracking-widest hover:border-[#333] transition-colors ml-auto"
                  >
                    Track Task
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MentorInterns;
