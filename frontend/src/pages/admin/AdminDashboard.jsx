import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchDashboard } from "../../store/dashboardSlice";

// ─── HELPERS ──────────────────────────────────────────────────────────
const fmt = (n) => (n ?? 0).toLocaleString();
const timeAgo = (d) => {
  if (!d) return "—";
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

// ─── KPI CARD ─────────────────────────────────────────────────────────
const KpiCard = ({ label, value, sub, accent, onClick }) => (
  <div
    onClick={onClick}
    className={`bg-[#FFFFFF] border border-[#F5F6FA] rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-8 flex flex-col gap-2 cursor-pointer hover:shadow-[0_20px_50px_rgba(108,92,231,0.08)] hover:-translate-y-1 hover:border-[#6C5CE7]/30 transition-all duration-300 group ${accent || ""}`}
  >
    <span className="text-[11px] font-black uppercase tracking-widest text-[#2D3436] opacity-50 group-hover:text-[#6C5CE7] transition-colors">
      {label}
    </span>
    <span className="text-[36px] font-black text-[#2D3436] leading-none group-hover:text-[#6C5CE7] transition-colors mt-2">
      {fmt(value)}
    </span>
    {sub && (
      <span className="text-[11px] font-bold text-[#2D3436] opacity-40 mt-2">
        {sub}
      </span>
    )}
  </div>
);

// ─── SECTION CARD ─────────────────────────────────────────────────────
const SectionCard = ({ title, children, className = "" }) => (
  <div
    className={`bg-[#FFFFFF] border border-[#F5F6FA] rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] ${className}`}
  >
    <div className="px-8 py-6 border-b border-[#F5F6FA] bg-[#FFFFFF] flex items-center">
      <h2 className="text-[13px] font-black text-[#6C5CE7] uppercase tracking-[0.2em] m-0 border-l-4 border-[#6C5CE7] pl-4 flex items-center h-5">
        {title}
      </h2>
    </div>
    <div className="p-8">{children}</div>
  </div>
);

// ─── TABLE ROW ────────────────────────────────────────────────────────
const TableRow = ({ left, right, muted }) => (
  <div className="flex items-center justify-between py-4 border-b border-[#F5F6FA] last:border-0 group transition-colors hover:bg-[#F5F6FA]/30 px-2 rounded-lg">
    <span
      className={`text-[13px] font-bold ${muted ? "text-[#2D3436] opacity-40 italic" : "text-[#2D3436] opacity-80 group-hover:text-[#6C5CE7] transition-colors"}`}
    >
      {left}
    </span>
    <span className="text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-widest">
      {right}
    </span>
  </div>
);

// ─── ACTION ITEM ──────────────────────────────────────────────────────
const ActionItem = ({ label, route, navigate }) => (
  <button
    onClick={() => navigate(route)}
    className="w-full text-left px-6 py-4 rounded-[16px] bg-[#F5F6FA] hover:bg-[#FFFFFF] hover:border-[#6C5CE7] hover:text-[#6C5CE7] hover:shadow-md text-[11px] font-black text-[#2D3436] uppercase tracking-widest transition-all duration-300 border border-transparent flex items-center justify-between group outline-none transform hover:-translate-y-0.5 active:scale-95"
  >
    <span>{label}</span>
    <span className="text-[#6C5CE7] opacity-0 group-hover:opacity-100 transition-opacity transform -translate-x-2 group-hover:translate-x-0">
      →
    </span>
  </button>
);

// ─── BADGE ────────────────────────────────────────────────────────────
const Badge = ({ n, warn }) =>
  n > 0 ? (
    <span
      className={`ml-3 px-2.5 py-1 rounded-[10px] text-[10px] font-black uppercase tracking-widest shadow-sm flex items-center ${warn ? "bg-rose-50 text-rose-600 border border-rose-200" : "bg-[#F5F6FA] text-[#6C5CE7] border border-transparent"}`}
    >
      {warn && (
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-2 animate-pulse"></span>
      )}
      {n}
    </span>
  ) : null;

// ─── STAT ROW ─────────────────────────────────────────────────────────
const StatRow = ({ label, value, highlight }) => (
  <div className="flex items-center justify-between py-3.5 border-b border-[#F5F6FA] last:border-0 hover:bg-[#F5F6FA]/30 px-2 rounded-lg transition-colors group">
    <span className="text-[12px] font-black text-[#2D3436] opacity-50 uppercase tracking-widest">
      {label}
    </span>
    <span
      className={`text-[15px] font-black ${highlight ? "text-emerald-500" : "text-[#2D3436]"} group-hover:scale-105 transition-transform`}
    >
      {value}
    </span>
  </div>
);

// ─── ACTIVITY DOT ─────────────────────────────────────────────────────
const dotColor = (type) => {
  if (type?.includes("college")) return "bg-[#6C5CE7]";
  if (type?.includes("company")) return "bg-sky-400";
  return "bg-emerald-400";
};

// ═══════════════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ═══════════════════════════════════════════════════════════════════════
export default function AdminDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data, loading, error } = useSelector((s) => s.dashboard);

  useEffect(() => {
    dispatch(fetchDashboard());
  }, [dispatch]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFFFF] font-['Nunito']">
        <div className="flex flex-col items-center gap-4 animate-in fade-in duration-700">
          <div className="w-12 h-12 border-4 border-[#F5F6FA] border-t-[#6C5CE7] rounded-full animate-spin" />
          <span className="text-[12px] font-black text-[#6C5CE7] uppercase tracking-widest animate-pulse">
            Loading dashboard...
          </span>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFFFF] font-['Nunito'] p-4">
        <div className="bg-rose-50 border border-rose-200 rounded-[24px] p-10 text-center max-w-md shadow-sm animate-in zoom-in duration-500">
          <p className="text-rose-600 font-black text-[16px] mb-2 uppercase tracking-widest">
            Failed to load
          </p>
          <p className="text-rose-500 font-bold text-[13px] mb-6 opacity-80">
            {error}
          </p>
          <button
            onClick={() => dispatch(fetchDashboard())}
            className="px-6 py-3 bg-rose-600 text-[#FFFFFF] rounded-[14px] text-[11px] font-black uppercase tracking-widest hover:bg-rose-700 hover:shadow-md transition-all duration-300 outline-none transform active:scale-95"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );

  if (!data) return null;

  const {
    kpis,
    onboarding,
    growth,
    systemStats,
    atRisk,
    recentActivity,
    actions,
  } = data;
  const totalPending =
    (onboarding?.pendingCollegeRequests ?? 0) +
    (onboarding?.pendingCompanyRequests ?? 0);

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#2D3436] font-['Nunito'] pb-12 transition-colors duration-500 selection:bg-[#6C5CE7]/20 selection:text-[#6C5CE7]">
      {/* ── HEADER ─────────────────────────────────── */}
      <div className="bg-[#FFFFFF] border-b border-[#F5F6FA] px-6 py-6 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-[24px] md:text-3xl font-black text-[#2D3436] m-0 tracking-tighter uppercase leading-tight">
              Admin Dashboard
            </h1>
            <p className="text-[11px] font-black text-[#6C5CE7] opacity-80 uppercase tracking-[0.2em] m-0">
              System Overview & Controls
            </p>
          </div>
          {totalPending > 0 && (
            <button
              onClick={() => navigate("/admin/onboarding/pending")}
              className="flex items-center gap-3 px-5 py-3 bg-amber-50 border border-amber-200 rounded-[14px] text-amber-700 text-[11px] font-black uppercase tracking-widest hover:bg-amber-100 hover:shadow-sm transition-all duration-300 outline-none transform active:scale-95 cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              {totalPending} Pending Request{totalPending !== 1 ? "s" : ""}
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* ── 1. KPI CARDS ─────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          <KpiCard
            label="Total Users"
            value={kpis?.totalUsers}
            sub={`${fmt(kpis?.activeUsers)} active (30d)`}
            onClick={() => navigate("/admin/users")}
          />
          <KpiCard
            label="Students"
            value={kpis?.totalStudents}
            onClick={() => navigate("/admin/users")}
          />
          <KpiCard
            label="Faculty"
            value={kpis?.totalFaculty}
            onClick={() => navigate("/admin/users")}
          />
          <KpiCard
            label="Applications"
            value={kpis?.totalApplications}
            sub={`${systemStats?.successRate ?? 0}% success rate`}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          <KpiCard
            label="Colleges"
            value={kpis?.totalColleges}
            onClick={() => navigate("/admin/colleges")}
          />
          <KpiCard
            label="Companies"
            value={kpis?.totalCompanies}
            onClick={() => navigate("/admin/companies")}
          />
          <KpiCard
            label="Active Internships"
            value={systemStats?.activeInternships}
          />
          <KpiCard
            label="Completed"
            value={systemStats?.completedInternships}
            accent="border-b-4 border-b-emerald-400"
          />
        </div>

        {/* ── 2. ONBOARDING + ACTIONS ──────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <SectionCard
            title={
              <>
                Onboarding Status
                <Badge n={totalPending} warn />
              </>
            }
            className="xl:col-span-2"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div
                onClick={() => navigate("/admin/onboarding/pending")}
                className={`rounded-[24px] p-6 cursor-pointer border transition-all duration-300 hover:-translate-y-1 hover:shadow-md group ${onboarding?.pendingCollegeRequests > 0 ? "bg-amber-50 border-amber-200" : "bg-[#F5F6FA] border-transparent hover:border-[#6C5CE7]/30 hover:bg-[#FFFFFF]"}`}
              >
                <p
                  className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 ${onboarding?.pendingCollegeRequests > 0 ? "text-amber-700" : "text-[#2D3436] opacity-50 group-hover:text-[#6C5CE7]"}`}
                >
                  College Requests
                </p>
                <p
                  className={`text-[40px] font-black leading-none ${onboarding?.pendingCollegeRequests > 0 ? "text-amber-600" : "text-[#2D3436]"}`}
                >
                  {onboarding?.pendingCollegeRequests ?? 0}
                </p>
                <p
                  className={`text-[11px] font-bold mt-2 uppercase tracking-widest ${onboarding?.pendingCollegeRequests > 0 ? "text-amber-600 opacity-80" : "text-[#2D3436] opacity-40"}`}
                >
                  Pending Approval
                </p>
              </div>
              <div
                onClick={() => navigate("/admin/onboarding/pending")}
                className={`rounded-[24px] p-6 cursor-pointer border transition-all duration-300 hover:-translate-y-1 hover:shadow-md group ${onboarding?.pendingCompanyRequests > 0 ? "bg-amber-50 border-amber-200" : "bg-[#F5F6FA] border-transparent hover:border-[#6C5CE7]/30 hover:bg-[#FFFFFF]"}`}
              >
                <p
                  className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 ${onboarding?.pendingCompanyRequests > 0 ? "text-amber-700" : "text-[#2D3436] opacity-50 group-hover:text-[#6C5CE7]"}`}
                >
                  Company Requests
                </p>
                <p
                  className={`text-[40px] font-black leading-none ${onboarding?.pendingCompanyRequests > 0 ? "text-amber-600" : "text-[#2D3436]"}`}
                >
                  {onboarding?.pendingCompanyRequests ?? 0}
                </p>
                <p
                  className={`text-[11px] font-bold mt-2 uppercase tracking-widest ${onboarding?.pendingCompanyRequests > 0 ? "text-amber-600 opacity-80" : "text-[#2D3436] opacity-40"}`}
                >
                  Pending Approval
                </p>
              </div>
            </div>

            {onboarding?.recentApproved?.length > 0 && (
              <div>
                <p className="text-[10px] text-[#2D3436] opacity-40 font-black uppercase tracking-[0.2em] mb-4 border-b border-[#F5F6FA] pb-2">
                  Recently Approved
                </p>
                {onboarding.recentApproved.slice(0, 4).map((r) => (
                  <TableRow
                    key={r._id}
                    left={r.collegeName || r.companyName}
                    right={timeAgo(r.reviewedAt)}
                  />
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard title="Quick Actions">
            <div className="flex flex-col gap-3">
              {(actions || []).map((a) => (
                <ActionItem
                  key={a.route}
                  label={a.label}
                  route={a.route}
                  navigate={navigate}
                />
              ))}
            </div>
          </SectionCard>
        </div>

        {/* ── 3. GROWTH + SYSTEM STATS ─────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <SectionCard title="Growth — Last 30 Days">
            <StatRow
              label="New Users"
              value={`+${fmt(growth?.newUsers)}`}
              highlight
            />
            <StatRow
              label="New Colleges"
              value={`+${fmt(growth?.newColleges)}`}
            />
            <StatRow
              label="New Companies"
              value={`+${fmt(growth?.newCompanies)}`}
            />
            <StatRow
              label="New Applications"
              value={`+${fmt(growth?.newApplications)}`}
            />
            {growth?.byRole && Object.keys(growth.byRole).length > 0 && (
              <div className="mt-6 pt-6 border-t border-[#F5F6FA]">
                <p className="text-[10px] text-[#2D3436] opacity-40 font-black uppercase tracking-[0.2em] mb-4">
                  By Role
                </p>
                {Object.entries(growth.byRole).map(([role, count]) => (
                  <div
                    key={role}
                    className="flex items-center gap-4 mb-3 group"
                  >
                    <span className="text-[11px] font-black text-[#2D3436] opacity-60 uppercase tracking-widest w-24 group-hover:text-[#6C5CE7] transition-colors">
                      {role}
                    </span>
                    <div className="flex-1 bg-[#F5F6FA] rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-[#6C5CE7] h-full rounded-full transition-all duration-1000 ease-out relative"
                        style={{
                          width: `${Math.min(100, (count / (growth.newUsers || 1)) * 100)}%`,
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FFFFFF]/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
                      </div>
                    </div>
                    <span className="text-[12px] font-black text-[#2D3436] w-8 text-right">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard title="System Stats">
            <StatRow
              label="Active Internships"
              value={fmt(systemStats?.activeInternships)}
              highlight
            />
            <StatRow
              label="Ongoing Applications"
              value={fmt(systemStats?.ongoingApplications)}
            />
            <StatRow
              label="Completed Internships"
              value={fmt(systemStats?.completedInternships)}
            />
            <StatRow
              label="Closed Listings"
              value={fmt(systemStats?.closedInternships)}
            />
            <div className="mt-6 pt-6 border-t border-[#F5F6FA]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-widest">
                  Success Rate
                </span>
                <span className="text-[16px] font-black text-emerald-500">
                  {systemStats?.successRate ?? 0}%
                </span>
              </div>
              <div className="bg-[#F5F6FA] rounded-full h-3 overflow-hidden shadow-inner">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-1000 ease-out relative"
                  style={{ width: `${systemStats?.successRate ?? 0}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FFFFFF]/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* ── 4. AT-RISK + RECENT ACTIVITY ─────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* AT RISK */}
          <SectionCard
            title={
              <>
                At-Risk Items
                {atRisk?.length > 0 && <Badge n={atRisk.length} warn />}
              </>
            }
            className={
              atRisk?.length > 0
                ? "border-rose-100 shadow-[0_8px_30px_rgba(225,29,72,0.05)] hover:border-rose-200"
                : ""
            }
          >
            {!atRisk?.length ? (
              <div className="bg-[#F5F6FA] p-8 text-center rounded-[20px] border-2 border-dashed border-[#6C5CE7]/20">
                <p className="text-[12px] font-black text-[#2D3436] opacity-40 uppercase tracking-[0.2em] m-0">
                  No risks detected. System looks healthy.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {atRisk.slice(0, 10).map((item, i) => (
                  <div
                    key={item.id ?? i}
                    className={`rounded-[16px] px-5 py-4 border text-[13px] font-bold shadow-sm transition-transform hover:-translate-y-0.5 ${
                      item.type?.includes("unverified") ||
                      item.type?.includes("stalled") ||
                      item.type?.includes("onboarding")
                        ? "bg-amber-50 border-amber-200 text-amber-800"
                        : "bg-rose-50 border-rose-200 text-rose-700"
                    }`}
                  >
                    {item.reason}
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* RECENT ACTIVITY */}
          <SectionCard title="Recent Activity">
            {!recentActivity?.length ? (
              <div className="bg-[#F5F6FA] p-8 text-center rounded-[20px] border-2 border-dashed border-[#6C5CE7]/20">
                <p className="text-[12px] font-black text-[#2D3436] opacity-40 uppercase tracking-[0.2em] m-0">
                  No recent activity.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentActivity.slice(0, 10).map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 py-3 border-b border-[#F5F6FA] last:border-0 group hover:bg-[#F5F6FA]/30 px-3 rounded-xl transition-colors"
                  >
                    <span
                      className={`w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-sm ${dotColor(item.type)}`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold text-[#2D3436] opacity-80 truncate m-0 group-hover:text-[#6C5CE7] transition-colors">
                        {item.label}
                      </p>
                    </div>
                    <span className="text-[10px] font-black text-[#2D3436] opacity-40 uppercase tracking-widest flex-shrink-0">
                      {timeAgo(item.time)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
