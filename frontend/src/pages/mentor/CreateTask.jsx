import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../api/api";

export default function CreateTask({ applicationId: propAppId, onSuccess }) {
  const { applicationId: paramAppId } = useParams();
  const navigate = useNavigate();

  const applicationId = propAppId || paramAppId;

  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]); // ✅ FILE STATE

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
    if (!form.title.trim()) {
      alert("Task title required");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      Object.keys(form).forEach((key) => {
        formData.append(key, form[key]);
      });

      formData.append("application", applicationId);

      for (let i = 0; i < files.length; i++) {
        formData.append("resources", files[i]);
      }

      await API.post("/tasks", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (onSuccess) {
        onSuccess();
      } else {
        navigate(`/mentor/intern/${applicationId}/track`);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-6 md:p-10 font-['Nunito'] text-[#2D3436] animate-in fade-in zoom-in duration-500 shadow-2xl shadow-[#6C5CE7]/10 border border-[#F5F6FA]">
      
      {/* HEADER */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-black tracking-tight">
          Assign New <span className="text-[#6C5CE7]">Task</span>
        </h1>
        <p className="text-[#2D3436]/60 font-semibold mt-2">
          Fill in the details to set internship goals
        </p>
      </div>

      <div className="flex flex-col gap-5">
        
        {/* TITLE */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-black uppercase tracking-widest text-[#2D3436]/50 ml-2">Task Title</label>
          <input
            name="title"
            placeholder="e.g. Build API Endpoints"
            value={form.title}
            onChange={handleChange}
            className="p-4 bg-[#F5F6FA] border-2 border-transparent focus:border-[#6C5CE7] focus:bg-white rounded-2xl outline-none transition-all duration-300 font-bold placeholder:text-gray-400"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* DEADLINE */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-black uppercase tracking-widest text-[#2D3436]/50 ml-2">Deadline Date</label>
            <input
              type="date"
              name="deadline"
              value={form.deadline}
              onChange={handleChange}
              className="p-4 bg-[#F5F6FA] border-2 border-transparent focus:border-[#6C5CE7] focus:bg-white rounded-2xl outline-none transition-all duration-300 font-bold"
            />
          </div>

          {/* TYPE */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-black uppercase tracking-widest text-[#2D3436]/50 ml-2">Task Category</label>
            <select
              name="taskType"
              value={form.taskType}
              onChange={handleChange}
              className="p-4 bg-[#F5F6FA] border-2 border-transparent focus:border-[#6C5CE7] focus:bg-white rounded-2xl outline-none transition-all duration-300 font-bold appearance-none cursor-pointer"
            >
              <option value="internal">Internal Project</option>
              <option value="external">External Link / Resource</option>
            </select>
          </div>
        </div>

        {/* EXTERNAL LINK */}
        {form.taskType === "external" && (
          <div className="flex flex-col gap-2 animate-in slide-in-from-top-2 duration-300">
            <label className="text-xs font-black uppercase tracking-widest text-[#2D3436]/50 ml-2">Resource Link</label>
            <input
              name="externalLink"
              placeholder="https://github.com/resource-link"
              value={form.externalLink}
              onChange={handleChange}
              className="p-4 bg-[#F5F6FA] border-2 border-transparent focus:border-[#6C5CE7] focus:bg-white rounded-2xl outline-none transition-all duration-300 font-bold"
            />
          </div>
        )}

        {/* DESCRIPTION */}
        {form.taskType === "internal" && (
          <div className="flex flex-col gap-2 animate-in slide-in-from-top-2 duration-300">
            <label className="text-xs font-black uppercase tracking-widest text-[#2D3436]/50 ml-2">Task Description</label>
            <textarea
              rows="4"
              name="description"
              placeholder="Explain the technical requirements clearly..."
              value={form.description}
              onChange={handleChange}
              className="p-4 bg-[#F5F6FA] border-2 border-transparent focus:border-[#6C5CE7] focus:bg-white rounded-2xl outline-none transition-all duration-300 font-bold resize-none"
            />
          </div>
        )}

        {/* ✅ FILE UPLOAD */}
        <div className="flex flex-col gap-3 p-5 bg-[#F5F6FA] rounded-2xl border-2 border-dashed border-gray-200 hover:border-[#6C5CE7]/50 transition-colors">
          <label className="text-sm font-black text-[#2D3436]">
            Reference Attachments
          </label>
          <input
            type="file"
            multiple
            onChange={(e) => setFiles(e.target.files)}
            className="text-sm font-bold text-[#6C5CE7] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-[#6C5CE7] file:text-white hover:file:bg-[#5b4cc4] cursor-pointer"
          />
          <p className="text-[10px] text-gray-400 font-bold italic uppercase">Upload documents, images, or assets (Multi-select enabled)</p>
        </div>

        {/* BUTTON */}
        <button
          onClick={createTask}
          disabled={loading}
          className={`mt-4 w-full py-4 rounded-2xl font-black text-lg transition-all transform active:scale-95 shadow-xl ${
            loading 
            ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
            : "bg-[#6C5CE7] text-white hover:bg-[#5b4cc4] shadow-[#6C5CE7]/30"
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              Deploying Task...
            </span>
          ) : (
            "Assign Task to Intern"
          )}
        </button>
      </div>
    </div>
  );
}