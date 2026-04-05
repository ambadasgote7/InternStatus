import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchDashboard } from "../../store/dashboardSlice";
import {
  Users,
  Briefcase,
  Clock,
  Star,
  BarChart2,
  ListTodo,
  Users as UsersIcon,
  AlertTriangle,
  Activity,
  ChevronRight,
  Zap,
<<<<<<< HEAD
  CheckCircle2, // ✅ ADD THIS
=======
>>>>>>> c58615c (final year commit)
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────
// REUSABLE COMPONENTS
// ─────────────────────────────────────────────────────────────────────
const KpiCard = ({ label, value, sub, onClick, warn, icon: Icon }) => (
  <div
    onClick={onClick}
    className={`bg-[#FFFFFF] border border-[#F5F6FA] rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-8 flex flex-col justify-between hover:shadow-[0_20px_50px_rgba(108,92,231,0.08)] hover:-translate-y-1 transition-all duration-300 group cursor-pointer
      ${warn ? "hover:border-amber-300" : "hover:border-[#6C5CE7]/30"}
    `}
  >
    <div className="flex justify-between items-start mb-4">
      <p className="text-[11px] font-black uppercase tracking-widest text-[#2D3436] opacity-50 group-hover:text-[#6C5CE7] transition-colors m-0">
        {label}
      </p>
      {Icon && (
        <div
          className={`p-3 rounded-[16px] group-hover:scale-110 transition-transform duration-300 shadow-sm
          ${warn ? "bg-amber-50" : "bg-[#F5F6FA] group-hover:bg-[#6C5CE7]/10"}
        `}
        >
          <Icon
            className={`w-5 h-5 ${warn ? "text-amber-500" : "text-[#2D3436] group-hover:text-[#6C5CE7]"}`}
            strokeWidth={2.5}
          />
        </div>
      )}
    </div>

    <div>
      <h3
        className={`text-[36px] font-black leading-none m-0 transition-colors transform origin-left group-hover:scale-105
        ${warn ? "text-amber-500" : "text-[#2D3436] group-hover:text-[#6C5CE7]"}
      `}
      >
        {value ?? "—"}
      </h3>
      {sub && (
        <p className="text-[11px] font-bold text-[#2D3436] opacity-40 mt-3 m-0">
          {sub}
        </p>
      )}
    </div>
  </div>
);

const SectionCard = ({
  title,
  icon: Icon,
  children,
  action,
  className = "",
}) => (
  <div
    className={`bg-[#FFFFFF] border border-[#F5F6FA] rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] flex flex-col h-full ${className}`}
  >
    <div className="px-8 py-6 border-b border-[#F5F6FA] bg-[#FFFFFF] flex items-center justify-between">
      <div className="flex items-center gap-3">
        {Icon && <Icon className="w-5 h-5 text-[#6C5CE7]" />}
        <h2 className="text-[13px] font-black text-[#6C5CE7] uppercase tracking-[0.2em] m-0 border-l-4 border-[#6C5CE7] pl-4 flex items-center h-5">
          {title}
        </h2>
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="text-[10px] font-black text-[#2D3436] opacity-50 hover:opacity-100 hover:text-[#6C5CE7] uppercase tracking-widest flex items-center gap-1 transition-all outline-none bg-transparent border-none cursor-pointer group"
        >
          {action.label}{" "}
          <ChevronRight className="w-3 h-3 transform group-hover:translate-x-1 transition-transform" />
        </button>
      )}
    </div>
    <div className="p-8 flex-1 flex flex-col">{children}</div>
  </div>
);

