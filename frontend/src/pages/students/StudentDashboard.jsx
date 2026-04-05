import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchDashboard } from "../../store/dashboardSlice";
import {
  Briefcase,
  CheckCircle2,
  Clock,
  Star,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
  Activity,
  BarChart2,
  FileText,
  User,
  ArrowRight,
  RefreshCw,
  Circle,
  ListTodo,
  Zap,
} from "lucide-react";

// ─────────────────────────────────────────────
// REUSABLE COMPONENTS
// ─────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const map = {
    applied: "bg-[#2D3436] text-[#FFFFFF] shadow-sm",
    shortlisted: "bg-[#2D3436] text-[#FFFFFF] shadow-sm",
    selected:
      "bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-sm",
    offer_accepted:
      "bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-sm",
    ongoing:
      "bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-sm",
    completed:
      "bg-[#F5F6FA] text-[#2D3436] opacity-60 border border-transparent",
    submitted: "bg-[#2D3436] text-[#FFFFFF] shadow-sm",
    under_review: "bg-[#2D3436] text-[#FFFFFF] shadow-sm",
    revision_requested:
      "bg-rose-50 text-rose-600 border border-rose-200 shadow-sm",
    urgent: "bg-rose-50 text-rose-600 border border-rose-200 shadow-sm",
    high: "bg-amber-50 text-amber-600 border border-amber-200 shadow-sm",
    normal: "bg-[#F5F6FA] text-[#2D3436] opacity-60 border border-transparent",
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1.5 rounded-[12px] text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${map[status] || "bg-[#F5F6FA] text-[#2D3436] opacity-60"}`}
    >
      {status?.replace("_", " ")}
    </span>
  );
};

const SectionCard = ({ title, icon: Icon, children, className = "" }) => (
  <div
    className={`bg-[#FFFFFF] border border-[#F5F6FA] rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] flex flex-col ${className}`}
  >
    {title && (
      <div className="px-8 py-6 border-b border-[#F5F6FA] bg-[#FFFFFF] flex items-center gap-3">
        {Icon && <Icon className="w-5 h-5 text-[#6C5CE7]" />}
        <h2 className="text-[13px] font-black text-[#6C5CE7] uppercase tracking-[0.2em] m-0 border-l-4 border-[#6C5CE7] pl-4 flex items-center h-5">
          {title}
        </h2>
      </div>
    )}
    <div className="p-8 flex-1 flex flex-col w-full overflow-hidden">
      {children}
    </div>
  </div>
);

