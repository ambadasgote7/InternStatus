import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchDashboard } from '../../store/dashboardSlice';
import { 
  Users, Briefcase, Award, AlertCircle, 
  ArrowUpRight, Clock, CheckCircle, ChevronRight 
} from 'lucide-react';

const CollegeDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data, loading, error } = useSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboard());
  }, []);

  if (loading) return <div className="flex h-screen items-center justify-center bg-gray-50">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>;

  if (error) return <div className="p-10 text-red-500 font-medium">Error: {error}</div>;

  const {
  kpis = {},
  pipeline = {},
  specializations = [],
  facultyEngagement = { topFaculty: [], inactiveFaculty: [] },
  atRisk = [],
  credits = {},
  recentActivity = [],
  actionQueue = []
} = data || {};


  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans text-gray-900">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">Institutional Overview</h1>
          <p className="text-gray-500 font-medium">Real-time placement and academic compliance data.</p>
        </div>
        <div className="flex gap-3">
          {actionQueue.map((action, idx) => (
            <button 
              key={idx}
              onClick={() => navigate(action.route)}
              className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl shadow-sm hover:shadow-md transition-all text-sm font-bold text-gray-700"
            >
              {action.label}
              <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs">{action.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <KpiCard title="Total Students" value={kpis.totalStudents} sub={`${kpis.activeStudents} Active`} icon={<Users className="text-blue-600" />} color="blue" />
        <KpiCard title="Placement Rate" value={`${kpis.placementRate}%`} sub={`${kpis.studentsWithInternships} Placed`} icon={<Briefcase className="text-green-600" />} color="green" />
        <KpiCard title="Credits Earned" value={credits.totalCredits} sub={`${credits.completed} Verified`} icon={<Award className="text-purple-600" />} color="purple" />
        <KpiCard title="Avg Score" value={kpis.avgStudentScore} sub="Out of 10.0" icon={<CheckCircle className="text-yellow-600" />} color="yellow" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: CRITICAL INTERVENTIONS */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* SPECIALIZATION TABLE */}
          <SectionCard title="Departmental Performance" subtitle="Sorted by placement efficiency">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-gray-100 text-xs uppercase text-gray-400 font-bold">
                  <tr>
                    <th className="pb-4 px-2">Specialization</th>
                    <th className="pb-4">Total</th>
                    <th className="pb-4">Placed</th>
                    <th className="pb-4">Success Rate</th>
                    <th className="pb-4 text-right">Avg Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {specializations.map((spec, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors group cursor-pointer" onClick={() => navigate('/college/courses')}>
                      <td className="py-4 px-2 font-bold text-gray-800">{spec.specialization}</td>
                      <td className="py-4 text-gray-500">{spec.totalStudents}</td>
                      <td className="py-4 font-semibold">{spec.placedStudents}</td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full max-w-[100px]">
                            <div className="h-full bg-blue-600 rounded-full" style={{ width: `${spec.placementRate}%` }}></div>
                          </div>
                          <span className="text-xs font-bold">{spec.placementRate.toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="py-4 text-right font-mono text-blue-600 font-bold">{spec.avgScore.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>

          {/* FACULTY ENGAGEMENT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SectionCard title="Top Performing Faculty">
              <div className="space-y-4">
                {facultyEngagement.topFaculty.map((f, i) => (
                  <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div>
                      <p className="font-bold text-sm">{f.fullName}</p>
                      <p className="text-xs text-gray-500">{f.activeInternships} Ongoing Internships</p>
                    </div>
                    <span className="text-lg font-black text-gray-300">#{i + 1}</span>
                  </div>
                ))}
              </div>
            </SectionCard>
            <SectionCard title="Inactive Faculty">
              <div className="space-y-4">
                {facultyEngagement.inactiveFaculty.length > 0 ? (
                  facultyEngagement.inactiveFaculty.map((f, i) => (
                    <div key={i} className="flex justify-between items-center p-3 rounded-xl border border-dashed border-gray-200">
                      <p className="font-medium text-sm text-gray-600">{f.fullName}</p>
                      <StatusBadge status="unassigned" />
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400 italic">All faculty currently assigned.</p>
                )}
              </div>
            </SectionCard>
          </div>
        </div>

        {/* RIGHT COLUMN: ACTION & ACTIVITY */}
        <div className="space-y-8">
          
          {/* AT-RISK HIGHLIGHT */}
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 text-red-600 mb-4">
              <AlertCircle size={20} />
              <h3 className="font-black uppercase tracking-wider text-xs">High Risk: Requires Action</h3>
            </div>
            <div className="space-y-3">
              {atRisk.map((s, i) => (
                <div 
                  key={i} 
                  className="bg-white p-3 rounded-xl shadow-sm flex justify-between items-center cursor-pointer hover:translate-x-1 transition-transform border border-red-100"
                  onClick={() => navigate(`/college/students`)}
                >
                  <div>
                    <p className="text-sm font-bold text-gray-800">{s.name}</p>
                    <p className="text-[10px] text-red-500 font-semibold uppercase">{s.reason}</p>
                  </div>
                  <ChevronRight size={14} className="text-gray-300" />
                </div>
              ))}
            </div>
          </div>

          {/* RECENT ACTIVITY */}
          <SectionCard title="Recent Activity">
            <div className="space-y-6 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-gray-100">
              {recentActivity.map((act, i) => (
                <div key={i} className="relative pl-8 group cursor-pointer" onClick={() => navigate(`/academic-internship-track/${act.id}`)}>
                  <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-white border-2 border-blue-500 z-10"></div>
                  <p className="text-xs text-gray-400 font-bold mb-1">{new Date(act.date).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-800">
                    <span className="font-bold">{act.student}</span> moved to <span className="text-blue-600 font-bold">{act.type}</span>
                  </p>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

/* SHARED UI COMPONENTS */

const KpiCard = ({ title, value, sub, icon, color }) => {
  const navigate = useNavigate();
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    yellow: 'bg-yellow-50 text-yellow-600'
  };
  
  return (
    <div 
      onClick={() => navigate('/college/students')}
      className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-all cursor-pointer border border-transparent hover:border-gray-200"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${colors[color]}`}>{icon}</div>
        <ArrowUpRight size={16} className="text-gray-300" />
      </div>
      <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest">{title}</h3>
      <div className="flex items-baseline gap-2 mt-1">
        <span className="text-3xl font-black text-gray-900">{value}</span>
        <span className="text-xs font-medium text-gray-400">{sub}</span>
      </div>
    </div>
  );
};

const SectionCard = ({ title, subtitle, children }) => (
  <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
    <div className="mb-6">
      <h3 className="text-lg font-black text-gray-800">{title}</h3>
      {subtitle && <p className="text-xs text-gray-400 font-medium">{subtitle}</p>}
    </div>
    {children}
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    unassigned: 'bg-gray-100 text-gray-500',
    active: 'bg-green-100 text-green-600',
    pending: 'bg-yellow-100 text-yellow-600'
  };
  return (
    <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-tight ${styles[status] || styles.active}`}>
      {status}
    </span>
  );
};

export default CollegeDashboard;