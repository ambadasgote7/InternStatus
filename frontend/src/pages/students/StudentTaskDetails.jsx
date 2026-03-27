import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import API from "../../api/api";

export default function StudentTaskDetails() {
  const { taskId } = useParams();

  const [task, setTask] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    workSummary: "",
    githubLink: "",
    technologiesUsed: "",
    files: [],
  });

  const ALLOWED_TYPES = [
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/jpg",
    "application/zip",
  ];

  /* ================= FETCH ================= */

  const fetchTask = async () => {
    try {
      const [taskRes, subRes] = await Promise.all([
        API.get(`/tasks/${taskId}`),
        API.get(`/task-submissions/task/${taskId}`),
      ]);

      setTask(taskRes.data.data);

      const sorted = (subRes.data.data || []).sort(
        (a, b) => new Date(b.submittedAt) - new Date(a.submittedAt),
      );

      setSubmissions(sorted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTask();
  }, [taskId]);

  /* ================= DERIVED ================= */

  const latestSubmission = useMemo(() => {
    return submissions.length ? submissions[0] : null;
  }, [submissions]);

  const canSubmit =
    task &&
    !["completed", "cancelled"].includes(task.status) &&
    (!latestSubmission || latestSubmission.status === "revision_requested");

  /* ================= FILE ================= */

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length > 5) {
      alert("Max 5 files allowed");
      e.target.value = ""; // Reset input
      return;
    }

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        alert(
          `Invalid file type detected: ${file.type}. Allowed types are PDF, PNG, JPEG, and ZIP.`,
        );
        e.target.value = ""; // Reset input
        return;
      }
    }

    setForm((prev) => ({ ...prev, files }));
  };

  /* ================= SUBMIT ================= */

  const submitTask = async () => {
    if (!form.workSummary.trim()) {
      alert("Work summary required");
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();

      formData.append("taskId", taskId);
      formData.append("workSummary", form.workSummary);
      formData.append("githubLink", form.githubLink);

      const techArray = form.technologiesUsed
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      formData.append("technologiesUsed", JSON.stringify(techArray));

      form.files.forEach((file) => {
        formData.append("files", file);
      });

      await API.post("/task-submissions", formData);

      setForm({
        workSummary: "",
        githubLink: "",
        technologiesUsed: "",
        files: [],
      });

      // Clear file input visually
      const fileInput = document.getElementById("file-upload");
      if (fileInput) fileInput.value = "";

      fetchTask();
    } catch (err) {
      alert(err.response?.data?.message || "Error during submission");
    } finally {
      setSubmitting(false);
    }
  };

  /* ================= STATUS ================= */

  const getStatusBadge = (status) => {
    let cls = "bg-[#F5F6FA] border-transparent text-[#2D3436]";
    let dotCls = "bg-[#2D3436] opacity-40";

    switch (status) {
      case "completed":
      case "approved":
        cls = "bg-emerald-50 border-emerald-200 text-emerald-600";
        dotCls = "bg-emerald-500";
        break;
      case "submitted":
      case "under_review":
      case "pending":
      case "in_progress":
        cls = "bg-[#2D3436] text-[#FFFFFF] border-[#2D3436]";
        dotCls = "bg-[#FFFFFF]";
        break;
      case "revision_requested":
      case "cancelled":
        cls = "bg-rose-50 border-rose-200 text-rose-600";
        dotCls = "bg-rose-500";
        break;
      default:
        break;
    }

    return (
      <span
        className={`inline-flex items-center px-3 py-1.5 rounded-[12px] text-[10px] font-black uppercase tracking-widest border shadow-sm ${cls}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full mr-2 ${dotCls}`}></span>
        {status.replace("_", " ")}
      </span>
    );
  };

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] flex items-center justify-center font-['Nunito'] transition-all duration-300">
        <div className="flex flex-col items-center gap-4 animate-in fade-in duration-700">
          <div className="w-12 h-12 border-4 border-[#F5F6FA] border-t-[#6C5CE7] rounded-full animate-spin"></div>
          <p className="text-[12px] font-black text-[#6C5CE7] animate-pulse m-0 uppercase tracking-widest">
            Syncing Task Details...
          </p>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] flex items-center justify-center p-4 font-['Nunito'] transition-all duration-300">
        <div className="bg-[#F5F6FA] border-2 border-dashed border-rose-200 p-16 rounded-[32px] text-center shadow-sm animate-in zoom-in duration-500">
          <p className="text-[14px] font-black text-rose-600 m-0 uppercase tracking-widest">
            Task Record Not Found
          </p>
        </div>
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#2D3436] font-['Nunito'] pb-12 transition-colors duration-500 selection:bg-[#6C5CE7]/20 selection:text-[#6C5CE7]">
      <div className="max-w-5xl mx-auto p-4 md:p-8 lg:p-10 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* ===== TASK HEADER ===== */}
        <header className="border-b border-[#F5F6FA] pb-8">
          <div className="text-[11px] font-black text-[#6C5CE7] uppercase tracking-[0.2em] mb-4">
            Task Console
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <h1 className="text-3xl md:text-4xl font-black text-[#2D3436] m-0 tracking-tighter leading-tight">
              {task.title}
            </h1>
            <div className="shrink-0">{getStatusBadge(task.status)}</div>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col gap-8">
            {/* ===== TASK SPECIFICATION ===== */}
            <div className="bg-[#FFFFFF] border border-[#F5F6FA] rounded-[32px] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)]">
              <h2 className="text-[12px] font-black text-[#6C5CE7] uppercase tracking-[0.2em] border-b border-[#F5F6FA] pb-4 mb-6 flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6C5CE7] mr-3"></span>
                Task Specification
              </h2>
              <p className="text-[15px] font-bold leading-relaxed text-[#2D3436] opacity-80 whitespace-pre-line bg-[#F5F6FA]/50 p-6 rounded-[24px] border border-transparent m-0">
                {task.description}
              </p>

              {/* RESOURCE FILES */}
              {task.resourceFiles?.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-widest mb-4">
                    Provided Resources
                  </h3>
                  <div className="flex flex-col gap-3">
                    {task.resourceFiles.map((f, i) => (
                      <a
                        key={i}
                        href={f.url}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-[#F5F6FA] px-5 py-3 rounded-[16px] text-[13px] font-black text-[#6C5CE7] underline decoration-[#6C5CE7]/30 underline-offset-4 hover:decoration-[#6C5CE7] hover:bg-[#FFFFFF] border border-transparent hover:border-[#6C5CE7]/20 transition-all duration-300 w-max max-w-full truncate shadow-sm"
                      >
                        {f.fileName}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* EXTERNAL LINK */}
              {task.externalLink && (
                <div className="mt-8">
                  <h3 className="text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-widest mb-4">
                    External Reference
                  </h3>
                  <a
                    href={task.externalLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center px-6 py-3 bg-[#FFFFFF] border-2 border-[#F5F6FA] text-[#6C5CE7] text-[12px] font-black uppercase tracking-[0.15em] rounded-[16px] hover:border-[#6C5CE7] hover:shadow-sm transition-all duration-300 outline-none transform active:scale-95"
                  >
                    Open Resource Link
                  </a>
                </div>
              )}
            </div>

            {/* ===== SUBMISSIONS HISTORY ===== */}
            {submissions.length > 0 && (
              <div className="flex flex-col gap-6">
                <h2 className="text-[14px] font-black text-[#2D3436] uppercase tracking-[0.15em] m-0 pl-2">
                  Submission History
                </h2>

                <div className="flex flex-col gap-6">
                  {submissions.map((sub, idx) => (
                    <div
                      key={sub._id}
                      style={{ animationDelay: `${idx * 50}ms` }}
                      className="bg-[#FFFFFF] border border-[#F5F6FA] p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(108,92,231,0.08)] hover:border-[#6C5CE7]/20 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 flex flex-col gap-6 relative overflow-hidden group"
                    >
                      {/* Optional subtle gradient accent for the latest submission */}
                      {idx === 0 && (
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] opacity-50"></div>
                      )}

                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-[#F5F6FA] pb-4">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-full bg-[#F5F6FA] flex items-center justify-center text-[12px] font-black text-[#6C5CE7] shadow-sm">
                            {sub.attempt}
                          </span>
                          <span className="text-[13px] font-black text-[#2D3436] uppercase tracking-widest">
                            Attempt {sub.attempt}
                          </span>
                        </div>
                        {getStatusBadge(sub.status)}
                      </div>

                      <div className="bg-[#F5F6FA] p-5 rounded-[20px] border border-transparent">
                        <span className="text-[10px] font-black text-[#2D3436] opacity-40 uppercase tracking-widest block mb-2 px-1">
                          Work Summary
                        </span>
                        <p className="text-[14px] font-bold text-[#2D3436] opacity-80 m-0 px-1 whitespace-pre-line leading-relaxed">
                          {sub.workSummary}
                        </p>
                      </div>

                      {/* TECH & GITHUB ROW */}
                      {(sub.technologiesUsed?.length > 0 || sub.githubLink) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          {sub.technologiesUsed?.length > 0 && (
                            <div className="flex flex-col gap-3">
                              <span className="text-[10px] font-black text-[#2D3436] opacity-40 uppercase tracking-widest">
                                Technologies Used
                              </span>
                              <div className="flex flex-wrap gap-2">
                                {sub.technologiesUsed.map((t, i) => (
                                  <span
                                    key={i}
                                    className="bg-[#FFFFFF] border border-[#F5F6FA] text-[#2D3436] opacity-80 text-[11px] font-black uppercase tracking-wider px-3 py-1.5 rounded-[10px] shadow-sm"
                                  >
                                    {t}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {sub.githubLink && (
                            <div className="flex flex-col gap-3">
                              <span className="text-[10px] font-black text-[#2D3436] opacity-40 uppercase tracking-widest">
                                Repository
                              </span>
                              <a
                                href={sub.githubLink}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[13px] font-black text-[#6C5CE7] underline decoration-[#6C5CE7]/30 underline-offset-4 hover:decoration-[#6C5CE7] transition-all bg-[#F5F6FA] px-4 py-2 rounded-[12px] w-max border border-transparent hover:border-[#6C5CE7]/20 hover:bg-[#FFFFFF]"
                              >
                                View GitHub Link
                              </a>
                            </div>
                          )}
                        </div>
                      )}

                      {/* FILES */}
                      {sub.files?.length > 0 && (
                        <div className="pt-2">
                          <span className="text-[10px] font-black text-[#2D3436] opacity-40 uppercase tracking-widest block mb-3">
                            Attachments
                          </span>
                          <div className="flex flex-col gap-2 bg-[#F5F6FA] p-4 rounded-[16px]">
                            {sub.files.map((f, i) => (
                              <a
                                key={i}
                                href={f.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[13px] font-black text-[#6C5CE7] truncate hover:underline hover:text-[#2D3436] transition-colors duration-300"
                              >
                                {f.fileName}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* FEEDBACK */}
                      {sub.mentorFeedback && (
                        <div className="bg-rose-50 border border-rose-100 p-6 rounded-[20px] mt-2 relative overflow-hidden">
                          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-rose-400"></div>
                          <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest block mb-2 px-2">
                            Supervisor Feedback
                          </span>
                          <p className="text-[14px] font-bold text-rose-900 m-0 px-2 whitespace-pre-line leading-relaxed">
                            {sub.mentorFeedback}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ===== ACTION SIDEBAR (FORM) ===== */}
          {canSubmit && (
            <aside className="w-full lg:w-[420px] flex-shrink-0">
              <div className="bg-[#FFFFFF] border border-[#F5F6FA] p-8 md:p-10 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] sticky top-10 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] flex flex-col gap-8 animate-in slide-in-from-right-8 duration-700">
                <header className="border-b border-[#F5F6FA] pb-5">
                  <h2 className="text-[20px] font-black text-[#2D3436] m-0 tracking-tight uppercase">
                    New Submission
                  </h2>
                  <p className="text-[11px] font-black text-[#2D3436] opacity-40 uppercase tracking-widest mt-2 m-0">
                    Attempt {submissions.length + 1}
                  </p>
                </header>

                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-[#2D3436] opacity-50 uppercase tracking-widest px-1">
                      Work Summary *
                    </label>
                    <textarea
                      placeholder="Describe your approach and results..."
                      value={form.workSummary}
                      onChange={(e) =>
                        setForm({ ...form, workSummary: e.target.value })
                      }
                      rows={5}
                      className="w-full px-5 py-4 text-[14px] font-bold text-[#2D3436] bg-[#F5F6FA] border border-transparent rounded-[16px] outline-none transition-all duration-300 focus:bg-[#FFFFFF] focus:border-[#6C5CE7] focus:ring-4 focus:ring-[#6C5CE7]/10 placeholder-[#2D3436] placeholder-opacity-30 shadow-sm resize-none"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-[#2D3436] opacity-50 uppercase tracking-widest px-1">
                      Technologies (Comma separated)
                    </label>
                    <input
                      placeholder="e.g. React, Node.js, Express"
                      value={form.technologiesUsed}
                      onChange={(e) =>
                        setForm({ ...form, technologiesUsed: e.target.value })
                      }
                      className="w-full px-5 py-4 text-[14px] font-bold text-[#2D3436] bg-[#F5F6FA] border border-transparent rounded-[16px] outline-none transition-all duration-300 focus:bg-[#FFFFFF] focus:border-[#6C5CE7] focus:ring-4 focus:ring-[#6C5CE7]/10 placeholder-[#2D3436] placeholder-opacity-30 shadow-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-[#2D3436] opacity-50 uppercase tracking-widest px-1">
                      GitHub / Repo Link
                    </label>
                    <input
                      placeholder="https://github.com/username/repo"
                      value={form.githubLink}
                      onChange={(e) =>
                        setForm({ ...form, githubLink: e.target.value })
                      }
                      className="w-full px-5 py-4 text-[14px] font-bold text-[#2D3436] bg-[#F5F6FA] border border-transparent rounded-[16px] outline-none transition-all duration-300 focus:bg-[#FFFFFF] focus:border-[#6C5CE7] focus:ring-4 focus:ring-[#6C5CE7]/10 placeholder-[#2D3436] placeholder-opacity-30 shadow-sm font-mono"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-[#2D3436] opacity-50 uppercase tracking-widest px-1">
                      Attachments (Max 5)
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        id="file-upload"
                        multiple
                        accept=".pdf,image/png,image/jpeg,image/jpg,.zip"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="w-full px-5 py-4 bg-[#F5F6FA] border-2 border-transparent border-dashed rounded-[16px] text-center hover:border-[#6C5CE7]/40 hover:bg-[#FFFFFF] transition-all duration-300 flex flex-col items-center justify-center gap-2 shadow-sm">
                        <span
                          className={`px-4 py-2 rounded-[10px] text-[10px] font-black uppercase tracking-widest transition-colors ${form.files.length > 0 ? "bg-[#6C5CE7] text-[#FFFFFF]" : "bg-[#FFFFFF] text-[#2D3436] opacity-60 border border-[#F5F6FA]"}`}
                        >
                          {form.files.length > 0
                            ? `${form.files.length} Files Selected`
                            : "Browse Files"}
                        </span>
                        <span className="text-[10px] font-black text-[#2D3436] opacity-30 uppercase tracking-widest mt-1">
                          PDF, PNG, JPG, ZIP (Max 5MB each)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-[#F5F6FA]">
                  <button
                    onClick={submitTask}
                    disabled={submitting}
                    className="w-full py-5 text-[12px] font-black text-[#FFFFFF] bg-[#6C5CE7] border-none rounded-[16px] cursor-pointer transition-all duration-300 hover:shadow-[0_12px_24px_-8px_rgba(108,92,231,0.6)] hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-[0.2em] flex items-center justify-center gap-3 outline-none shadow-md"
                  >
                    {submitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-[#FFFFFF]/30 border-t-[#FFFFFF] rounded-full animate-spin" />
                        Transmitting...
                      </>
                    ) : (
                      "Submit Task"
                    )}
                  </button>
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