const ActionItem = ({ label, onClick, icon: Icon }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center justify-between px-6 py-4 rounded-[16px] bg-[#FFFFFF] hover:bg-[#F5F6FA] text-[#2D3436] border border-[#F5F6FA] hover:border-[#6C5CE7] transition-all duration-300 group outline-none cursor-pointer shadow-sm hover:shadow-md transform hover:-translate-y-0.5 active:scale-95"
  >
    <div className="flex items-center gap-3">
      {Icon && (
        <Icon className="w-4 h-4 text-[#6C5CE7] opacity-70 group-hover:opacity-100 transition-opacity" />
      )}
      <span className="text-[11px] font-black uppercase tracking-widest group-hover:text-[#6C5CE7] transition-colors">
        {label}
      </span>
    </div>
    <ChevronRight className="w-5 h-5 opacity-40 group-hover:opacity-100 group-hover:text-[#6C5CE7] transition-all transform group-hover:translate-x-1" />
  </button>
);

const StatusBadge = ({ status }) => {
  let cls = "bg-[#F5F6FA] text-[#2D3436] opacity-60 border-transparent";
  let dotCls = "bg-[#2D3436] opacity-40";

  if (["selected", "ongoing", "completed"].includes(status)) {
    cls = "bg-emerald-50 text-emerald-600 border-emerald-200";
    dotCls = "bg-emerald-500";
  } else if (["applied"].includes(status)) {
    cls = "bg-[#2D3436] text-[#FFFFFF] border-[#2D3436]";
    dotCls = "bg-[#FFFFFF]";
  } else if (["terminated", "not_applied"].includes(status)) {
    cls = "bg-rose-50 text-rose-600 border-rose-200";
    dotCls = "bg-rose-500";
  }

  return (
    <span
      className={`inline-flex items-center px-3 py-1.5 rounded-[12px] text-[9px] font-black uppercase tracking-widest shadow-sm border transition-all duration-300 ${cls}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full mr-2 ${dotCls}`}></span>
      {status ? status.replace("_", " ") : "UNKNOWN"}
    </span>
  );
};

const TableRow = ({ student, onTrack }) => (
  <tr
    onClick={() => onTrack(student.applicationId)}
    className="border-b border-[#F5F6FA] transition-colors duration-300 group cursor-pointer hover:bg-[#F5F6FA]/50"
  >
    <td className="px-4 py-4 text-[13px] font-bold text-[#2D3436] opacity-80 group-hover:text-[#6C5CE7] transition-colors">
      {student.name || "Unknown"}
    </td>
    <td className="px-4 py-4">
      <StatusBadge status={student.status} />
    </td>
    <td className="px-4 py-4 w-1/4">
      <div className="flex items-center gap-3">
        <span className="text-[12px] font-black text-[#6C5CE7] w-8">
          {student.completionPct || 0}%
        </span>
        <div className="flex-1 bg-[#F5F6FA] rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-[#6C5CE7] h-full rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${student.completionPct || 0}%` }}
          />
        </div>
      </div>
    </td>
    <td className="px-4 py-4 text-[12px] font-black text-[#2D3436] opacity-50">
      <span className="bg-[#FFFFFF] px-2 py-1 rounded-md shadow-sm border border-[#F5F6FA]">
        {student.avgScore != null ? `${student.avgScore}/10` : "—"}
      </span>
    </td>
  </tr>
);

// ─────────────────────────────────────────────────────────────────────
// MAIN DASHBOARD
// ─────────────────────────────────────────────────────────────────────
export default function FacultyDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { data, loading, error } = useSelector(
    (state) => state.dashboard || {},
  );
  const userName = useSelector(
    (state) => state.user?.user?.fullName || "Faculty",
  );

  useEffect(() => {
    dispatch(fetchDashboard());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] flex items-center justify-center font-['Nunito'] transition-all duration-300">
        <div className="flex flex-col items-center gap-4 animate-in fade-in duration-700">
          <div className="w-12 h-12 border-4 border-[#F5F6FA] border-t-[#6C5CE7] rounded-full animate-spin"></div>
          <p className="text-[12px] font-black text-[#6C5CE7] animate-pulse uppercase tracking-[0.2em] m-0">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFFFF] font-['Nunito'] p-4">
        <div className="bg-rose-50 border border-rose-200 rounded-[24px] p-10 text-center max-w-md shadow-sm animate-in zoom-in duration-500">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4 animate-bounce" />
          <p className="text-rose-700 font-black text-[14px] mb-6 uppercase tracking-widest">
            {error}
          </p>
          <button
            onClick={() => dispatch(fetchDashboard())}
            className="flex items-center justify-center gap-3 w-full px-6 py-4 bg-[#FFFFFF] text-[#2D3436] border border-rose-200 rounded-[16px] text-[11px] font-black uppercase tracking-widest hover:border-rose-400 hover:text-rose-600 hover:shadow-sm transition-all duration-300 outline-none transform active:scale-95 cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const {
    kpis = {},
    pipeline = {},
    taskStats = {},
    studentStats = [],
    atRisk = [],
    recentActivity = [],
    actions = [],
  } = data;

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#2D3436] font-['Nunito'] pb-12 transition-colors duration-500 selection:bg-[#6C5CE7]/20 selection:text-[#6C5CE7]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* HEADER (Smooth scrolling block) */}
        <div className="bg-[#F5F6FA] border border-transparent rounded-[32px] p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
          <div className="flex flex-col gap-2">
            <h1 className="text-[28px] md:text-4xl font-black text-[#2D3436] m-0 tracking-tighter uppercase leading-tight">
              Welcome,{" "}
              <span className="text-[#6C5CE7]">
                {String(userName).split(" ")[0]}
              </span>
            </h1>
            <p className="text-[12px] font-black text-[#2D3436] opacity-40 uppercase tracking-[0.2em] m-0">
              Internship supervision overview
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {actions?.map((a) => (
              <ActionItem
                key={a.route}
                label={a.label}
                onClick={() => navigate(a.route)}
                icon={Zap}
              />
            ))}
          </div>
        </div>

        {/* KPI SECTION */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          <KpiCard
            label="Total Students"
            value={kpis.totalStudents}
            icon={UsersIcon}
            onClick={() => navigate("/faculty/students")}
          />
          <KpiCard
            label="Active Internships"
            value={kpis.activeInternships}
            icon={Briefcase}
            onClick={() => navigate("/faculty/students")}
          />
          <KpiCard
            label="Pending Reviews"
            value={kpis.pendingTaskReviews}
            icon={Clock}
            warn={kpis.pendingTaskReviews > 0}
            onClick={() => navigate("/faculty/students")}
          />
          <KpiCard
            label="Avg Score"
            value={
              typeof kpis.avgStudentScore === "number" &&
              !isNaN(kpis.avgStudentScore)
                ? `${kpis.avgStudentScore.toFixed(1)}/10`
                : "—"
            }
            sub={`${kpis.completedInternships ?? 0} completed`}
            icon={Star}
            warn={
              typeof kpis.avgStudentScore === "number" &&
              kpis.avgStudentScore < 5
            }
          />
        </div>

        {/* PIPELINE + TASK STATS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pipeline */}
          <SectionCard title="Application Pipeline" icon={BarChart2}>
            <div className="grid grid-cols-2 gap-4 flex-1">
              {Object.entries(pipeline).map(([k, v]) => (
                <div
                  key={k}
                  className="bg-[#F5F6FA] rounded-[20px] p-6 flex flex-col justify-center items-center text-center border border-transparent hover:border-[#6C5CE7]/20 transition-colors group"
                >
                  <p className="text-[40px] font-black text-[#2D3436] leading-none m-0 group-hover:scale-110 transition-transform">
                    {v}
                  </p>
                  <p className="text-[10px] font-black text-[#2D3436] opacity-40 uppercase tracking-[0.2em] mt-3 m-0">
                    {k.replace(/_/g, " ")}
                  </p>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Task Overview */}
          <SectionCard title="Task Overview" icon={ListTodo}>
            <div className="grid grid-cols-2 gap-4 flex-1">
              {[
                ["Total Tasks", taskStats.totalTasks, "#2D3436"],
                ["Pending", taskStats.pending, "#F59E0B"],
                ["Under Review", taskStats.under_review, "#6C5CE7"],
                ["Revision", taskStats.revision_requested, "#EF4444"],
              ].map(([label, val, color]) => (
                <div
                  key={label}
                  className="bg-[#F5F6FA] rounded-[20px] p-6 flex flex-col justify-center items-center text-center border border-transparent hover:border-[#6C5CE7]/20 transition-colors group relative overflow-hidden"
                >
                  <div
                    className="absolute top-0 left-0 w-full h-1"
                    style={{ backgroundColor: color }}
                  ></div>
                  <p className="text-[40px] font-black text-[#2D3436] leading-none m-0 group-hover:scale-110 transition-transform">
                    {val ?? 0}
                  </p>
                  <p className="text-[10px] font-black text-[#2D3436] opacity-40 uppercase tracking-[0.2em] mt-3 m-0">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* STUDENT LIST */}
        <SectionCard title="Student List" icon={Users}>
          {studentStats.length > 0 ? (
            <div className="overflow-x-auto no-scrollbar flex-1">
              <table className="w-full text-left border-collapse min-w-max">
                <thead>
                  <tr className="border-b border-[#F5F6FA] bg-[#F5F6FA] bg-opacity-50">
                    <th className="px-4 py-3 text-[10px] font-black text-[#2D3436] opacity-40 uppercase tracking-[0.15em] rounded-tl-[12px]">
                      Name
                    </th>
                    <th className="px-4 py-3 text-[10px] font-black text-[#2D3436] opacity-40 uppercase tracking-[0.15em]">
                      Status
                    </th>
                    <th className="px-4 py-3 text-[10px] font-black text-[#2D3436] opacity-40 uppercase tracking-[0.15em]">
                      Progress
                    </th>
                    <th className="px-4 py-3 text-[10px] font-black text-[#2D3436] opacity-40 uppercase tracking-[0.15em] rounded-tr-[12px]">
                      Score
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {studentStats.map((s, index) => (
                    <TableRow
                      key={s.id || s.applicationId || `student-${index}`}
                      student={s}
                      onTrack={(id) => navigate(`/faculty/students/${id}`)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-[#F5F6FA] p-8 text-center rounded-[20px] border-2 border-dashed border-[#6C5CE7]/20 flex-1 flex items-center justify-center">
              <p className="text-[12px] font-black text-[#2D3436] opacity-40 uppercase tracking-[0.2em] m-0">
                No students assigned.
              </p>
            </div>
          )}
        </SectionCard>

        {/* AT-RISK & ACTIVITY */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <SectionCard
            title="At-Risk Students"
            icon={AlertTriangle}
            className={
              atRisk && atRisk.length > 0
                ? "border-rose-100 shadow-[0_8px_30px_rgba(225,29,72,0.05)]"
                : ""
            }
            action={{
              label: "Review All",
              onClick: () => navigate("/faculty/at-risk"),
            }}
          >
            {atRisk && atRisk.length > 0 ? (
              <div className="space-y-3 flex-1">
                {atRisk.slice(0, 5).map((student, index) => (
                  <div
                    key={student.id || `atrisk-${index}`}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-rose-50 border border-rose-200 rounded-[16px] px-5 py-4 cursor-pointer hover:bg-rose-100 hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5 animate-in fade-in fill-mode-both group"
                    onClick={() => {
                      const id = student.id || student.studentId;
                      if (id) navigate(`/faculty/at-risk/${id}`);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(225,29,72,0.6)] animate-pulse"></div>
                      <span className="text-[14px] font-bold text-[#2D3436] opacity-90 group-hover:text-[#6C5CE7] transition-colors">
                        {student.name}
                      </span>
                    </div>
                    <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest bg-[#FFFFFF] px-3 py-1.5 rounded-lg border border-rose-100 shadow-sm">
                      {student.reason}
                    </span>
                  </div>
                ))}
                {atRisk.length > 5 && (
                  <p className="text-[11px] font-black text-[#2D3436] opacity-40 text-center mt-4 uppercase tracking-[0.2em] bg-[#F5F6FA] py-2 rounded-xl">
                    + {atRisk.length - 5} more require attention
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-[#F5F6FA] p-8 text-center rounded-[20px] border-2 border-dashed border-emerald-200 flex-1 flex flex-col items-center justify-center gap-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 animate-bounce" />
                <p className="text-[12px] font-black text-[#2D3436] opacity-60 uppercase tracking-[0.2em] m-0">
                  All students on track
                </p>
              </div>
            )}
          </SectionCard>

          <SectionCard title="Recent Activity" icon={Activity}>
            {recentActivity && recentActivity.length > 0 ? (
              <div className="space-y-2 flex-1">
                {recentActivity.map((a, index) => {
                  // Map colors for the dot
                  const dotColor =
                    a.type === "approval"
                      ? "bg-emerald-500"
                      : a.type === "submission"
                        ? "bg-blue-500"
                        : a.type === "application"
                          ? "bg-purple-500"
                          : a.type === "warning"
                            ? "bg-rose-500"
                            : "bg-[#6C5CE7]";

                  return (
                    <div
                      key={index}
                      style={{ animationDelay: `${index * 50}ms` }}
                      className="flex items-center gap-4 py-3 border-b border-[#F5F6FA] last:border-0 hover:bg-[#F5F6FA]/50 -mx-4 px-4 rounded-[16px] transition-colors group animate-in fade-in fill-mode-both"
                    >
                      <div className="p-2 bg-[#F5F6FA] rounded-[10px] group-hover:bg-[#FFFFFF] group-hover:shadow-sm transition-all">
                        <div
                          className={`w-2.5 h-2.5 rounded-full ${dotColor} shadow-sm`}
                        ></div>
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
                        <p className="text-[13px] font-bold text-[#2D3436] opacity-80 m-0 truncate group-hover:text-[#6C5CE7] transition-colors">
                          {a.label}
                        </p>
                        <p className="text-[10px] font-black text-[#2D3436] opacity-40 uppercase tracking-widest m-0 shrink-0">
                          {a.time
                            ? new Date(a.time).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "—"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-[#F5F6FA] p-8 text-center rounded-[20px] border-2 border-dashed border-[#6C5CE7]/20 flex-1 flex items-center justify-center">
                <p className="text-[12px] font-black text-[#2D3436] opacity-40 uppercase tracking-[0.2em] m-0">
                  No recent activity.
                </p>
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
