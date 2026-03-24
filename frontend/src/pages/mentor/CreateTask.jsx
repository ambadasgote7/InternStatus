import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../api/api";

export default function CreateTask() {
  const { applicationId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    deadline: "",
    taskType: "internal",
    externalLink: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const createTask = async () => {
    if (!form.title) {
      alert("Task title required");
      return;
    }

    try {
      setLoading(true);

      await API.post("/tasks", {
        ...form,
        application: applicationId,
      });

      navigate(`/mentor/intern/${applicationId}/track`);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#333] font-sans pb-10 flex items-center justify-center p-4">
      <main className="max-w-3xl w-full px-4 md:px-6 py-6 flex flex-col gap-6">
        <div className="bg-[#fff] border border-[#e5e5e5] p-6 md:p-10 rounded-[20px] shadow-sm">
          <header className="mb-8 border-b border-[#e5e5e5] pb-4 text-center">
            <h1 className="text-[23px] font-black text-[#333] m-0 tracking-tight leading-tight">
              Create New Task
            </h1>
            <p className="text-[13px] font-bold text-[#333] opacity-60 m-0 mt-1 uppercase tracking-widest">
              Milestone Provisioning
            </p>
          </header>

          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                  Task Title
                </label>
                <input
                  name="title"
                  placeholder="e.g. Database Schema Design"
                  value={form.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-[13px] text-[#333] bg-[#fff] border border-[#333] rounded-[14px] outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                  Submission Deadline
                </label>
                <input
                  name="deadline"
                  type="date"
                  value={form.deadline}
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-[13px] text-[#333] bg-[#fff] border border-[#333] rounded-[14px] outline-none uppercase"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                  Classification
                </label>
                <select
                  name="taskType"
                  value={form.taskType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-[13px] text-[#333] bg-[#fff] border border-[#333] rounded-[14px] outline-none appearance-none cursor-pointer"
                >
                  <option value="internal">Internal Assignment</option>
                  <option value="external">External Link / Doc</option>
                </select>
              </div>

              {form.taskType === "external" && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                    Resource Link
                  </label>
                  <input
                    name="externalLink"
                    placeholder="https://resource-url.com"
                    value={form.externalLink}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-[13px] text-[#333] bg-[#fff] border border-[#333] rounded-[14px] outline-none"
                  />
                </div>
              )}
            </div>

            {form.taskType === "internal" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                  Requirements & Description
                </label>
                <textarea
                  name="description"
                  placeholder="Detail the technical requirements and deliverables..."
                  value={form.description}
                  onChange={handleChange}
                  rows="5"
                  className="w-full px-4 py-3 text-[13px] text-[#333] bg-[#fff] border border-[#333] rounded-[14px] outline-none resize-none"
                />
              </div>
            )}

            <div className="pt-6 border-t border-[#f9f9f9] flex justify-end">
              <button
                onClick={createTask}
                disabled={loading}
                className="w-full md:w-auto px-10 py-4 text-[13px] font-black text-[#fff] bg-[#111] border-none rounded-[14px] cursor-pointer hover:opacity-80 transition-opacity disabled:opacity-30 uppercase tracking-widest"
              >
                {loading ? "Processing..." : "Deploy Task"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
