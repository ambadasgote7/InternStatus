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
        (a, b) => new Date(b.submittedAt) - new Date(a.submittedAt),
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
        return "bg-green-100 text-green-700 px-2 py-1 rounded";
      case "submitted":
      case "under_review":
        return "bg-yellow-100 text-yellow-700 px-2 py-1 rounded";
      case "revision_requested":
        return "bg-red-100 text-red-600 px-2 py-1 rounded";
      default:
        return "bg-gray-100 text-gray-600 px-2 py-1 rounded";
    }
  };

  /* ================= REVIEW ================= */

  const updateReviewField = (id, field, value) => {
    setReviewState((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
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

  /* ================= LOADING ================= */

  if (loading) return <div className="p-10">Loading...</div>;
  if (!task) return <div className="p-10">Task not found</div>;

  const pending = latestSubs.filter(
    (s) => s.status === "submitted" || s.status === "under_review",
  );

  const reviewed = latestSubs.filter(
    (s) => s.status === "approved" || s.status === "revision_requested",
  );

  /* ================= UI ================= */

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* TASK HEADER */}
      <div className="bg-white p-6 rounded-xl border space-y-3">
        <h1 className="text-xl font-bold">{task.title}</h1>
        <p className="text-sm text-gray-600">{task.description}</p>

        {task.resourceFiles?.length > 0 && (
          <div>
            <p className="text-xs text-gray-500">Resources:</p>
            {task.resourceFiles.map((f, i) => (
              <a
                key={i}
                href={f.url}
                target="_blank"
                className="block text-blue-600 text-sm"
              >
                📎 {f.fileName}
              </a>
            ))}
          </div>
        )}

        {/* CANCEL BUTTON */}
        {task.status !== "completed" && task.status !== "cancelled" && (
          <button
            onClick={async () => {
              if (!window.confirm("Cancel this task?")) return;

              try {
                await API.patch(`/tasks/${taskId}/cancel`);
                alert("Task cancelled");
                fetchTask();
              } catch (err) {
                alert(err.response?.data?.message || "Cancel failed");
              }
            }}
            className="mt-3 px-4 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
          >
            Cancel Task
          </button>
        )}

        {task.externalLink && (
          <a
            href={task.externalLink}
            target="_blank"
            className="text-blue-600 text-sm underline"
          >
            Open Resource
          </a>
        )}
      </div>

      {/* ================= PENDING ================= */}
      <div>
        <h2 className="font-semibold mb-3">Pending ({pending.length})</h2>

        {pending.length === 0 && (
          <div className="text-gray-400">Nothing pending</div>
        )}

        {pending.map((sub) => {
          const review = reviewState[sub._id] || {};

          return (
            <div
              key={sub._id}
              className="bg-white p-5 rounded-xl border space-y-3"
            >
              <p className="font-semibold">{sub.student?.fullName}</p>
              <p className="text-sm text-gray-500">
                {new Date(sub.submittedAt).toLocaleString()}
              </p>

              <p>{sub.workSummary}</p>

              {sub.githubLink && (
                <a
                  href={sub.githubLink}
                  target="_blank"
                  className="text-blue-600 underline text-sm"
                >
                  GitHub
                </a>
              )}

              {sub.files?.map((f, i) => (
                <a
                  key={i}
                  href={f.url}
                  target="_blank"
                  className="block text-blue-600 text-sm"
                >
                  📎 {f.fileName}
                </a>
              ))}

              <select
                value={review.status || ""}
                onChange={(e) =>
                  updateReviewField(sub._id, "status", e.target.value)
                }
                className="w-full border p-2 rounded"
              >
                <option value="">Decision</option>
                <option value="approved">Approve</option>
                <option value="revision_requested">Revision</option>
              </select>

              <textarea
                placeholder="Feedback"
                value={review.mentorFeedback || ""}
                onChange={(e) =>
                  updateReviewField(sub._id, "mentorFeedback", e.target.value)
                }
                className="w-full border p-2 rounded"
              />

              <input
                type="number"
                placeholder="Score"
                value={review.score || ""}
                onChange={(e) =>
                  updateReviewField(sub._id, "score", e.target.value)
                }
                className="w-full border p-2 rounded"
              />

              <button
                onClick={() => reviewSubmission(sub._id)}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                {reviewLoading === sub._id ? "Saving..." : "Submit"}
              </button>
            </div>
          );
        })}
      </div>

      {/* ================= REVIEWED ================= */}
      <div>
        <h2 className="font-semibold mb-3">Reviewed ({reviewed.length})</h2>

        {reviewed.map((sub) => {
          const history = (historyMap[sub.student] || []).sort(
            (a, b) => new Date(b.submittedAt) - new Date(a.submittedAt),
          );

          const isRevision = sub.status === "revision_requested";

          return (
            <div
              key={sub._id}
              className="bg-white p-6 rounded-xl border space-y-4"
            >
              {/* HEADER */}
              <div className="flex justify-between">
                <div>
                  <p className="font-semibold">{sub.student?.fullName}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(sub.submittedAt).toLocaleString()}
                  </p>
                </div>

                <span className={getStatusColor(sub.status)}>
                  {isRevision ? "Needs Revision" : "Approved"}
                </span>
              </div>

              {/* LATEST */}
              <p>{sub.workSummary}</p>

              {sub.githubLink && (
                <a
                  href={sub.githubLink}
                  target="_blank"
                  className="text-blue-600 text-sm underline"
                >
                  GitHub
                </a>
              )}

              {sub.files?.map((f, i) => (
                <a
                  key={i}
                  href={f.url}
                  target="_blank"
                  className="block text-blue-600 text-sm"
                >
                  📎 {f.fileName}
                </a>
              ))}

              {sub.mentorFeedback && (
                <div className="bg-amber-50 p-3 rounded text-sm">
                  Feedback: {sub.mentorFeedback}
                </div>
              )}

              {!isRevision && sub.score !== undefined && (
                <div>
                  Score: <b>{sub.score}/10</b>
                </div>
              )}

              {/* HISTORY */}
              <div className="border-t pt-3 space-y-2">
                <p className="text-xs text-gray-500 font-semibold">
                  Attempt Timeline
                </p>

                {history.map((h, i) => (
                  <div
                    key={i}
                    className="bg-gray-50 p-3 rounded text-xs space-y-1"
                  >
                    <div className="flex justify-between">
                      <span>Attempt {h.attempt}</span>
                      <span className={getStatusColor(h.status)}>
                        {h.status}
                      </span>
                    </div>

                    <div>{h.workSummary}</div>

                    {h.githubLink && (
                      <a
                        href={h.githubLink}
                        target="_blank"
                        className="text-blue-600"
                      >
                        GitHub
                      </a>
                    )}

                    {h.files?.map((f, i) => (
                      <a
                        key={i}
                        href={f.url}
                        target="_blank"
                        className="block text-blue-600"
                      >
                        📎 {f.fileName}
                      </a>
                    ))}

                    {h.mentorFeedback && (
                      <div className="text-amber-700">
                        Feedback: {h.mentorFeedback}
                      </div>
                    )}

                    {h.score !== undefined && <div>Score: {h.score}/10</div>}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
