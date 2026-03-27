import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchDashboard } from "../../store/dashboardSlice";
import {
  Users,
  CheckCircle2,
  Activity,
  Star,
  Briefcase,
  BarChart2,
  AlertTriangle,
  Clock,
  ChevronRight,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────
// KPI CARD COMPONENT
// ─────────────────────────────────────────────────────────────────────
const KpiCard = ({
  label,
  value,
  unit = "",
  trend = null,
  icon: Icon,
  warn,
}) => (
  <div
    className={`bg-[#FFFFFF] border border-[#F5F6FA] rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-8 flex flex-col justify-between hover:shadow-[0_20px_50px_rgba(108,92,231,0.08)] hover:-translate-y-1 transition-all duration-300 group
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
          {value}
        </h3>
        {unit && (
          <span className="text-[12px] font-bold text-[#2D3436] opacity-40 uppercase tracking-widest">
            {unit}
          </span>
        )}
      </div>

      {trend !== null && (
        <div className="mt-3 flex items-center gap-1.5">
          <span
            className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-black
            ${trend > 0 ? "bg-emerald-50 text-emerald-600" : trend < 0 ? "bg-rose-50 text-rose-600" : "bg-[#F5F6FA] text-[#2D3436] opacity-50"}
          `}
          >
            {trend > 0 ? "↑" : trend < 0 ? "↓" : "−"}
          </span>
          <span
            className={`text-[11px] font-bold uppercase tracking-widest
             ${trend > 0 ? "text-emerald-600" : trend < 0 ? "text-rose-600" : "text-[#2D3436] opacity-50"}
          `}
          >
            {Math.abs(trend)}% vs last month
          </span>
        </div>
      )}
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────
// SECTION CARD COMPONENT
// ─────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────
// PIPELINE BAR COMPONENT
// ─────────────────────────────────────────────────────────────────────
const PipelineBar = ({ label, value, total, colorClass }) => {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="flex items-center gap-4 group">
      <span className="text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-widest w-24 shrink-0 group-hover:text-[#6C5CE7] transition-colors">
        {label}
      </span>
      <div className="flex-1 bg-[#F5F6FA] rounded-full h-2.5 overflow-hidden shadow-inner">
        <div
          className={`${colorClass} h-full rounded-full transition-all duration-1000 ease-out relative`}
          style={{ width: `${percentage}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FFFFFF]/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
        </div>
      </div>
      <div className="w-16 flex flex-col items-end shrink-0">
        <span className="text-[13px] font-black text-[#2D3436] group-hover:scale-110 transition-transform">
          {value}
        </span>
        <span className="text-[9px] font-bold text-[#2D3436] opacity-40 uppercase tracking-widest">
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────
// TABLE ROW COMPONENT
// ─────────────────────────────────────────────────────────────────────
const TableRow = ({ cells, onClick, danger = false }) => (
  <tr
    onClick={onClick}
    className={`border-b border-[#F5F6FA] transition-colors duration-300 group
      ${onClick ? "cursor-pointer hover:bg-[#F5F6FA]/50" : ""}
      ${danger ? "bg-rose-50 border-rose-100 hover:bg-rose-100" : ""}
    `}
  >
    {cells.map((cell, i) => (
      <td
        key={i}
        className={`px-4 py-4 text-[13px] font-bold text-[#2D3436] opacity-80 ${i === 0 ? "group-hover:text-[#6C5CE7] transition-colors" : ""}`}
      >
        {cell}
      </td>
    ))}
  </tr>
);

// ─────────────────────────────────────────────────────────────────────
// COLLEGE DASHBOARD MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────
export default function CollegeDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data, loading, error } = useSelector((state) => state.dashboard);
  const userName = useSelector(
    (state) => state.user?.user?.fullName || "College Admin",
  );

  useEffect(() => {
    dispatch(fetchDashboard());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] flex items-center justify-center font-['Nunito'] transition-all duration-300">
        <div className="flex flex-col items-center gap-4 animate-in fade-in duration-700">
          <div className="w-12 h-12 border-4 border-[#F5F6FA] border-t-[#6C5CE7] rounded-full animate-spin"></div>
          <p className="text-[12px] font-black text-[#6C5CE7] animate-pulse uppercase tracking-widest m-0">
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

  const {
    kpis = {},
    pipeline = {},
    specializationStats = [],
    facultyStats = {},
    atRisk = [],
    recentActivity = [],
  } = data || {};

  const totalApps =
    (pipeline.applied || 0) +
    (pipeline.shortlisted || 0) +
    (pipeline.selected || 0) +
    (pipeline.ongoing || 0) +
    (pipeline.completed || 0) +
    (pipeline.rejected || 0);

  // ─────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#2D3436] font-['Nunito'] pb-12 transition-colors duration-500 selection:bg-[#6C5CE7]/20 selection:text-[#6C5CE7]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* HEADER (Now scrolls smoothly with content) */}
        <div className="bg-[#F5F6FA] border border-transparent rounded-[32px] p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
          <div className="flex flex-col gap-2">
            <h1 className="text-[28px] md:text-4xl font-black text-[#2D3436] m-0 tracking-tighter uppercase leading-tight">
              Welcome,{" "}
              <span className="text-[#6C5CE7]">{userName.split(" ")[0]}</span>
            </h1>
            <p className="text-[12px] font-black text-[#2D3436] opacity-40 uppercase tracking-[0.2em] m-0">
              Monitor students, faculty & placements
            </p>
          </div>
        </div>

        {/* KPI SECTION 1 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          <KpiCard
            label="Total Students"
            value={kpis.totalStudents || 0}
            trend={12} // Mock trend for visualization
            icon={Users}
          />
          <KpiCard
            label="Active Students"
            value={kpis.activeStudents || 0}
            unit="Enrolled"
            icon={Activity}
          />
          <KpiCard
            label="Placement Rate"
            value={`${kpis.placementRate || 0}%`}
            trend={kpis.placementRate > 50 ? 5 : -2}
            icon={Briefcase}
          />
          <KpiCard
            label="Avg Student Score"
            value={kpis.avgStudentScore || 0}
            unit="/ 10"
            icon={Star}
            warn={
              (kpis.avgStudentScore || 0) < 5 && (kpis.avgStudentScore || 0) > 0
            }
          />
        </div>

        {/* KPI SECTION 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <KpiCard
            label="With Internships"
            value={kpis.studentsWithInternships || 0}
            icon={Briefcase}
          />
          <KpiCard
            label="Completed Internships"
            value={kpis.completedInternships || 0}
            icon={CheckCircle2}
          />
          <KpiCard
            label="Faculty (Active/Total)"
            value={`${kpis.activeFaculty || 0} / ${kpis.totalFaculty || 0}`}
            icon={Users}
          />
        </div>

        {/* PIPELINE & SPECIALIZATIONS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <SectionCard
            title="Application Pipeline"
            icon={BarChart2}
            action={{
              label: "View All",
              onClick: () => navigate("/college/students"),
            }}
          >
            <div className="space-y-6 flex-1 flex flex-col justify-center">
              <PipelineBar
                label="Applied"
                value={pipeline.applied || 0}
                total={totalApps}
                colorClass="bg-[#2D3436]"
              />
              <PipelineBar
                label="Shortlisted"
                value={pipeline.shortlisted || 0}
                total={totalApps}
                colorClass="bg-[#6C5CE7]"
              />
              <PipelineBar
                label="Selected"
                value={pipeline.selected || 0}
                total={totalApps}
                colorClass="bg-emerald-400"
              />
              <PipelineBar
                label="Ongoing"
                value={pipeline.ongoing || 0}
                total={totalApps}
                colorClass="bg-emerald-500"
              />
              <PipelineBar
                label="Completed"
                value={pipeline.completed || 0}
                total={totalApps}
                colorClass="bg-[#2D3436] opacity-40"
              />
              <PipelineBar
                label="Rejected"
                value={pipeline.rejected || 0}
                total={totalApps}
                colorClass="bg-rose-400"
              />

              <div className="mt-4 pt-6 border-t border-[#F5F6FA] flex items-center justify-between bg-[#F5F6FA] p-4 rounded-[16px]">
                <span className="text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-widest">
                  Overall Conversion
                </span>
                <span className="text-[16px] font-black text-emerald-500">
                  {pipeline.conversionRate || 0}%
                </span>
              </div>
            </div>
          </SectionCard>

          {/* SPECIALIZATION STATS */}
          <SectionCard
            title="By Specialization"
            icon={Activity}
            action={{
              label: "View All",
              onClick: () => navigate("/college/courses"),
            }}
          >
            {specializationStats.length > 0 ? (
              <div className="overflow-x-auto no-scrollbar flex-1">
                <table className="w-full text-left border-collapse min-w-max">
                  <thead>
                    <tr className="border-b border-[#F5F6FA] bg-[#F5F6FA] bg-opacity-50">
                      <th className="px-4 py-3 text-[10px] font-black text-[#2D3436] opacity-40 uppercase tracking-[0.15em] rounded-tl-[12px]">
                        Specialization
                      </th>
                      <th className="px-4 py-3 text-[10px] font-black text-[#2D3436] opacity-40 uppercase tracking-[0.15em]">
                        Placed
                      </th>
                      <th className="px-4 py-3 text-[10px] font-black text-[#2D3436] opacity-40 uppercase tracking-[0.15em] rounded-tr-[12px]">
                        Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {specializationStats.slice(0, 6).map((spec, idx) => (
                      <TableRow
                        key={idx}
                        cells={[
                          spec.specialization || "N/A",
                          <span className="bg-[#FFFFFF] px-2 py-1 rounded-md shadow-sm border border-[#F5F6FA] text-[12px] font-mono">{`${spec.placed} / ${spec.total}`}</span>,
                          <span className="text-emerald-500 font-black">{`${spec.placementRate}%`}</span>,
                        ]}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-[#F5F6FA] p-8 text-center rounded-[20px] border-2 border-dashed border-[#6C5CE7]/20 flex-1 flex items-center justify-center">
                <p className="text-[12px] font-black text-[#2D3436] opacity-40 uppercase tracking-[0.2em] m-0">
                  No data available
                </p>
              </div>
            )}
          </SectionCard>
        </div>

        {/* FACULTY & AT-RISK */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* TOP FACULTY */}
          <SectionCard
            title="Top Faculty"
            icon={Star}
            action={{
              label: "Manage",
              onClick: () => navigate("/college/faculty"),
            }}
          >
            {facultyStats.top5 && facultyStats.top5.length > 0 ? (
              <div className="overflow-x-auto no-scrollbar flex-1">
                <table className="w-full text-left border-collapse min-w-max">
                  <thead>
                    <tr className="border-b border-[#F5F6FA] bg-[#F5F6FA] bg-opacity-50">
                      <th className="px-4 py-3 text-[10px] font-black text-[#2D3436] opacity-40 uppercase tracking-[0.15em] rounded-tl-[12px]">
                        Name
                      </th>
                      <th className="px-4 py-3 text-[10px] font-black text-[#2D3436] opacity-40 uppercase tracking-[0.15em]">
                        Students
                      </th>
                      <th className="px-4 py-3 text-[10px] font-black text-[#2D3436] opacity-40 uppercase tracking-[0.15em] rounded-tr-[12px]">
                        Active
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {facultyStats.top5.map((fac) => (
                      <TableRow
                        key={fac.id}
                        cells={[
                          fac.name,
                          fac.studentsCount,
                          <span className="text-[#6C5CE7] font-black bg-[#6C5CE7]/10 px-2 py-1 rounded-md">
                            {fac.activeInternships}
                          </span>,
                        ]}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-[#F5F6FA] p-8 text-center rounded-[20px] border-2 border-dashed border-[#6C5CE7]/20 flex-1 flex items-center justify-center">
                <p className="text-[12px] font-black text-[#2D3436] opacity-40 uppercase tracking-[0.2em] m-0">
                  No faculty data
                </p>
              </div>
            )}
          </SectionCard>

          {/* AT-RISK STUDENTS */}
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
              onClick: () => navigate("/college/at-risk"),
            }}
          >
            {atRisk && atRisk.length > 0 ? (
              <div className="space-y-3 flex-1">
                {atRisk.slice(0, 5).map((student, idx) => (
                  <div
                    key={student.id}
                    style={{ animationDelay: `${idx * 50}ms` }}
                    className="bg-rose-50 border border-rose-200 rounded-[16px] p-4 cursor-pointer hover:bg-rose-100 hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in fill-mode-both group"
                    onClick={() => navigate(`/college/at-risk/${student.id}`)}
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
        </div>

        {/* RECENT ACTIVITY */}
        <SectionCard title="Recent Activity" icon={Clock}>
          {recentActivity && recentActivity.length > 0 ? (
            <div className="space-y-2">
              {recentActivity.slice(0, 8).map((activity, idx) => (
                <div
                  key={idx}
                  style={{ animationDelay: `${idx * 50}ms` }}
                  className="flex items-center gap-4 py-3 border-b border-[#F5F6FA] last:border-0 hover:bg-[#F5F6FA]/50 -mx-4 px-4 rounded-[16px] transition-colors group animate-in fade-in fill-mode-both"
                >
                  <div className="p-2 bg-[#F5F6FA] rounded-[10px] group-hover:bg-[#FFFFFF] group-hover:shadow-sm transition-all">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#6C5CE7] shadow-sm"></div>
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
                    <p className="text-[13px] font-bold text-[#2D3436] opacity-80 m-0 truncate group-hover:text-[#6C5CE7] transition-colors">
                      {activity.label}
                    </p>
                    <p className="text-[10px] font-black text-[#2D3436] opacity-40 uppercase tracking-widest m-0 shrink-0">
                      {new Date(activity.time).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#F5F6FA] p-8 text-center rounded-[20px] border-2 border-dashed border-[#6C5CE7]/20">
              <p className="text-[12px] font-black text-[#2D3436] opacity-40 uppercase tracking-[0.2em] m-0">
                No recent activity
              </p>
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
