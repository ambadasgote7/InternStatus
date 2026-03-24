import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api/api";

export default function MentorInternTrack() {
  const { applicationId } = useParams();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    deadline: "",
    taskType: "internal",
    externalLink: ""
  });

  const [files, setFiles] = useState([]);

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      deadline: "",
      taskType: "internal",
      externalLink: ""
    });
    setFiles([]);
  };

  const fetchTasks = async () => {
    try {
      const res = await API.get(`/tasks/application/${applicationId}`);
      setTasks(res.data?.data || []);
    } catch (err) {
      console.error("Task fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [applicationId]);

  const handleChange = (e) => {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 5) {
      alert("Maximum 5 files allowed");
      return;
    }
    setFiles(e.target.files);
  };

  const createTask = async () => {
    if (!form.title.trim()) {
      alert("Task title required");
      return;
    }

    try {
      setCreating(true);
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("deadline", form.deadline);
      formData.append("taskType", form.taskType);
      formData.append("application", applicationId);

      if (form.externalLink) {
        formData.append("externalLink", form.externalLink);
      }

      for (let i = 0; i < files.length; i++) {
        formData.append("resources", files[i]);
      }

      await API.post("/tasks", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      resetForm();
      setShowCreate(false);
      await fetchTasks();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create task");
    } finally {
      setCreating(false);
    }
  };

  const getStatusBadge = (status) => {
    let cls = "bg-[#f9f9f9] border-[#e5e5e5] text-[#333]";
    if (status === "completed") cls = "bg-[#f9f9f9] border-[#008000] text-[#008000]";
    else if (status === "submitted") cls = "bg-[#111] text-[#fff] border-[#111]";
    else if (status === "revision_requested") cls = "bg-[#fff] border-[#cc0000] text-[#cc0000]";

    return (
      <span className={`px-2.5 py-1 rounded-[10px] text-[9px] font-black uppercase tracking-widest border ${cls}`}>
        {status.replace("_", " ")}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center font-sans">
        <p className="text-[14px] font-bold text-[#333] animate-pulse m-0">
          Syncing Assignment Records...
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
              Intern Task Tracking
            </h1>
            <p className="text-[13px] font-bold text-[#333] opacity-60 m-0 uppercase tracking-widest">
              Milestone Management & Review
            </p>
          </div>
          <button
            onClick={() => {
              if (showCreate) resetForm();
              setShowCreate(!showCreate);
            }}
            className={`px-6 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-[14px] cursor-pointer transition-all border-none ${
              showCreate ? "bg-[#fff] border border-[#333] text-[#333]" : "bg-[#111] text-[#fff]"
            }`}
          >
            {showCreate ? "Cancel Provisioning" : "Create New Task"}
          </button>
        </header>

        {showCreate && (
          <div className="bg-[#fff] border border-[#e5e5e5] p-6 md:p-8 rounded-[20px] shadow-sm">
            <h2 className="text-[11px] font-bold text-[#333] opacity-50 m-0 uppercase tracking-widest border-b border-[#f9f9f9] pb-3 mb-6">
              New Assignment Parameters
            </h2>

            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold opacity-60 uppercase tracking-widest">Task Title</label>
                  <input
                    name="title"
                    placeholder="e.g. System Integration Module"
                    value={form.title}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-[13px] bg-[#fff] border border-[#333] rounded-[14px] outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold opacity-60 uppercase tracking-widest">Submission Deadline</label>
                  <input
                    type="date"
                    name="deadline"
                    value={form.deadline}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-[13px] bg-[#fff] border border-[#333] rounded-[14px] outline-none uppercase"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold opacity-60 uppercase tracking-widest">Assignment Type</label>
                  <select
                    name="taskType"
                    value={form.taskType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-[13px] border border-[#333] rounded-[14px] outline-none appearance-none"
                  >
                    <option value="internal">Internal Deliverable</option>
                    <option value="external">External Link / Repository</option>
                  </select>
                </div>

                {form.taskType === "external" && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold opacity-60 uppercase tracking-widest">External Resource URL</label>
                    <input
                      name="externalLink"
                      placeholder="https://github.com/..."
                      value={form.externalLink}
                      onChange={handleChange}
                      className="w-full px-4 py-3 text-[13px] border border-[#333] rounded-[14px] outline-none"
                    />
                  </div>
                )}
              </div>

              {form.taskType === "internal" && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold opacity-60 uppercase tracking-widest">Description & Requirements</label>
                  <textarea
                    name="description"
                    placeholder="Detailed instructions..."
                    value={form.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 text-[13px] border border-[#333] rounded-[14px] outline-none resize-none"
                  />
                </div>
              )}

              <div className="flex flex-col gap-3 p-5 bg-[#f9f9f9] border border-dashed border-[#e5e5e5] rounded-[20px]">
                <label className="text-[11px] font-bold opacity-60 uppercase tracking-widest text-center">Reference Resources</label>
                <div className="relative flex flex-col items-center">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="px-6 py-2 bg-[#fff] border border-[#333] rounded-[10px] text-[10px] font-black uppercase tracking-widest">
                    {files.length > 0 ? `${files.length} Files Selected` : "Upload Support Docs"}
                  </div>
                  <p className="text-[9px] font-bold opacity-40 uppercase mt-2">Maximum 5 items allowed</p>
                </div>
              </div>

              <div className="pt-4 border-t border-[#f9f9f9] flex justify-end">
                <button
                  onClick={createTask}
                  disabled={creating}
                  className="px-10 py-3.5 bg-[#111] text-[#fff] text-[12px] font-black uppercase tracking-widest rounded-[14px] border-none cursor-pointer hover:opacity-80 transition-opacity disabled:opacity-30"
                >
                  {creating ? "Processing..." : "Deploy Assignment"}
                </button>
              </div>
            </div>
          </div>
        )}

        {tasks.length === 0 ? (
          <div className="bg-[#fff] border-2 border-dashed border-[#e5e5e5] rounded-[20px] p-20 text-center">
            <p className="text-[13px] font-bold text-[#333] opacity-40 m-0 uppercase tracking-widest">
              No tasks provisioned for this internship
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map(task => (
              <div
                key={task._id}
                className="bg-[#fff] border border-[#e5e5e5] rounded-[20px] shadow-sm hover:border-[#333] transition-all flex flex-col"
              >
                <div className="p-6 flex-grow flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <h2 className="text-[16px] font-black text-[#333] m-0 leading-tight">
                      {task.title}
                    </h2>
                    {getStatusBadge(task.status)}
                  </div>

                  <div className="flex flex-col gap-3 py-4 border-y border-[#f9f9f9]">
                    {task.taskType === "internal" ? (
                      <p className="text-[12px] font-medium opacity-70 m-0 line-clamp-3">
                        {task.description}
                      </p>
                    ) : (
                      <a
                        href={task.externalLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-black text-[#111] underline uppercase tracking-widest"
                      >
                        External Resource
                      </a>
                    )}

                    <div className="flex flex-col gap-1 mt-2">
                      <div className="flex justify-between">
                        <span className="text-[10px] font-bold opacity-40 uppercase">Assigned</span>
                        <span className="text-[11px] font-bold">{task.assignedAt ? new Date(task.assignedAt).toLocaleDateString("en-IN") : "—"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[10px] font-bold opacity-40 uppercase">Deadline</span>
                        <span className="text-[11px] font-bold text-[#cc0000]">{task.deadline ? new Date(task.deadline).toLocaleDateString("en-IN") : "—"}</span>
                      </div>
                    </div>
                  </div>

                  {task.resourceFiles?.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Attachments</span>
                      <div className="flex flex-wrap gap-1.5">
                        {task.resourceFiles.map((file, idx) => (
                          <a
                            key={idx}
                            href={file.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] font-bold bg-[#f9f9f9] border border-[#e5e5e5] px-2 py-1 rounded-[6px] hover:border-[#333] transition-colors truncate max-w-[120px]"
                          >
                            {file.fileName}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-[#fcfcfc] border-t border-[#f9f9f9] rounded-b-[20px]">
                  <button
                    onClick={() => navigate(`/mentor/tasks/${task._id}`)}
                    className="w-full py-2.5 bg-[#f9f9f9] border border-[#333] text-[#333] text-[11px] font-black uppercase tracking-widest rounded-[10px] hover:bg-[#333] hover:text-[#fff] transition-all cursor-pointer"
                  >
                    Manage Deliverable
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}