const KpiCard = ({ label, value, icon: Icon, color, sub, onClick }) => {
  let accentColor = "text-[#2D3436]";
  let iconBg = "bg-[#F5F6FA]";
  if (color?.includes("blue")) {
    accentColor = "text-[#6C5CE7]";
    iconBg = "bg-[#6C5CE7]/10";
  } else if (color?.includes("green")) {
    accentColor = "text-emerald-500";
    iconBg = "bg-emerald-50";
  } else if (color?.includes("yellow")) {
    accentColor = "text-amber-500";
    iconBg = "bg-amber-50";
  }

  return (
    <div
      onClick={onClick}
      className="bg-[#FFFFFF] border border-[#F5F6FA] rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-8 flex flex-col justify-between hover:shadow-[0_20px_50px_rgba(108,92,231,0.08)] hover:-translate-y-1 hover:border-[#6C5CE7]/30 transition-all duration-300 group cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <p className="text-[11px] font-black uppercase tracking-widest text-[#2D3436] opacity-50 group-hover:text-[#6C5CE7] transition-colors m-0">
          {label}
        </p>
        <div
          className={`p-3 rounded-[16px] ${iconBg} group-hover:scale-110 transition-transform duration-300 shadow-sm`}
        >
          <Icon className={`w-5 h-5 ${accentColor}`} strokeWidth={2.5} />
        </div>
      </div>
      <div>
        <p
          className={`text-[36px] font-black leading-none m-0 transition-colors transform origin-left group-hover:scale-105 ${accentColor}`}
        >
          {value ?? "—"}
        </p>
        {sub && (
          <p className="text-[11px] font-bold text-[#2D3436] opacity-40 mt-3 m-0">
            {sub}
          </p>
        )}
      </div>
    </div>
  );
};

const ActionItem = ({ action, onClick }) => {
  const urgencyStyle = {
    urgent: "bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700",
    high: "bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-700",
    normal:
      "bg-[#FFFFFF] border border-[#F5F6FA] hover:border-[#6C5CE7] hover:bg-[#F5F6FA] text-[#2D3436]",
  };
  const iconStyle = {
    urgent: "text-rose-500",
    high: "text-amber-500",
    normal: "text-[#6C5CE7]",
  };

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-6 py-4 rounded-[16px] transition-all duration-300 text-left outline-none cursor-pointer shadow-sm hover:shadow-md transform hover:-translate-y-0.5 active:scale-95 group ${urgencyStyle[action.priority] || urgencyStyle.normal}`}
    >
      <div className="flex items-center gap-3 truncate pr-4">
        {action.priority === "urgent" ? (
          <AlertTriangle className={`w-4 h-4 shrink-0 ${iconStyle.urgent}`} />
        ) : action.priority === "high" ? (
          <Zap className={`w-4 h-4 shrink-0 ${iconStyle.high}`} />
        ) : (
          <Circle
            className={`w-4 h-4 shrink-0 ${iconStyle.normal} opacity-70 group-hover:opacity-100 transition-opacity`}
          />
        )}
        <span
          className={`text-[11px] font-black uppercase tracking-widest transition-colors truncate ${action.priority === "normal" ? "group-hover:text-[#6C5CE7]" : ""}`}
        >
          {action.label}
        </span>
      </div>
      <ChevronRight
        className={`w-5 h-5 shrink-0 opacity-40 group-hover:opacity-100 transition-all transform group-hover:translate-x-1 ${action.priority === "normal" ? "group-hover:text-[#6C5CE7]" : ""}`}
      />
    </button>
  );
};

// ─────────────────────────────────────────────
// PIPELINE BAR
// ─────────────────────────────────────────────
const PipelineBar = ({ pipeline }) => {
  const stages = [
    { key: "applied", label: "Applied", color: "bg-[#2D3436]" },
    { key: "shortlisted", label: "Shortlisted", color: "bg-[#6C5CE7]" },
    { key: "selected", label: "Selected", color: "bg-emerald-400" },
    { key: "ongoing", label: "Ongoing", color: "bg-emerald-500" },
    { key: "completed", label: "Completed", color: "bg-[#2D3436] opacity-40" },
  ];
  const max = Math.max(...stages.map((s) => pipeline[s.key] || 0), 1);

  return (
    <div className="space-y-6 flex-1 flex flex-col justify-center w-full">
      {stages.map(({ key, label, color }) => {
        const val = pipeline[key] || 0;
        const pct = Math.round((val / max) * 100);
        return (
          <div key={key} className="flex items-center gap-4 group w-full">
            <span className="text-[10px] md:text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-widest w-20 md:w-24 shrink-0 group-hover:text-[#6C5CE7] transition-colors truncate">
              {label}
            </span>
            <div className="flex-1 bg-[#F5F6FA] rounded-full h-2.5 overflow-hidden shadow-inner">
              <div
                className={`${color} h-full rounded-full transition-all duration-1000 ease-out relative`}
                style={{ width: `${pct}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FFFFFF]/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
              </div>
            </div>
            <div className="w-8 shrink-0 flex justify-end">
              <span className="text-[13px] font-black text-[#2D3436] group-hover:scale-110 transition-transform">
                {val}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─────────────────────────────────────────────
// TASK DONUT
// ─────────────────────────────────────────────
const TaskDonut = ({ analytics }) => {
  const segments = [
    { key: "pending", label: "Pending", color: "#2D3436" },
    { key: "submitted", label: "Submitted", color: "#6C5CE7" },
    { key: "under_review", label: "Review", color: "#F59E0B" },
    { key: "revision_requested", label: "Revision", color: "#EF4444" },
    { key: "completed", label: "Completed", color: "#10B981" },
  ];

  const total =
    segments.reduce((s, seg) => s + (analytics[seg.key] || 0), 0) || 1;
  let cumulative = 0;
  const r = 36,
    cx = 48,
    cy = 48,
    circumference = 2 * Math.PI * r;

  return (
    <div className="flex flex-col 2xl:flex-row items-center justify-center gap-6 bg-[#F5F6FA] p-6 rounded-[24px] w-full">
      <div className="relative group shrink-0">
        <div className="absolute inset-0 bg-[#6C5CE7]/5 rounded-full blur-xl group-hover:bg-[#6C5CE7]/10 transition-colors duration-500"></div>
        <svg
          width="96"
          height="96"
          className="shrink-0 relative z-10 transform group-hover:scale-105 transition-transform duration-500"
        >
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="12"
          />
          {segments.map((seg) => {
            const val = analytics[seg.key] || 0;
            const pct = val / total;
            const dash = pct * circumference;
            const offset = circumference - cumulative * circumference;
            cumulative += pct;
            if (!val) return null;
            return (
              <circle
                key={seg.key}
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={seg.color}
                strokeWidth="12"
                strokeDasharray={`${dash} ${circumference}`}
                strokeDashoffset={offset}
                style={{ transition: "stroke-dasharray 1s ease-out" }}
                transform={`rotate(-90 ${cx} ${cy})`}
                className="drop-shadow-sm"
              />
            );
          })}
          <text
            x={cx}
            y={cy + 6}
            textAnchor="middle"
            fontSize="18"
            fontWeight="900"
            fill="#2D3436"
            fontFamily="Nunito"
          >
            {analytics.total || 0}
          </text>
        </svg>
      </div>

      <div className="grid grid-cols-2 gap-x-2 gap-y-3 w-full">
        {segments.map((seg) => (
          <div key={seg.key} className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="w-2 h-2 rounded-full shrink-0 shadow-sm"
                style={{ backgroundColor: seg.color }}
              />
              <span className="text-[9px] xl:text-[10px] font-black text-[#2D3436] opacity-40 uppercase tracking-widest truncate">
                {seg.label}
              </span>
            </div>
            <span className="text-[13px] font-black text-[#2D3436] pl-4">
              {analytics[seg.key] || 0}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// SCORE TREND
// ─────────────────────────────────────────────
const ScoreTrend = ({ trend }) => {
  if (!trend?.length)
    return (
      <p className="text-[11px] font-black text-[#2D3436] opacity-40 uppercase tracking-widest bg-[#F5F6FA] px-4 py-2 rounded-xl m-0">
        No data yet
      </p>
    );
  const max = Math.max(...trend, 10);
  const W = 140,
    H = 40;
  const pts = trend
    .map((v, i) => {
      const x = (i / Math.max(trend.length - 1, 1)) * W;
      const y = H - (v / max) * H;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="bg-[#F5F6FA] p-3 rounded-[16px] border border-transparent hover:border-[#6C5CE7]/20 transition-colors">
      <svg width={W} height={H} className="overflow-visible group">
        <polyline
          points={pts}
          fill="none"
          stroke="#6C5CE7"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
          className="drop-shadow-sm"
        />
        {trend.map((v, i) => (
          <circle
            key={i}
            cx={(i / Math.max(trend.length - 1, 1)) * W}
            cy={H - (v / max) * H}
            r="4"
            fill="#FFFFFF"
            stroke="#6C5CE7"
            strokeWidth="2"
            className="transition-transform hover:scale-150 origin-center"
          />
        ))}
      </svg>
    </div>
  );
};

// ─────────────────────────────────────────────
// MAIN DASHBOARD
// ─────────────────────────────────────────────
export default function StudentDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data, loading, error, lastFetched } = useSelector(
    (state) => state.dashboard,
  );
  const role = useSelector((state) => state.user?.user?.role);
  const userName = useSelector(
    (state) => state.user?.user?.fullName || "Student",
  );

  useEffect(() => {
    if (!role) return;
    if (lastFetched && Date.now() - lastFetched < 60000) return;
    dispatch(fetchDashboard());
  }, [role, lastFetched, dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] flex items-center justify-center font-['Nunito'] transition-all duration-300">
        <div className="flex flex-col items-center gap-4 animate-in fade-in duration-700">
          <div className="w-12 h-12 border-4 border-[#F5F6FA] border-t-[#6C5CE7] rounded-full animate-spin"></div>
          <p className="text-[12px] font-black text-[#6C5CE7] animate-pulse m-0 uppercase tracking-widest">
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
            <RefreshCw className="w-4 h-4" /> Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const {
    kpi,
    applicationPipeline,
    currentInternship,
    taskAnalytics,
    recentActivity,
    performance,
    actionQueue,
  } = data;

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#2D3436] font-['Nunito'] pb-12 transition-colors duration-500 selection:bg-[#6C5CE7]/20 selection:text-[#6C5CE7]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* HEADER (Now scrolls smoothly as a Hero Block) */}
        <div className="bg-[#F5F6FA] border border-transparent rounded-[32px] p-8 md:p-10 flex flex-col justify-center gap-2 shadow-sm">
          <h1 className="text-[28px] md:text-4xl font-black text-[#2D3436] m-0 tracking-tighter uppercase leading-tight">
            Welcome,{" "}
            <span className="text-[#6C5CE7]">
              {String(userName).split(" ")[0]}
            </span>
          </h1>
          <p className="text-[12px] font-black text-[#2D3436] opacity-40 uppercase tracking-[0.2em] m-0">
            Here's everything you need to act on today.
          </p>
        </div>

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          <KpiCard
            label="Total Applications"
            value={kpi.totalApplications}
            icon={Briefcase}
            color="text-blue-600"
            sub={`${kpi.completedInternships} completed`}
            onClick={() => navigate("/student/my-applications")}
          />
          <KpiCard
            label="Active Internship"
            value={kpi.activeInternship ? "Active" : "None"}
            icon={Activity}
            color={kpi.activeInternship ? "text-green-500" : "text-gray-400"}
            sub={currentInternship?.company || "No active internship"}
            onClick={() =>
              currentInternship
                ? navigate(
                    `/student/intern/${currentInternship.applicationId}/track`,
                  )
                : navigate("/student/my-applications")
            }
          />
          <KpiCard
            label="Pending Tasks"
            value={kpi.pendingTasksCount}
            icon={ListTodo}
            color={
              kpi.pendingTasksCount > 0 ? "text-yellow-500" : "text-gray-400"
            }
            sub={
              taskAnalytics?.overdue?.length
                ? `${taskAnalytics.overdue.length} overdue`
                : "All on track"
            }
            onClick={() =>
              currentInternship
                ? navigate(
                    `/student/intern/${currentInternship.applicationId}/track`,
                  )
                : navigate("/student/my-applications")
            }
          />
          <KpiCard
            label="Avg Score"
            value={kpi.averageScore !== null ? `${kpi.averageScore}/10` : "—"}
            icon={Star}
            color="text-blue-600"
            sub={
              kpi.completionRate !== null
                ? `${kpi.completionRate}% completion rate`
                : undefined
            }
            onClick={() =>
              currentInternship
                ? navigate(
                    `/student/intern/${currentInternship.applicationId}/track`,
                  )
                : navigate("/student/my-applications")
            }
          />
        </div>

        {/* CURRENT INTERNSHIP BANNER */}
        {currentInternship && (
          <div
            className="bg-gradient-to-br from-[#6C5CE7] to-[#A29BFE] rounded-[32px] p-8 md:p-10 cursor-pointer hover:shadow-[0_20px_50px_rgba(108,92,231,0.3)] transition-all duration-500 transform hover:-translate-y-1 relative overflow-hidden group"
            onClick={() =>
              navigate(
                `/student/intern/${currentInternship.applicationId}/track`,
              )
            }
          >
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#FFFFFF] opacity-5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>

            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
              <div className="flex flex-col gap-2">
                <p className="text-[#FFFFFF] opacity-80 text-[10px] font-black uppercase tracking-[0.2em] m-0 bg-[#FFFFFF]/10 px-3 py-1.5 rounded-lg w-max backdrop-blur-sm">
                  Current Internship
                </p>
                <h2 className="text-[#FFFFFF] text-[28px] md:text-4xl font-black m-0 tracking-tighter leading-tight mt-2">
                  {currentInternship.title}
                </h2>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[#FFFFFF] opacity-90 text-[14px] font-bold bg-[#FFFFFF]/10 px-3 py-1 rounded-md">
                    {currentInternship.company}
                  </span>
                  {currentInternship.mentor && (
                    <span className="text-[#FFFFFF] opacity-70 text-[12px] font-black uppercase tracking-widest border border-[#FFFFFF]/20 px-3 py-1 rounded-md">
                      Mentor: {currentInternship.mentor}
                    </span>
                  )}
                </div>
              </div>

              <div className="md:text-right bg-[#FFFFFF]/10 p-5 rounded-[20px] backdrop-blur-sm border border-[#FFFFFF]/20 flex flex-col items-center md:items-end min-w-[140px]">
                <p className="text-[#FFFFFF] text-[36px] font-black leading-none m-0">
                  {currentInternship.progress}%
                </p>
                <p className="text-[#FFFFFF] opacity-70 text-[10px] font-black uppercase tracking-[0.2em] mt-2 m-0">
                  Progress
                </p>
              </div>
            </div>

            <div className="mt-8 bg-[#FFFFFF]/20 rounded-full h-3 overflow-hidden shadow-inner relative z-10">
              <div
                className="bg-[#FFFFFF] h-full rounded-full transition-all duration-1000 ease-out relative"
                style={{ width: `${currentInternship.progress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#6C5CE7]/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
              </div>
            </div>

            <div className="flex justify-between mt-4 relative z-10 px-1">
              <div className="flex flex-col gap-1">
                <span className="text-[#FFFFFF] opacity-50 text-[9px] font-black uppercase tracking-widest">
                  Started
                </span>
                <span className="text-[#FFFFFF] opacity-90 text-[12px] font-bold">
                  {new Date(currentInternship.startDate).toLocaleDateString(
                    "en-IN",
                    { month: "short", year: "numeric" },
                  )}
                </span>
              </div>
<<<<<<< HEAD
              
=======
              <div className="flex flex-col gap-1 text-right">
                <span className="text-[#FFFFFF] opacity-50 text-[9px] font-black uppercase tracking-widest">
                  Ending
                </span>
                <span className="text-[#FFFFFF] opacity-90 text-[12px] font-bold">
                  {new Date(currentInternship.endDate).toLocaleDateString(
                    "en-IN",
                    { month: "short", year: "numeric" },
                  )}
                </span>
              </div>
>>>>>>> c58615c (final year commit)
            </div>
          </div>
        )}

        {/* MIDDLE ROW: ACTION PANEL + PIPELINE + TASK STATS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ACTION QUEUE */}
          <SectionCard
            title="Action Queue"
            icon={Zap}
            className="lg:col-span-1"
          >
            {actionQueue?.length ? (
              <div className="space-y-4 flex-1 overflow-y-auto pr-1 no-scrollbar">
                {actionQueue.map((action, i) => (
                  <ActionItem
                    key={i}
                    action={action}
                    onClick={() => navigate(action.route)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[200px] bg-[#F5F6FA] rounded-[24px] border-2 border-dashed border-emerald-200">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-4 animate-bounce" />
                <p className="text-[14px] font-black text-[#2D3436] opacity-60 uppercase tracking-widest m-0">
                  All caught up!
                </p>
              </div>
            )}
          </SectionCard>

          {/* APPLICATION PIPELINE */}
          <SectionCard
            title="Application Pipeline"
            icon={BarChart2}
            className="lg:col-span-1"
          >
            <div className="flex flex-col h-full justify-between">
              <PipelineBar pipeline={applicationPipeline} />
              <button
                onClick={() => navigate("/student/my-applications")}
                className="mt-6 w-full py-4 flex items-center justify-center gap-2 text-[11px] font-black text-[#6C5CE7] uppercase tracking-[0.15em] bg-[#F5F6FA] rounded-[16px] hover:bg-[#6C5CE7] hover:text-[#FFFFFF] transition-all duration-300 outline-none transform active:scale-95 group shrink-0"
              >
                View all applications{" "}
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </SectionCard>

          {/* TASK ANALYTICS (FIXED RESPONSIVENESS) */}
          <SectionCard
            title="Task Status"
            icon={ListTodo}
            className="lg:col-span-1"
          >
            <div className="flex flex-col h-full w-full justify-between gap-6">
              <div className="flex-1 flex items-center justify-center w-full">
                <TaskDonut analytics={taskAnalytics} />
              </div>

              {taskAnalytics?.overdue?.length > 0 && (
                <div className="w-full p-4 bg-rose-50 border border-rose-200 rounded-[16px] shadow-sm animate-in zoom-in shrink-0">
                  <p className="text-[11px] sm:text-[12px] font-black text-rose-600 flex items-center justify-center gap-2 uppercase tracking-widest m-0 text-center">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span className="truncate">
                      {taskAnalytics.overdue.length} task(s) overdue
                    </span>
                  </p>
                </div>
              )}
            </div>
          </SectionCard>
        </div>

        {/* BOTTOM ROW: RECENT ACTIVITY + PERFORMANCE */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* RECENT ACTIVITY */}
          <SectionCard title="Recent Activity" icon={Clock}>
            {recentActivity?.length ? (
              <ul className="divide-y divide-[#F5F6FA] m-0 p-0 list-none">
                {recentActivity.map((item, i) => (
                  <li
                    key={i}
                    className="py-4 flex items-center justify-between gap-4 hover:bg-[#F5F6FA]/50 -mx-4 px-4 rounded-[16px] transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-[#F5F6FA] rounded-[12px] group-hover:bg-[#FFFFFF] group-hover:shadow-sm transition-all">
                        <FileText className="w-5 h-5 text-[#6C5CE7] shrink-0" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <p className="text-[14px] font-bold text-[#2D3436] opacity-80 m-0 group-hover:text-[#6C5CE7] transition-colors line-clamp-1">
                          {item.label}
                        </p>
                        <p className="text-[10px] font-black text-[#2D3436] opacity-40 uppercase tracking-widest m-0">
                          {new Date(item.time).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-2">
                      <StatusBadge status={item.meta?.status} />
                      {item.meta?.score !== null &&
                        item.meta?.score !== undefined && (
                          <span className="text-[11px] font-black text-[#2D3436] bg-[#F5F6FA] px-2 py-1 rounded-md border border-transparent group-hover:border-[#6C5CE7]/20 transition-colors">
                            Score: {item.meta.score}/10
                          </span>
                        )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="bg-[#F5F6FA] p-8 text-center rounded-[20px] border-2 border-dashed border-[#6C5CE7]/20">
                <p className="text-[12px] font-black text-[#2D3436] opacity-40 uppercase tracking-[0.2em] m-0">
                  No recent activity
                </p>
              </div>
            )}
          </SectionCard>

          {/* PERFORMANCE */}
          <SectionCard title="Performance" icon={TrendingUp}>
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 mb-8">
              <div className="flex flex-col items-center sm:items-start bg-[#F5F6FA] p-6 rounded-[24px] border border-transparent hover:border-[#6C5CE7]/20 transition-colors w-full sm:w-auto">
                <p className="text-[48px] font-black text-[#6C5CE7] leading-none m-0">
                  {performance.averageScore !== null
                    ? `${performance.averageScore}`
                    : "—"}
                  <span className="text-[20px] font-bold text-[#2D3436] opacity-30 ml-1">
                    /10
                  </span>
                </p>
                <p className="text-[10px] font-black text-[#2D3436] opacity-50 uppercase tracking-[0.2em] mt-3 m-0 text-center sm:text-left">
                  Average Score
                </p>
              </div>
              <div className="w-full sm:w-auto flex justify-center sm:justify-end">
                <ScoreTrend trend={performance.trend} />
              </div>
            </div>

            {performance.latestFeedback && (
              <div className="bg-[#FFFFFF] border border-[#F5F6FA] rounded-[24px] p-6 shadow-sm hover:shadow-md hover:border-[#6C5CE7]/20 transition-all relative overflow-hidden group">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#6C5CE7] group-hover:w-2 transition-all"></div>
                <p className="text-[11px] text-[#2D3436] opacity-50 font-black uppercase tracking-[0.15em] mb-3 flex items-center gap-2 pl-2">
                  <User className="w-4 h-4 text-[#6C5CE7]" /> Mentor Feedback
                </p>
                <p className="text-[14px] font-bold text-[#2D3436] opacity-80 leading-relaxed line-clamp-3 m-0 pl-2 bg-[#F5F6FA] p-4 rounded-[16px]">
                  {performance.latestFeedback}
                </p>
              </div>
            )}

            <button
              onClick={() =>
                currentInternship
                  ? navigate(
                      `/student/intern/${currentInternship.applicationId}/track`,
                    )
                  : navigate("/student/my-applications")
              }
              className="mt-8 w-full py-4 flex items-center justify-center gap-2 text-[11px] font-black text-[#FFFFFF] bg-[#2D3436] uppercase tracking-[0.15em] rounded-[16px] hover:bg-[#6C5CE7] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 outline-none transform active:scale-95 group"
            >
              View Full Report{" "}
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </button>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
