import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchDashboard } from "../../store/dashboardSlice";
import {
  Users,
  CheckCircle, // Changed from CheckCircle2 for better version compatibility
  Activity,
  Star,
  BarChart, // Changed from BarChart2
  AlertCircle, // Changed from AlertTriangle
  Clock,
  ChevronRight,
  Zap,
  FileText,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────
// CONSTANTS & HELPERS
// ─────────────────────────────────────────────────────────────────────
const STATUS_LABELS = {
  submitted: "Submitted",
  under_review: "Under Review",
  revision_requested: "Revision Requested",
  completed: "Completed",
  assigned: "Assigned",
};

const fmt = (n) => (n ?? 0).toLocaleString();

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
      <div className="flex items-baseline gap-2">
        <h3
          className={`text-[36px] font-black leading-none m-0 transition-colors transform origin-left group-hover:scale-105
          ${warn ? "text-amber-500" : "text-[#2D3436] group-hover:text-[#6C5CE7]"}
        `}
        >
          {value ?? "—"}
        </h3>
      </div>

      {sub && (
        <p className="text-[11px] font-bold text-[#2D3436] opacity-40 mt-3 m-0">
          {sub}
        </p>
      )}
    </div>
  </div>
);

const SectionCard = ({ title, icon: Icon, children, className = "" }) => (
  <div
    className={`bg-[#FFFFFF] border border-[#F5F6FA] rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] flex flex-col h-full ${className}`}
  >
    <div className="px-8 py-6 border-b border-[#F5F6FA] bg-[#FFFFFF] flex items-center gap-3">
      {Icon && <Icon className="w-5 h-5 text-[#6C5CE7]" />}
      <h2 className="text-[13px] font-black text-[#6C5CE7] uppercase tracking-[0.2em] m-0 border-l-4 border-[#6C5CE7] pl-4 flex items-center h-5">
        {title}
      </h2>
    </div>
    <div className="p-8 flex-1 flex flex-col">{children}</div>
  </div>
);

