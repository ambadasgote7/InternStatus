import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api/api";
import AdminSidebar from "../../components/sidebar/AdminSidebar";

export default function TrackInternship() {
  const { applicationId } = useParams();
  const navigate = useNavigate();

  const [internship, setInternship] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [internRes, taskRes, reportRes] = await Promise.all([
        API.get(`/students/internship/${applicationId}/track`),
        API.get(`/tasks/application/${applicationId}`),
        API.get(`/reports/${applicationId}`),
      ]);

      setInternship(internRes.data.data);
      setTasks(taskRes.data.data || []);
      setReport(reportRes.data || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [applicationId]);

  const getStatusBadge = (status) => {
    let cls = "bg-[#f9f9f9] border-[#e5e5e5] text-[#333]";
    if (status === "completed")
      cls = "bg-[#fff] border-[#008000] text-[#008000]";
    else if (status === "ongoing") cls = "bg-[#111] text-[#fff] border-[#111]";

    return (
      <span
        className={`px-2.5 py-1 rounded-[10px] text-[9px] font-black uppercase tracking-widest border ${cls}`}
      >
        {status}
      </span>
    );
  };

  const isCompleted = internship?.status === "completed";
  const isGenerated = report?.isLocked;
  const isSubmitted = report?.status === "faculty_pending";
  const hasCertificate = !!internship?.certificateUrl;

  const handleGenerate = async () => {
    if (isGenerated) return;
    try {
      setActionLoading(true);
      await API.post(`/reports/generate/${applicationId}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || "Generation failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadReport = () => {
    if (!report?.reportUrl) return;
    window.open(report.reportUrl, "_blank");
  };

  const handleSubmit = async () => {
    try {
      setActionLoading(true);
      await API.post(`/reports/submit/${applicationId}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || "Submission failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewCertificate = () => {
    if (!internship?.certificateUrl) return;
    window.open(internship.certificateUrl, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center font-sans">
        <p className="text-[14px] font-bold text-[#333] animate-pulse m-0 uppercase tracking-widest">
          Syncing Progress Data
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#f9f9f9] text-[#333] font-sans pb-10">
        <main className="max-w-6xl mx-auto w-full px-4 md:px-6 py-6 flex flex-col gap-8">
          <header className="bg-[#fff] border border-[#e5e5e5] rounded-[20px] p-6 md:p-8 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
              <div className="flex flex-col gap-1">
                <h1 className="text-[23px] font-black tracking-tight m-0">
                  {internship?.internship?.title}
                </h1>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                  <span className="text-[12px] font-bold opacity-50 uppercase tracking-widest">
                    Company: {internship?.company?.name}
                  </span>
                  <span className="text-[12px] font-bold opacity-50 uppercase tracking-widest">
                    Mentor:{" "}
                    {internship?.mentor?.fullName || "Awaiting Assignment"}
                  </span>
                </div>
              </div>
              {getStatusBadge(internship?.status)}
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-6 border-t border-[#f9f9f9]">
              {isGenerated && (
                <div className="px-3 py-1.5 rounded-[10px] bg-[#f9f9f9] border border-[#008000] text-[#008000] text-[10px] font-black uppercase tracking-widest">
                  Report Generated
                </div>
              )}
              {isSubmitted && (
                <div className="px-3 py-1.5 rounded-[10px] bg-[#f9f9f9] border border-[#111] text-[#111] text-[10px] font-black uppercase tracking-widest">
                  Faculty Review Pending
                </div>
              )}
            </div>

            {isCompleted && (
              <div className="mt-8 flex flex-wrap gap-3">
                {!isGenerated && (
                  <button
                    onClick={handleGenerate}
                    disabled={actionLoading}
                    className="px-6 py-3 bg-[#111] text-[#fff] text-[11px] font-black uppercase tracking-widest rounded-[12px] border-none cursor-pointer hover:opacity-80 transition-opacity disabled:opacity-30"
                  >
                    {actionLoading ? "Processing..." : "Generate Final Report"}
                  </button>
                )}

                {isGenerated && (
                  <>
                    <button
                      onClick={handleDownloadReport}
                      className="px-6 py-3 bg-[#f9f9f9] border border-[#333] text-[#333] text-[11px] font-black uppercase tracking-widest rounded-[12px] cursor-pointer hover:bg-[#333] hover:text-[#fff] transition-all"
                    >
                      Download PDF
                    </button>
                    <button
                      disabled={isSubmitted || actionLoading}
                      onClick={handleSubmit}
                      className="px-6 py-3 bg-[#111] text-[#fff] text-[11px] font-black uppercase tracking-widest rounded-[12px] border-none cursor-pointer hover:opacity-80 transition-opacity disabled:opacity-30"
                    >
                      {isSubmitted
                        ? "Submission Locked"
                        : "Submit to Institution"}
                    </button>
                  </>
                )}

                {hasCertificate && (
                  <button
                    onClick={handleViewCertificate}
                    className="px-6 py-3 bg-[#fff] border border-[#008000] text-[#008000] text-[11px] font-black uppercase tracking-widest rounded-[12px] cursor-pointer hover:bg-[#008000] hover:text-[#fff] transition-all"
                  >
                    View Completion Certificate
                  </button>
                )}
              </div>
            )}
          </header>

          <section className="flex flex-col gap-4">
            <h2 className="text-[13px] font-black uppercase tracking-widest opacity-40 px-2">
              Assigned Milestones
            </h2>

            {tasks.length === 0 ? (
              <div className="bg-[#fff] border-2 border-dashed border-[#e5e5e5] rounded-[20px] p-20 text-center">
                <p className="text-[13px] font-bold text-[#333] opacity-40 m-0 uppercase tracking-widest">
                  No tasks provisioned by mentor
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tasks.map((task) => (
                  <div
                    key={task._id}
                    className="bg-[#fff] border border-[#e5e5e5] rounded-[20px] shadow-sm hover:border-[#333] transition-all flex flex-col"
                  >
                    <div className="p-6 flex-grow flex flex-col gap-4">
                      <div className="flex justify-between items-start">
                        <h3 className="text-[16px] font-black m-0 leading-tight">
                          {task.title}
                        </h3>
                        {getStatusBadge(task.status)}
                      </div>

                      <p className="text-[12px] font-medium opacity-70 m-0 line-clamp-3 leading-relaxed">
                        {task.description}
                      </p>

                      <div className="flex flex-col gap-1 mt-auto pt-4 border-t border-[#f9f9f9]">
                        <div className="flex justify-between">
                          <span className="text-[10px] font-bold opacity-40 uppercase">
                            Assigned
                          </span>
                          <span className="text-[11px] font-bold">
                            {new Date(task.assignedAt).toLocaleDateString(
                              "en-IN",
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[10px] font-bold opacity-40 uppercase">
                            Deadline
                          </span>
                          <span className="text-[11px] font-bold text-[#cc0000]">
                            {task.deadline
                              ? new Date(task.deadline).toLocaleDateString(
                                  "en-IN",
                                )
                              : "No Limit"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-[#fcfcfc] border-t border-[#f9f9f9] rounded-b-[20px]">
                      <button
                        onClick={() => navigate(`/student/task/${task._id}`)}
                        className="w-full py-2.5 bg-[#f9f9f9] border border-[#333] text-[#333] text-[11px] font-black uppercase tracking-widest rounded-[10px] hover:bg-[#333] hover:text-[#fff] transition-all cursor-pointer"
                      >
                        View deliverable
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </>
  );
}
