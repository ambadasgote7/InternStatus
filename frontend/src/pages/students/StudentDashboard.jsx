import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Briefcase, CheckCircle2, Clock, Star, TrendingUp,
  AlertTriangle, ChevronRight, Activity, BarChart2,
  FileText, User, ArrowRight, Loader2, RefreshCw,
  Circle, ListTodo, Zap
} from "lucide-react";
import { fetchDashboard } from "../../store/dashboardSlice";

// ─────────────────────────────────────────────
// REUSABLE COMPONENTS
// ─────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const map = {
    applied:        "bg-blue-100 text-blue-700",
    shortlisted:    "bg-purple-100 text-purple-700",
    selected:       "bg-indigo-100 text-indigo-700",
    offer_accepted: "bg-yellow-100 text-yellow-700",
    ongoing:        "bg-green-100 text-green-700",
    completed:      "bg-gray-100 text-gray-600",
    submitted:      "bg-blue-100 text-blue-700",
    under_review:   "bg-yellow-100 text-yellow-700",
    revision_requested: "bg-red-100 text-red-700",
    urgent:         "bg-red-100 text-red-700",
    high:           "bg-orange-100 text-orange-700",
    normal:         "bg-gray-100 text-gray-600",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${map[status] || "bg-gray-100 text-gray-600"}`}>
      {status?.replace("_", " ")}
    </span>
  );
};

const SectionCard = ({ title, icon: Icon, children, className = "" }) => (
  <div className={`bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition-shadow ${className}`}>
    {title && (
      <div className="flex items-center gap-2 mb-4">
        {Icon && <Icon className="w-5 h-5 text-blue-600" />}
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{title}</h2>
      </div>
    )}
    {children}
  </div>
);

const KpiCard = ({ label, value, icon: Icon, color, sub, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition-all cursor-pointer group border border-transparent hover:border-blue-100"
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">{label}</p>
        <p className={`text-2xl font-bold ${color || "text-gray-800"}`}>{value ?? "—"}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
      <div className={`p-2.5 rounded-xl ${color ? color.replace("text-", "bg-").replace("600", "50").replace("500", "50") : "bg-gray-50"} group-hover:scale-110 transition-transform`}>
        <Icon className={`w-5 h-5 ${color || "text-gray-500"}`} />
      </div>
    </div>
  </div>
);

const ActionItem = ({ action, onClick }) => {
  const urgencyStyle = {
    urgent: "bg-red-50 border border-red-200 hover:bg-red-100",
    high:   "bg-orange-50 border border-orange-200 hover:bg-orange-100",
    normal: "bg-gray-50 border border-gray-200 hover:bg-gray-100",
  };
  const iconStyle = {
    urgent: "text-red-500",
    high:   "text-orange-500",
    normal: "text-blue-500",
  };
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors text-left ${urgencyStyle[action.priority] || urgencyStyle.normal}`}
    >
      <div className="flex items-center gap-3">
        {action.priority === "urgent"
          ? <AlertTriangle className={`w-4 h-4 shrink-0 ${iconStyle.urgent}`} />
          : action.priority === "high"
          ? <Zap className={`w-4 h-4 shrink-0 ${iconStyle.high}`} />
          : <Circle className={`w-4 h-4 shrink-0 ${iconStyle.normal}`} />
        }
        <span className="text-sm font-medium text-gray-800">{action.label}</span>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
    </button>
  );
};

