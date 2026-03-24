import { useNavigate } from "react-router-dom";

export default function TaskList({
  tasks = [],
  role = "mentor",
  onSubmitTask,
}) {
  const navigate = useNavigate();

  if (!tasks.length) {
    return (
      <div className="text-[14px] font-bold text-[#333] opacity-60 py-8 text-center border-2 border-dashed border-[#e5e5e5] rounded-[20px]">
        No tasks assigned yet
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tasks.map((task) => (
        <div
          key={task._id}
          className="bg-[#fff] border border-[#e5e5e5] rounded-[20px] p-5 flex flex-col justify-between shadow-sm hover:border-[#333] transition-colors group"
        >
          <div>
            <h2 className="text-[16px] font-black text-[#333] m-0 mb-1 leading-tight line-clamp-1">
              {task.title}
            </h2>

            {task.taskType === "internal" && (
              <p className="text-[13px] text-[#333] opacity-70 leading-[18px] m-0 mt-2 line-clamp-2">
                {task.description}
              </p>
            )}

            {task.taskType === "external" && (
              <a
                href={task.externalLink}
                target="_blank"
                rel="noreferrer"
                className="inline-block mt-2 text-[13px] font-bold text-[#111] underline hover:opacity-70 transition-opacity"
              >
                External Task ↗
              </a>
            )}

            <div className="mt-4 text-[11px] font-bold text-[#333] opacity-50 uppercase tracking-widest">
              Deadline:{" "}
              {task.deadline
                ? new Date(task.deadline).toLocaleDateString()
                : "None"}
            </div>
          </div>

          <div className="mt-5 flex justify-between items-center pt-4 border-t border-[#f9f9f9]">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#333] bg-[#f9f9f9] border border-[#e5e5e5] px-3 py-1.5 rounded-[14px]">
              {task.status}
            </span>

            {role === "mentor" && (
              <button
                onClick={() => navigate(`/mentor/tasks/${task._id}`)}
                className="px-4 py-2 bg-[#111] text-[#fff] rounded-[14px] text-[12px] font-bold hover:opacity-80 transition-opacity cursor-pointer border-none"
              >
                View
              </button>
            )}

            {role === "student" && (
              <button
                onClick={() => onSubmitTask(task)}
                className="px-4 py-2 bg-[#111] text-[#fff] rounded-[14px] text-[12px] font-bold hover:opacity-80 transition-opacity cursor-pointer border-none"
              >
                Submit
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
  