const TableRow = ({ cols, highlight, onClick }) => (
  <div
    onClick={onClick}
    className={`grid gap-4 py-4 border-b border-[#F5F6FA] last:border-0 transition-colors px-2 rounded-lg items-center
      ${highlight ? "bg-amber-50 border border-amber-100 -mx-2 px-4" : ""}
      ${onClick ? "cursor-pointer hover:bg-[#F5F6FA]/50 group" : ""}
    `}
    style={{ gridTemplateColumns: `repeat(${cols.length}, minmax(0,1fr))` }}
  >
    {cols.map((c, i) => (
      <span
        key={i}
        className={`truncate ${
          i === 0
            ? `text-[14px] font-bold text-[#2D3436] opacity-80 ${onClick && !highlight ? "group-hover:text-[#6C5CE7]" : ""}`
            : "text-[12px] font-black text-[#2D3436] opacity-50 uppercase tracking-widest"
        }`}
      >
        {c}
      </span>
    ))}
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

const Badge = ({ label, color }) => {
  const colors = {
    yellow: "bg-amber-50 text-amber-600 border border-amber-200",
    blue: "bg-[#2D3436] text-[#FFFFFF] border border-[#2D3436]",
    red: "bg-rose-50 text-rose-600 border border-rose-200",
    green: "bg-emerald-50 text-emerald-600 border border-emerald-200",
    gray: "bg-[#F5F6FA] text-[#2D3436] opacity-60 border border-transparent",
  };

  const dotColors = {
    yellow: "bg-amber-500",
    blue: "bg-[#FFFFFF]",
    red: "bg-rose-500",
    green: "bg-emerald-500",
    gray: "bg-[#2D3436] opacity-40",
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1.5 rounded-[12px] text-[9px] font-black uppercase tracking-widest shadow-sm transition-all duration-300 ${colors[color] || colors.gray}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full mr-2 ${dotColors[color] || dotColors.gray}`}
      ></span>
      {label}
    </span>
  );
};

const statusColor = (s) =>
  ({
    submitted: "yellow",
    under_review: "blue",
    revision_requested: "red",
    completed: "green",
  })[s] || "gray";

// ─────────────────────────────────────────────
// DONUT CHART COMPONENT
// ─────────────────────────────────────────────
const TaskDonut = ({ stats }) => {
  if (!stats) return null;

  const segments = [
    { key: "pending", label: "Pending", color: "#2D3436" },
    { key: "submitted", label: "Submitted", color: "#F59E0B" },
    { key: "under_review", label: "Under Review", color: "#6C5CE7" },
    { key: "revision_requested", label: "Revision", color: "#EF4444" },
    { key: "completed", label: "Completed", color: "#10B981" },
  ];

  const total = stats.totalTasks || 1;
  let cumulative = 0;
  const r = 40,
    cx = 50,
    cy = 50,
    circumference = 2 * Math.PI * r;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-8 bg-[#F5F6FA] p-6 rounded-[24px]">
      <div className="relative group">
        <div className="absolute inset-0 bg-[#6C5CE7]/5 rounded-full blur-xl group-hover:bg-[#6C5CE7]/10 transition-colors duration-500"></div>
        <svg
          width="100"
          height="100"
          className="shrink-0 relative z-10 transform group-hover:scale-105 transition-transform duration-500"
        >
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="14"
          />
          {segments.map((seg) => {
            const val = stats[seg.key] || 0;
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
                strokeWidth="14"
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
            fontSize="20"
            fontWeight="900"
            fill="#2D3436"
            fontFamily="Nunito"
          >
            {stats.totalTasks || 0}
          </text>
        </svg>
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-3 w-full">
        {segments.map((seg) => (
          <div key={seg.key} className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                style={{ backgroundColor: seg.color }}
              />
              <span className="text-[10px] font-black text-[#2D3436] opacity-40 uppercase tracking-widest">
                {seg.label}
              </span>
            </div>
            <span className="text-[14px] font-black text-[#2D3436] pl-4.5">
              {stats[seg.key] || 0}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// MAIN DASHBOARD
// ─────────────────────────────────────────────
export default function MentorDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Safe default fallback for dashboard state to prevent crash if undefined
  const { data, loading, error } = useSelector((s) => s.dashboard || {});
  const userName = useSelector(
    (state) => state.user?.user?.fullName || "Mentor",
  );

  useEffect(() => {
    dispatch(fetchDashboard());
  }, [dispatch]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFFFF] font-['Nunito'] transition-all duration-300">
        <div className="flex flex-col items-center gap-4 animate-in fade-in duration-700">
          <div className="w-12 h-12 border-4 border-[#F5F6FA] border-t-[#6C5CE7] rounded-full animate-spin"></div>
          <p className="text-[12px] font-black text-[#6C5CE7] animate-pulse uppercase tracking-[0.2em] m-0">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFFFF] font-['Nunito'] p-4">
        <div className="bg-rose-50 border border-rose-200 rounded-[24px] p-10 text-center max-w-md shadow-sm animate-in zoom-in duration-500">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4 animate-bounce" />
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

  if (!data) return null;

  // Safely destruct properties so missing objects don't crash `.map`
  const {
    kpis = {},
    taskStats = {},
    internStats = [],
    pendingReviews = [],
    atRisk = [],
    recentActivity = [],
    actions = [],
  } = data || {};

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#2D3436] font-['Nunito'] pb-12 transition-colors duration-500 selection:bg-[#6C5CE7]/20 selection:text-[#6C5CE7]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* HEADER */}
        <div className="bg-[#F5F6FA] border border-transparent rounded-[32px] p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
          <div className="flex flex-col gap-2">
            <h1 className="text-[28px] md:text-4xl font-black text-[#2D3436] m-0 tracking-tighter uppercase leading-tight">
              Welcome,{" "}
              <span className="text-[#6C5CE7]">
                {String(userName).split(" ")[0]}
              </span>
            </h1>
            <p className="text-[12px] font-black text-[#2D3436] opacity-40 uppercase tracking-[0.2em] m-0">
              Your interns, tasks, and reviews
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

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          <KpiCard
            label="Total Interns"
            value={kpis?.totalInterns}
            sub={`${kpis?.activeInternships ?? 0} active`}
            icon={Users}
            onClick={() => navigate("/mentor/interns")}
          />
          <KpiCard
            label="Completed"
            value={kpis?.completedInternships}
            icon={CheckCircle}
            onClick={() => navigate("/mentor/interns")}
          />
          <KpiCard
            label="Pending Reviews"
            value={kpis?.pendingTaskReviews}
            icon={Clock}
            warn={kpis?.pendingTaskReviews > 0}
            onClick={() => navigate("/mentor/interns")}
          />
          <KpiCard
            label="Avg Intern Score"
            value={
              kpis?.avgInternScore != null ? `${kpis.avgInternScore}/10` : "—"
            }
            icon={Star}
            warn={kpis?.avgInternScore != null && kpis.avgInternScore < 5}
          />
        </div>

        {/* Middle Row: Task Stats + Pending Reviews */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <SectionCard title="Task Overview" icon={BarChart}>
            <TaskDonut stats={taskStats} />
          </SectionCard>

          <SectionCard
            title="Pending Reviews"
            icon={AlertCircle}
            className={
              pendingReviews?.length
                ? "border-amber-100 shadow-[0_8px_30px_rgba(245,158,11,0.05)]"
                : ""
            }
          >
            {pendingReviews?.length ? (
              <div className="space-y-3 flex-1">
                {pendingReviews.map((r, idx) => (
                  <div
                    key={r._id || idx}
                    style={{ animationDelay: `${idx * 50}ms` }}
                    onClick={() =>
                      navigate(`/mentor/intern/${r.applicationId}/track`)
                    }
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-amber-50 border border-amber-200 rounded-[16px] px-5 py-4 cursor-pointer hover:bg-amber-100 hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5 animate-in fade-in fill-mode-both"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#FFFFFF] flex items-center justify-center text-[14px] font-black text-amber-600 shadow-sm border border-amber-100">
                        {r.studentName?.charAt(0) || "S"}
                      </div>
                      <div className="flex flex-col">
                        <p className="text-[14px] font-bold text-[#2D3436] opacity-80 m-0">
                          {r.studentName}
                        </p>
                        <p className="text-[10px] font-black text-[#2D3436] opacity-40 uppercase tracking-widest mt-1 m-0">
                          {/* Safe formatting for dates */}
                          {r.submittedAt
                            ? new Date(r.submittedAt).toLocaleDateString()
                            : "—"}{" "}
                          • Attempt #{r.attempt || 1}
                        </p>
                      </div>
                    </div>
                    <Badge
                      label={STATUS_LABELS[r.status] || r.status}
                      color={statusColor(r.status)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-[#F5F6FA] p-8 text-center rounded-[20px] border-2 border-dashed border-[#6C5CE7]/20 flex flex-col items-center justify-center gap-3 flex-1">
                <CheckCircle className="w-10 h-10 text-emerald-400 animate-bounce" />
                <p className="text-[12px] font-black text-[#2D3436] opacity-40 uppercase tracking-[0.2em] m-0">
                  No pending reviews. You're all caught up!
                </p>
              </div>
            )}
          </SectionCard>
        </div>

        {/* Bottom Row: Intern Stats + At-Risk */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <SectionCard title="Intern Performance" icon={Activity}>
            <div className="overflow-x-auto no-scrollbar flex-1 flex flex-col">
              {internStats?.length ? (
                <div className="flex flex-col gap-1">
                  <div className="grid grid-cols-4 gap-4 py-3 border-b border-[#F5F6FA] px-2 mb-2 hidden sm:grid">
                    <span className="text-[10px] font-black text-[#2D3436] opacity-40 uppercase tracking-widest col-span-1">
                      Name
                    </span>
                    <span className="text-[10px] font-black text-[#2D3436] opacity-40 uppercase tracking-widest col-span-1">
                      Internship
                    </span>
                    <span className="text-[10px] font-black text-[#2D3436] opacity-40 uppercase tracking-widest col-span-1">
                      Progress
                    </span>
                    <span className="text-[10px] font-black text-[#2D3436] opacity-40 uppercase tracking-widest col-span-1">
                      Score
                    </span>
                  </div>
                  {internStats.map((i, idx) => (
                    <TableRow
                      key={i.id || idx}
                      cols={[
                        i.name,
                        i.internship,
                        <div className="flex items-center gap-2">
                          <span className="text-[#6C5CE7]">
                            {i.progress || 0}%
                          </span>
                          <div className="w-full max-w-[50px] h-1.5 bg-[#F5F6FA] rounded-full hidden sm:block">
                            <div
                              className="h-full bg-[#6C5CE7] rounded-full"
                              style={{ width: `${i.progress || 0}%` }}
                            ></div>
                          </div>
                        </div>,
                        <span className="bg-[#F5F6FA] px-2 py-1 rounded-md">
                          {i.avgScore != null ? `${i.avgScore}/10` : "—"}
                        </span>,
                      ]}
                      onClick={() => navigate(`/mentor/intern/${i.id}/track`)}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-[#F5F6FA] p-8 text-center rounded-[20px] border-2 border-dashed border-[#6C5CE7]/20 flex-1 flex items-center justify-center">
                  <p className="text-[12px] font-black text-[#2D3436] opacity-40 uppercase tracking-[0.2em] m-0">
                    No interns assigned.
                  </p>
                </div>
              )}
            </div>
          </SectionCard>

          <SectionCard
            title="At-Risk Interns"
            icon={AlertCircle}
            className={
              atRisk?.length
                ? "border-rose-100 shadow-[0_8px_30px_rgba(225,29,72,0.05)]"
                : ""
            }
          >
            {atRisk?.length ? (
              <div className="space-y-3 flex-1">
                {atRisk.map((a, idx) => (
                  <div
                    key={a.id || idx}
                    style={{ animationDelay: `${idx * 50}ms` }}
                    onClick={() => navigate(`/mentor/intern/${a.id}/track`)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-rose-50 border border-rose-200 rounded-[16px] px-5 py-4 cursor-pointer hover:bg-rose-100 hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5 animate-in fade-in fill-mode-both group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(225,29,72,0.6)] animate-pulse"></div>
                      <span className="text-[14px] font-bold text-[#2D3436] opacity-90 group-hover:text-[#6C5CE7] transition-colors">
                        {a.name}
                      </span>
                    </div>
                    <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest bg-[#FFFFFF] px-3 py-1.5 rounded-lg border border-rose-100 shadow-sm">
                      {a.reason}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-[#F5F6FA] p-8 text-center rounded-[20px] border-2 border-dashed border-emerald-200 flex-1 flex flex-col items-center justify-center gap-3">
                <CheckCircle className="w-10 h-10 text-emerald-400 animate-bounce" />
                <p className="text-[12px] font-black text-[#2D3436] opacity-60 uppercase tracking-[0.2em] m-0">
                  No at-risk interns. System healthy.
                </p>
              </div>
            )}
          </SectionCard>
        </div>

        {/* Recent Activity */}
        <SectionCard title="Recent Activity" icon={FileText}>
          <div className="grid grid-cols-4 gap-4 py-3 border-b border-[#F5F6FA] px-2 mb-2 hidden sm:grid">
            <span className="text-[10px] font-black text-[#2D3436] opacity-40 uppercase tracking-widest col-span-1">
              Student
            </span>
            <span className="text-[10px] font-black text-[#2D3436] opacity-40 uppercase tracking-widest col-span-1">
              Task
            </span>
            <span className="text-[10px] font-black text-[#2D3436] opacity-40 uppercase tracking-widest col-span-1">
              Status
            </span>
            <span className="text-[10px] font-black text-[#2D3436] opacity-40 uppercase tracking-widest col-span-1">
              Date
            </span>
          </div>

          <div className="flex flex-col gap-1">
            {recentActivity?.map((a, idx) => (
              <div
                key={a._id || idx}
                style={{ animationDelay: `${idx * 50}ms` }}
                className="animate-in fade-in fill-mode-both"
              >
                <TableRow
                  cols={[
                    a.studentName,
                    a.taskTitle,
                    <Badge
                      label={STATUS_LABELS[a.status] || a.status}
                      color={statusColor(a.status)}
                    />,
                    a.submittedAt
                      ? new Date(a.submittedAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })
                      : "—",
                  ]}
                  onClick={() =>
                    navigate(`/mentor/intern/${a.applicationId}/track`)
                  }
                />
              </div>
            ))}
            {!recentActivity?.length && (
              <div className="py-8 text-center border-t border-[#F5F6FA]">
                <p className="text-[12px] font-black text-[#2D3436] opacity-40 uppercase tracking-[0.2em] m-0">
                  No recent activity.
                </p>
              </div>
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
