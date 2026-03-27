import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../api/api";

export default function TaskDetails() {
  const { taskId } = useParams();

  const [task, setTask] = useState(null);
  const [latestSubs, setLatestSubs] = useState([]);
  const [historyMap, setHistoryMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(null);
  const [reviewState, setReviewState] = useState({});

  /* ================= FETCH ================= */
  const fetchTask = async () => {
    try {
      const [taskRes, latestRes, historyRes] = await Promise.all([
        API.get(`/tasks/${taskId}`),
        API.get(`/task-submissions/task/${taskId}?latestOnly=true`),
        API.get(`/task-submissions/task/${taskId}`),
      ]);

      setTask(taskRes.data.data);
      const latest = (latestRes.data.data || []).sort(
        (a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)
      );
      setLatestSubs(latest);

      const map = {};
      (historyRes.data.data || []).forEach((sub) => {
        const key = sub.student;
        if (!map[key]) map[key] = [];
        map[key].push(sub);
      });
      setHistoryMap(map);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTask();
  }, [taskId]);

  /* ================= STATUS ================= */
  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
      case "completed":
        return "bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider";
      case "submitted":
      case "under_review":
        return "bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider";
      case "revision_requested":
        return "bg-red-100 text-red-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider";
      default:
        return "bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider";
    }
  };

  const updateReviewField = (id, field, value) => {
    setReviewState((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const reviewSubmission = async (id) => {
    const review = reviewState[id] || {};
    if (!review.status) {
      alert("Select decision");
      return;
    }
    try {
      setReviewLoading(id);
      await API.patch(`/task-submissions/${id}/review`, {
        status: review.status,
        mentorFeedback: review.mentorFeedback || "",
        score: review.score ? Number(review.score) : undefined,
      });
      setReviewState((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
      fetchTask();
    } catch (err) {
      alert(err.response?.data?.message || "Failed");
    } finally {
      setReviewLoading(null);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F6FA] font-['Nunito']">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6C5CE7]"></div>
    </div>
  );
  
  if (!task) return <div className="p-10 text-[#2D3436] font-['Nunito'] text-center">Task not found</div>;

  const pending = latestSubs.filter(s => s.status === "submitted" || s.status === "under_review");
  const reviewed = latestSubs.filter(s => s.status === "approved" || s.status === "revision_requested");

  return (
    <div className="min-h-screen bg-[#F5F6FA] font-['Nunito'] text-[#2D3436] p-4 md:p-10">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* TASK HEADER */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-[#6C5CE7] uppercase tracking-[0.2em] block mb-2">Task Title</label>
              <h1 className="text-3xl font-extrabold text-[#2D3436]">{task.title}</h1>
            </div>

            <div>
              <label className="text-[10px] font-black text-[#6C5CE7] uppercase tracking-[0.2em] block mb-2">Task Description</label>
              <div className="bg-[#F5F6FA] p-6 rounded-2xl">
                <p className="text-[#2D3436] opacity-80 leading-relaxed text-sm md:text-base">
                  {task.description}
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-50">
              {task.resourceFiles?.map((f, i) => (
                <a key={i} href={f.url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-white text-[#6C5CE7] rounded-xl text-xs font-bold hover:bg-purple-50 transition-all border border-purple-100 shadow-sm">
                  📄 View Master Resource
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* PENDING ACTIONS */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold px-2 flex items-center gap-3">
             Active Submissions <span className="bg-[#6C5CE7] text-white text-xs px-2 py-0.5 rounded-lg">{pending.length}</span>
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {pending.map((sub) => {
              const review = reviewState[sub._id] || {};
              return (
                <div key={sub._id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                  <div className="space-y-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Intern Name</label>
                        <p className="font-extrabold text-[#6C5CE7] text-lg">{sub.student?.fullName}</p>
                      </div>
                      <p className="text-[9px] font-bold text-gray-400 uppercase">{new Date(sub.submittedAt).toLocaleDateString()}</p>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Submission Summary</label>
                      <div className="bg-[#F5F6FA] p-4 rounded-2xl text-sm italic border-l-4 border-purple-200">"{sub.workSummary}"</div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Deliverables</label>
                      <div className="flex flex-wrap gap-3">
                        {sub.githubLink && (
                          <a href={sub.githubLink} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-[#2D3436] text-white text-[10px] font-black rounded-xl hover:bg-black transition-all">
                            LINK: GITHUB REPO
                          </a>
                        )}
                        {sub.files?.map((f, i) => (
                          <a key={i} href={f.url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-[#6C5CE7] text-white text-[10px] font-black rounded-xl hover:bg-[#5b4bc4] transition-all">
                            FILE: VIEW ATTACHMENT
                          </a>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-50 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                           <label className="text-[9px] font-bold text-gray-400 uppercase ml-1">Decision</label>
                           <select value={review.status || ""} onChange={(e) => updateReviewField(sub._id, "status", e.target.value)} className="w-full bg-[#F5F6FA] border-none text-xs p-3 rounded-xl focus:ring-2 focus:ring-[#6C5CE7]">
                            <option value="">Choose Status</option>
                            <option value="approved">Approve</option>
                            <option value="revision_requested">Revision</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-gray-400 uppercase ml-1">Score / 10</label>
                          <input type="number" placeholder="Enter Grade" value={review.score || ""} onChange={(e) => updateReviewField(sub._id, "score", e.target.value)} className="w-full bg-[#F5F6FA] border-none text-xs p-3 rounded-xl focus:ring-2 focus:ring-[#6C5CE7]" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-gray-400 uppercase ml-1">Mentor Feedback</label>
                        <textarea placeholder="Write feedback details..." value={review.mentorFeedback || ""} onChange={(e) => updateReviewField(sub._id, "mentorFeedback", e.target.value)} className="w-full bg-[#F5F6FA] border-none text-xs p-3 rounded-xl h-24 focus:ring-2 focus:ring-[#6C5CE7]" />
                      </div>
                      <button onClick={() => reviewSubmission(sub._id)} className="w-full bg-[#6C5CE7] text-white font-black text-[11px] uppercase tracking-[0.2em] py-4 rounded-2xl hover:shadow-lg transition-all active:scale-95">
                        {reviewLoading === sub._id ? "Saving..." : "Submit Review"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* REVIEW HISTORY */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold px-2">Review History ({reviewed.length})</h2>
          <div className="space-y-8">
            {reviewed.map((sub) => {
              const history = (historyMap[sub.student] || []).sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
              return (
                <div key={sub._id} className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-[#F5F6FA] rounded-2xl flex items-center justify-center font-black text-[#6C5CE7] border border-purple-50">
                        {sub.student?.fullName?.charAt(0)}
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Student</label>
                        <h4 className="font-bold text-lg">{sub.student?.fullName}</h4>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 bg-[#F5F6FA] px-6 py-3 rounded-2xl">
                      {sub.score !== undefined && (
                        <div className="text-center pr-6 border-r border-gray-200">
                          <label className="text-[8px] font-black text-gray-400 uppercase block mb-1">Score</label>
                          <span className="text-xl font-black text-[#6C5CE7]">{sub.score}<span className="text-xs text-gray-400">/10</span></span>
                        </div>
                      )}
                      <span className={getStatusColor(sub.status)}>
                        {sub.status === "revision_requested" ? "Needs Revision" : "Task Completed"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-3">
  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">
    Deliverables
  </label>
  <div className="flex flex-wrap gap-3">
    {/* 1. GITHUB LINK */}
    {sub.githubLink && (
      <a 
        href={sub.githubLink} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="px-4 py-2 bg-[#2D3436] text-white text-[10px] font-black rounded-xl hover:bg-black transition-all shadow-sm"
      >
        LINK: GITHUB REPO
      </a>
    )}

    {/* 2. MULTIPLE FILES (ARRAY) */}
    {sub.files && sub.files.length > 0 && sub.files.map((f, i) => (
      <a 
        key={i} 
        href={f.url || f} // Checks if 'f' is an object with .url or just a string
        target="_blank" 
        rel="noopener noreferrer" 
        className="px-4 py-2 bg-[#6C5CE7] text-white text-[10px] font-black rounded-xl hover:bg-[#5b4bc4] transition-all shadow-md"
      >
        FILE: VIEW HERE {sub.files.length > 1 ? i + 1 : ""}
      </a>
    ))}

    {/* 3. SINGLE FILE FALLBACK (If the API returns 'file' instead of 'files') */}
    {!sub.files && sub.file?.url && (
      <a 
        href={sub.file.url} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="px-4 py-2 bg-[#6C5CE7] text-white text-[10px] font-black rounded-xl hover:bg-[#5b4bc4] transition-all shadow-md"
      >
        FILE: VIEW ATTACHMENT
      </a>
    )}
  </div>
</div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Mentor Feedback Details</label>
                      <div className="bg-yellow-50/40 p-5 rounded-2xl text-sm italic text-yellow-900 border border-yellow-100 min-h-[100px]">
                        "{sub.mentorFeedback || "No feedback recorded."}"
                      </div>
                    </div>
                  </div>

                  {/* ATTEMPT HISTORY */}
                  <div className="mt-10 pt-8 border-t border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Past Attempt History</p>
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                      {history.map((h, i) => (
                        <div key={i} className="min-w-[240px] bg-[#F5F6FA] p-5 rounded-2xl space-y-3 border border-transparent hover:border-purple-100 transition-all">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black text-gray-400 tracking-tighter uppercase">Attempt #{h.attempt}</span>
                            <span className="text-[9px] font-bold text-[#6C5CE7] uppercase">{h.status.replace('_', ' ')}</span>
                          </div>
                          <p className="text-xs text-gray-600 italic line-clamp-2">"{h.workSummary}"</p>
                          <div className="flex gap-3 pt-1 border-t border-gray-100">
                            {h.githubLink && <a href={h.githubLink} target="_blank" rel="noopener noreferrer" className="text-[9px] font-black text-[#6C5CE7] underline decoration-purple-200">REPO</a>}
                            {h.files?.length > 0 && <a href={h.files[0].url} target="_blank" rel="noopener noreferrer" className="text-[9px] font-black text-[#6C5CE7] underline decoration-purple-200">ATTACHMENT</a>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}