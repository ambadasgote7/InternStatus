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
      return;
    }

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        alert(`Invalid type: ${file.type}`);
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

      alert("Submitted");

      setForm({
        workSummary: "",
        githubLink: "",
        technologiesUsed: "",
        files: [],
      });

      fetchTask();
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    } finally {
      setSubmitting(false);
    }
  };

  /* ================= STATUS ================= */

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "submitted":
      case "under_review":
        return "bg-yellow-100 text-yellow-700";
      case "revision_requested":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  /* ================= LOADING ================= */

  if (loading) return <div className="p-10">Loading...</div>;
  if (!task) return <div className="p-10">Task not found</div>;

  /* ================= UI ================= */

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* ===== TASK ===== */}
      <div className="bg-white p-6 rounded-xl border space-y-3">
        <div className="flex justify-between">
          <h1 className="font-bold text-lg">{task.title}</h1>
          <span
            className={`text-xs px-3 py-1 rounded ${getStatusColor(task.status)}`}
          >
            {task.status}
          </span>
        </div>

        <p className="text-sm text-gray-600">{task.description}</p>

        {/* RESOURCE FILES */}
        {task.resourceFiles?.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 mb-1">Resources:</p>
            {task.resourceFiles.map((f, i) => (
              <a
                key={i}
                href={f.url}
                target="_blank"
                rel="noreferrer"
                className="block text-blue-600 text-sm"
              >
                {f.fileName}
              </a>
            ))}
          </div>
        )}

        {/* EXTERNAL LINK */}
        {task.externalLink && (
          <a
            href={task.externalLink}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 text-sm underline"
          >
            Open Resource
          </a>
        )}
      </div>

      {/* ===== SUBMISSIONS ===== */}
      <div className="space-y-4">
        {submissions.map((sub) => (
          <div
            key={sub._id}
            className="bg-white p-5 rounded-xl border space-y-3"
          >
            <div className="flex justify-between text-xs">
              <span>Attempt {sub.attempt}</span>
              <span className={getStatusColor(sub.status)}>{sub.status}</span>
            </div>

            <p className="text-sm">{sub.workSummary}</p>

            {/* TECH */}
            {sub.technologiesUsed?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {sub.technologiesUsed.map((t, i) => (
                  <span
                    key={i}
                    className="bg-blue-100 text-xs px-2 py-1 rounded"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}

            {/* GITHUB */}
            {sub.githubLink && (
              <a
                href={sub.githubLink}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 text-sm underline"
              >
                View GitHub
              </a>
            )}

            {/* FILES */}
            {sub.files?.length > 0 && (
              <div>
                {sub.files.map((f, i) => (
                  <a
                    key={i}
                    href={f.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-sm text-blue-600"
                  >
                    {f.fileName}
                  </a>
                ))}
              </div>
            )}

            {/* FEEDBACK */}
            {sub.mentorFeedback && (
              <div className="bg-yellow-50 p-3 text-sm rounded">
                {sub.mentorFeedback}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ===== FORM ===== */}
      {canSubmit && (
        <div className="bg-white p-5 rounded-xl border space-y-3">
          <textarea
            placeholder="Work summary"
            value={form.workSummary}
            onChange={(e) => setForm({ ...form, workSummary: e.target.value })}
            className="w-full border p-2 rounded"
          />

          <input
            placeholder="Technologies (comma separated)"
            value={form.technologiesUsed}
            onChange={(e) =>
              setForm({ ...form, technologiesUsed: e.target.value })
            }
            className="w-full border p-2 rounded"
          />

          <input
            placeholder="GitHub link"
            value={form.githubLink}
            onChange={(e) => setForm({ ...form, githubLink: e.target.value })}
            className="w-full border p-2 rounded"
          />

          <input type="file" multiple onChange={handleFileChange} />

          <button
            onClick={submitTask}
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-2 rounded"
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      )}
    </div>
  );
}