// ─────────────────────────────────────────────
// PIPELINE BAR
// ─────────────────────────────────────────────
const PipelineBar = ({ pipeline }) => {
  const stages = [
    { key: "applied",     label: "Applied",    color: "bg-blue-400" },
    { key: "shortlisted", label: "Shortlisted", color: "bg-purple-400" },
    { key: "selected",    label: "Selected",   color: "bg-indigo-400" },
    { key: "ongoing",     label: "Ongoing",    color: "bg-green-500" },
    { key: "completed",   label: "Completed",  color: "bg-gray-400" },
  ];
  const max = Math.max(...stages.map((s) => pipeline[s.key] || 0), 1);

  return (
    <div className="space-y-3">
      {stages.map(({ key, label, color }) => {
        const val = pipeline[key] || 0;
        const pct = Math.round((val / max) * 100);
        return (
          <div key={key} className="flex items-center gap-3">
            <span className="text-xs text-gray-500 w-20 shrink-0">{label}</span>
            <div className="flex-1 bg-gray-100 rounded-full h-2">
              <div
                className={`${color} h-2 rounded-full transition-all duration-700`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-gray-700 w-4 text-right">{val}</span>
          </div>
        );
      })}
    </div>
  );
};

// ─────────────────────────────────────────────
// TASK DONUT (SVG-based)
// ─────────────────────────────────────────────
const TaskDonut = ({ analytics }) => {
  const segments = [
    { key: "pending",            label: "Pending",          color: "#3B82F6" },
    { key: "submitted",          label: "Submitted",        color: "#8B5CF6" },
    { key: "under_review",       label: "Under Review",     color: "#F59E0B" },
    { key: "revision_requested", label: "Revision",         color: "#EF4444" },
    { key: "completed",          label: "Completed",        color: "#10B981" },
  ];

  const total = segments.reduce((s, seg) => s + (analytics[seg.key] || 0), 0) || 1;
  let cumulative = 0;
  const r = 36, cx = 48, cy = 48, circumference = 2 * Math.PI * r;

  return (
    <div className="flex items-center gap-4">
      <svg width="96" height="96" className="shrink-0">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F3F4F6" strokeWidth="12" />
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
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth="12"
              strokeDasharray={`${dash} ${circumference}`}
              strokeDashoffset={offset}
              style={{ transition: "stroke-dasharray 0.6s ease" }}
              transform={`rotate(-90 ${cx} ${cy})`}
            />
          );
        })}
        <text x={cx} y={cy + 5} textAnchor="middle" fontSize="14" fontWeight="700" fill="#1F2937">
          {analytics.total || 0}
        </text>
      </svg>
      <div className="space-y-1.5">
        {segments.map((seg) => (
          <div key={seg.key} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
            <span className="text-xs text-gray-500">{seg.label}</span>
            <span className="text-xs font-semibold text-gray-700 ml-auto">{analytics[seg.key] || 0}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// SCORE TREND (sparkline)
// ─────────────────────────────────────────────
const ScoreTrend = ({ trend }) => {
  if (!trend?.length) return <p className="text-xs text-gray-400">No data yet</p>;
  const max = Math.max(...trend, 10);
  const W = 120, H = 36;
  const pts = trend.map((v, i) => {
    const x = (i / Math.max(trend.length - 1, 1)) * W;
    const y = H - (v / max) * H;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width={W} height={H} className="overflow-visible">
      <polyline
        points={pts}
        fill="none"
        stroke="#3B82F6"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {trend.map((v, i) => (
        <circle
          key={i}
          cx={(i / Math.max(trend.length - 1, 1)) * W}
          cy={H - (v / max) * H}
          r="3"
          fill="#3B82F6"
        />
      ))}
    </svg>
  );
};

// ─────────────────────────────────────────────
// MAIN DASHBOARD
// ─────────────────────────────────────────────
export default function StudentDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
   const { data, loading, error, lastFetched } = useSelector(
    (state) => state.dashboard
  );

  const role = useSelector((state) => state.user?.user?.role);

  useEffect(() => {
    // ✅ wait until user is loaded
    if (!role) return;

    // ✅ optional: prevent unnecessary refetch (60 sec cache)
    if (lastFetched && Date.now() - lastFetched < 60000) return;

    // ✅ correct call (no role passed)
    dispatch(fetchDashboard());
  }, [role, lastFetched, dispatch]);


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center max-w-sm">
          <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <p className="text-gray-700 font-medium mb-4">{error}</p>
          <button
            onClick={() => dispatch(fetchDashboard())}
            className="flex items-center gap-2 mx-auto text-sm text-blue-600 hover:text-blue-700"
          >
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { kpi, applicationPipeline, currentInternship, taskAnalytics, recentActivity, performance, actionQueue } = data;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Welcome </h1>
        <p className="text-sm text-gray-500 mt-0.5">Here's everything you need to act on today.</p>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
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
              ? navigate(`/student/intern/${currentInternship.applicationId}/track`)
              : navigate("/student/my-applications")
          }
        />
        <KpiCard
          label="Pending Tasks"
          value={kpi.pendingTasksCount}
          icon={ListTodo}
          color={kpi.pendingTasksCount > 0 ? "text-yellow-500" : "text-gray-400"}
          sub={taskAnalytics?.overdue?.length ? `${taskAnalytics.overdue.length} overdue` : "All on track"}
          onClick={() =>
            currentInternship
              ? navigate(`/student/intern/${currentInternship.applicationId}/track`)
              : navigate("/student/my-applications")
          }
        />
        <KpiCard
          label="Avg Score"
          value={kpi.averageScore !== null ? `${kpi.averageScore}/10` : "—"}
          icon={Star}
          color="text-blue-600"
          sub={kpi.completionRate !== null ? `${kpi.completionRate}% completion rate` : undefined}
          onClick={() =>
            currentInternship
              ? navigate(`/student/intern/${currentInternship.applicationId}/track`)
              : navigate("/student/my-applications")
          }
        />
      </div>

      {/* CURRENT INTERNSHIP BANNER */}
      {currentInternship && (
        <div
          className="bg-blue-600 rounded-2xl p-5 mb-6 cursor-pointer hover:bg-blue-700 transition-colors"
          onClick={() => navigate(`/student/intern/${currentInternship.applicationId}/track`)}
        >
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <p className="text-blue-100 text-xs font-medium uppercase tracking-wide mb-1">Current Internship</p>
              <h2 className="text-white text-lg font-bold">{currentInternship.title}</h2>
              <p className="text-blue-200 text-sm mt-0.5">{currentInternship.company}</p>
              {currentInternship.mentor && (
                <p className="text-blue-200 text-xs mt-1">Mentor: {currentInternship.mentor}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-white text-2xl font-bold">{currentInternship.progress}%</p>
              <p className="text-blue-200 text-xs">Progress</p>
            </div>
          </div>
          <div className="mt-4 bg-blue-500 rounded-full h-2">
            <div
              className="bg-white h-2 rounded-full transition-all duration-700"
              style={{ width: `${currentInternship.progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-blue-200 text-xs">
              {new Date(currentInternship.startDate).toLocaleDateString()}
            </span>
            <span className="text-blue-200 text-xs">
              {new Date(currentInternship.endDate).toLocaleDateString()}
            </span>
          </div>
        </div>
      )}

      {/* MIDDLE ROW: ACTION PANEL + PIPELINE + TASK STATS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* ACTION QUEUE */}
        <SectionCard title="Action Queue" icon={Zap} className="lg:col-span-1">
          {actionQueue?.length ? (
            <div className="space-y-2">
              {actionQueue.map((action, i) => (
                <ActionItem
                  key={i}
                  action={action}
                  onClick={() => navigate(action.route)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-6 text-gray-400">
              <CheckCircle2 className="w-8 h-8 text-green-400 mb-2" />
              <p className="text-sm">All caught up!</p>
            </div>
          )}
        </SectionCard>

        {/* APPLICATION PIPELINE */}
        <SectionCard title="Application Pipeline" icon={BarChart2} className="lg:col-span-1">
          <PipelineBar pipeline={applicationPipeline} />
          <button
            onClick={() => navigate("/student/my-applications")}
            className="mt-4 flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            View all applications <ArrowRight className="w-3 h-3" />
          </button>
        </SectionCard>

        {/* TASK ANALYTICS */}
        <SectionCard title="Task Status" icon={ListTodo} className="lg:col-span-1">
          <TaskDonut analytics={taskAnalytics} />
          {taskAnalytics?.overdue?.length > 0 && (
            <div className="mt-3 p-2.5 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-xs font-semibold text-red-600 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                {taskAnalytics.overdue.length} task(s) overdue
              </p>
            </div>
          )}
        </SectionCard>
      </div>

      {/* BOTTOM ROW: RECENT ACTIVITY + PERFORMANCE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* RECENT ACTIVITY */}
        <SectionCard title="Recent Activity" icon={Clock}>
          {recentActivity?.length ? (
            <ul className="divide-y divide-gray-100">
              {recentActivity.map((item, i) => (
                <li key={i} className="py-3 flex items-start justify-between gap-3 hover:bg-gray-50 -mx-1 px-1 rounded-lg transition-colors">
                  <div className="flex items-start gap-3">
                    <FileText className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm text-gray-700 font-medium">{item.label}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(item.time).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric"
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-1">
                    <StatusBadge status={item.meta?.status} />
                    {item.meta?.score !== null && item.meta?.score !== undefined && (
                      <span className="text-xs font-semibold text-gray-600">{item.meta.score}/10</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400 text-center py-6">No recent activity</p>
          )}
        </SectionCard>

        {/* PERFORMANCE */}
        <SectionCard title="Performance" icon={TrendingUp}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-3xl font-bold text-gray-800">
                {performance.averageScore !== null ? `${performance.averageScore}` : "—"}
                <span className="text-base font-normal text-gray-400">/10</span>
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Average Score</p>
            </div>
            <ScoreTrend trend={performance.trend} />
          </div>
          {performance.latestFeedback && (
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <p className="text-xs text-gray-500 font-medium mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5" /> Mentor Feedback
              </p>
              <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
                {performance.latestFeedback}
              </p>
            </div>
          )}
          <button
            onClick={() =>
              currentInternship
                ? navigate(`/student/intern/${currentInternship.applicationId}/track`)
                : navigate("/student/my-applications")
            }
            className="mt-4 flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            View full report <ArrowRight className="w-3 h-3" />
          </button>
        </SectionCard>
      </div>
    </div>
  );
}