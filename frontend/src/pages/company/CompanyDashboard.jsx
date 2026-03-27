import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchDashboard } from "../../store/dashboardSlice";
import {
  Briefcase,
  Users,
  CheckCircle2,
  Star,
  BarChart2,
  Activity,
  AlertTriangle,
  Clock,
  ChevronRight,
  Zap,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────
// CONSTANTS & HELPERS
// ─────────────────────────────────────────────────────────────────────
const STATUS_LABELS = {
  applied: "Applied",
  shortlisted: "Shortlisted",
  selected: "Selected",
  offer_accepted: "Offer Accepted",
  ongoing: "Ongoing",
  completed: "Completed",
  rejected: "Rejected",
};

const fmt = (n) => (n ?? 0).toLocaleString();

const timeAgo = (d) => {
  if (!d) return "—";
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

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

const Badge = ({ label, status }) => {
  let cls = "bg-[#F5F6FA] text-[#2D3436] opacity-60 border-transparent";
  let dotCls = "bg-[#2D3436] opacity-40";

  if (["selected", "offer_accepted", "ongoing", "completed"].includes(status)) {
    cls = "bg-emerald-50 text-emerald-600 border-emerald-200";
    dotCls = "bg-emerald-500";
  } else if (
    ["applied", "shortlisted", "under_review", "submitted"].includes(status)
  ) {
    cls = "bg-[#2D3436] text-[#FFFFFF] border-[#2D3436]";
    dotCls = "bg-[#FFFFFF]";
  } else if (["rejected", "revision_requested"].includes(status)) {
    cls = "bg-rose-50 text-rose-600 border-rose-200";
    dotCls = "bg-rose-500";
  }

  return (
    <span
      className={`inline-flex items-center px-3 py-1.5 rounded-[12px] text-[9px] font-black uppercase tracking-widest shadow-sm border transition-all duration-300 ${cls}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full mr-2 ${dotCls}`}></span>
      {label}
    </span>
  );
};

// ─────────────────────────────────────────────────────────────────────
// PIPELINE BAR COMPONENT
// ─────────────────────────────────────────────────────────────────────
const PipelineBar = ({ label, value, rate, colorClass }) => {
  return (
    <div className="flex items-center gap-4 group">
      <span className="text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-widest w-28 shrink-0 group-hover:text-[#6C5CE7] transition-colors">
        {label}
      </span>
      <div className="flex-1 bg-[#F5F6FA] rounded-full h-2.5 overflow-hidden shadow-inner">
        <div
          className={`${colorClass} h-full rounded-full transition-all duration-1000 ease-out relative`}
          style={{ width: `${rate}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FFFFFF]/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
        </div>
      </div>
      <div className="w-16 flex flex-col items-end shrink-0">
        <span className="text-[13px] font-black text-[#2D3436] group-hover:scale-110 transition-transform">
          {value}
        </span>
        <span className="text-[9px] font-bold text-[#2D3436] opacity-40 uppercase tracking-widest">
          {rate}%
        </span>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────
// COMPANY DASHBOARD MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────
export default function CompanyDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data, loading, error } = useSelector((s) => s.dashboard);
  const userName = useSelector(
    (state) => state.user?.user?.fullName || "Company Admin",
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

  if (!data) return null;

  const {
    kpis,
    pipeline,
    internshipStats,
    internStats,
    atRisk,
    recentActivity,
    actions,
  } = data;

  const pipelineColors = {
    applied: "bg-[#2D3436]",
    shortlisted: "bg-[#6C5CE7]",
    selected: "bg-emerald-400",
    offer_accepted: "bg-emerald-500",
    ongoing: "bg-cyan-500",
    completed: "bg-[#2D3436] opacity-40",
    rejected: "bg-rose-400",
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#2D3436] font-['Nunito'] pb-12 transition-colors duration-500 selection:bg-[#6C5CE7]/20 selection:text-[#6C5CE7]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* HEADER (Now scrolls smoothly with the rest of the content) */}
        <div className="bg-[#F5F6FA] border border-transparent rounded-[32px] p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
          <div className="flex flex-col gap-2">
            <h1 className="text-[28px] md:text-4xl font-black text-[#2D3436] m-0 tracking-tighter uppercase leading-tight">
              Welcome,{" "}
              <span className="text-[#6C5CE7]">{userName.split(" ")[0]}</span>
            </h1>
            <p className="text-[12px] font-black text-[#2D3436] opacity-40 uppercase tracking-[0.2em] m-0">
              Internship management overview
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
            label="Active Internships"
            value={kpis?.activeInternships}
            sub={`${kpis?.totalInternships} total records`}
            icon={Briefcase}
            onClick={() => navigate("/company/company-internships")}
          />
          <KpiCard
            label="Total Applicants"
            value={kpis?.totalApplicants}
            icon={Users}
            onClick={() => navigate("/company/company-internships")}
          />
          <KpiCard
            label="Ongoing Interns"
            value={kpis?.ongoingInterns}
            sub={`${kpis?.completedInterns} completed successfully`}
            icon={CheckCircle2}
            onClick={() => navigate("/company/interns")}
          />
          <KpiCard
            label="Avg Intern Score"
            value={
              kpis?.avgInternScore != null ? `${kpis.avgInternScore}/10` : "—"
            }
            sub={`${kpis?.selectedCandidates} selected candidates`}
            icon={Star}
            warn={kpis?.avgInternScore != null && kpis.avgInternScore < 5}
          />
        </div>

        {/* Pipeline + Internship Stats */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <SectionCard title="Hiring Pipeline" icon={BarChart2}>
            <div className="space-y-6 flex-1 flex flex-col justify-center">
              {Object.entries(pipeline || {}).map(([key, val]) => (
                <PipelineBar
                  key={key}
                  label={STATUS_LABELS[key] || key}
                  value={val.count}
                  rate={val.conversionRate}
                  colorClass={pipelineColors[key] || "bg-[#6C5CE7]"}
                />
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Internship Stats" icon={Briefcase}>
            <div className="overflow-x-auto no-scrollbar flex-1 flex flex-col">
              {internshipStats?.length ? (
                <div className="flex flex-col gap-1">
                  {/* Custom Header */}
                  <div className="grid grid-cols-4 gap-4 py-3 border-b border-[#F5F6FA] px-2 mb-2 hidden sm:grid">
                    <span className="text-[10px] font-black text-[#2D3436] opacity-40 uppercase tracking-widest col-span-1">
                      Title
                    </span>
                    <span className="text-[10px] font-black text-[#2D3436] opacity-40 uppercase tracking-widest col-span-1">
                      Applicants
                    </span>
                    <span className="text-[10px] font-black text-[#2D3436] opacity-40 uppercase tracking-widest col-span-1">
                      Selected
                    </span>
                    <span className="text-[10px] font-black text-[#2D3436] opacity-40 uppercase tracking-widest col-span-1">
                      Ongoing
                    </span>
                  </div>

                  {internshipStats.map((i) => (
                    <TableRow
                      key={i._id}
                      cols={[
                        i.title,
                        <span className="bg-[#F5F6FA] px-3 py-1 rounded-md text-[12px]">
                          {i.applicants}
                        </span>,
                        <span className="text-emerald-500 font-black">
                          {i.selected}
                        </span>,
                        <span className="text-[#6C5CE7] font-black">
                          {i.ongoing}
                        </span>,
                      ]}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-[#F5F6FA] p-8 text-center rounded-[20px] border-2 border-dashed border-[#6C5CE7]/20 flex-1 flex items-center justify-center">
                  <p className="text-[12px] font-black text-[#2D3436] opacity-40 uppercase tracking-[0.2em] m-0">
                    No internships found.
                  </p>
                </div>
              )}
            </div>
          </SectionCard>
        </div>

        {/* Intern Stats + At-Risk */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <SectionCard title="Intern Performance" icon={Activity}>
            <div className="overflow-x-auto no-scrollbar flex-1 flex flex-col">
              {internStats?.length ? (
                <div className="flex flex-col gap-1">
                  {/* Custom Header */}
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

                  {internStats.map((i) => (
                    <TableRow
                      key={i.id}
                      cols={[
                        i.name,
                        i.internship,
                        <div className="flex items-center gap-2">
                          <span className="text-[#6C5CE7]">{i.progress}%</span>
                          <div className="w-full max-w-[50px] h-1.5 bg-[#F5F6FA] rounded-full hidden sm:block">
                            <div
                              className="h-full bg-[#6C5CE7] rounded-full"
                              style={{ width: `${i.progress}%` }}
                            ></div>
                          </div>
                        </div>,
                        <span className="bg-[#F5F6FA] px-2 py-1 rounded-md">
                          {i.avgScore != null ? `${i.avgScore}/10` : "—"}
                        </span>,
                      ]}
                      onClick={() =>
                        navigate(`/company/interns/${i.id}/progress`)
                      }
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-[#F5F6FA] p-8 text-center rounded-[20px] border-2 border-dashed border-[#6C5CE7]/20 flex-1 flex items-center justify-center">
                  <p className="text-[12px] font-black text-[#2D3436] opacity-40 uppercase tracking-[0.2em] m-0">
                    No ongoing interns.
                  </p>
                </div>
              )}
            </div>
          </SectionCard>

          <SectionCard
            title="At-Risk Interns"
            icon={AlertTriangle}
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
                    key={a.id}
                    style={{ animationDelay: `${idx * 50}ms` }}
                    onClick={() =>
                      navigate(`/company/interns/${a.id}/progress`)
                    }
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
                <CheckCircle2 className="w-10 h-10 text-emerald-400 animate-bounce" />
                <p className="text-[12px] font-black text-[#2D3436] opacity-60 uppercase tracking-[0.2em] m-0">
                  No at-risk interns. System healthy.
                </p>
              </div>
            )}
          </SectionCard>
        </div>

        {/* Recent Activity */}
        <SectionCard title="Recent Activity" icon={Clock}>
          {/* Custom Table Header */}
          <div className="grid grid-cols-4 gap-4 py-3 border-b border-[#F5F6FA] px-2 mb-2 hidden sm:grid">
            <span className="text-[10px] font-black text-[#2D3436] opacity-40 uppercase tracking-widest col-span-1">
              Student
            </span>
            <span className="text-[10px] font-black text-[#2D3436] opacity-40 uppercase tracking-widest col-span-1">
              Internship
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
                key={a.id}
                style={{ animationDelay: `${idx * 50}ms` }}
                className="animate-in fade-in fill-mode-both"
              >
                <TableRow
                  cols={[
                    a.student,
                    a.internship,
                    <Badge
                      label={STATUS_LABELS[a.status] || a.status}
                      status={a.status}
                    />,
                    a.date
                      ? new Date(a.date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })
                      : "—",
                  ]}
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
