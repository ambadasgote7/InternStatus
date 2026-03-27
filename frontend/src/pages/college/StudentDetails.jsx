import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api/api";

export default function StudentDetails() {
  const { studentId } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [stats, setStats] = useState(null);
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (studentId) fetchData();
  }, [studentId]);

  const fetchData = async () => {
    try {
      const [profileRes, statsRes, internshipsRes] = await Promise.all([
        API.get(`/students/${studentId}`),
        API.get(`/students/${studentId}/stats`),
        API.get(`/students/${studentId}/internships`),
      ]);
      setStudent(profileRes.data.data);
      setStats(statsRes.data.data);
      setInternships(internshipsRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center font-['Nunito']">
        <div className="w-8 h-8 border-4 border-[#F5F6FA] border-t-[#6C5CE7] rounded-full animate-spin"></div>
      </div>
    );
  }

  const ongoing = internships.filter((i) => i.status === "ongoing");
  const completed = internships.filter((i) => i.status === "completed");

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#2D3436] font-['Nunito'] pb-10 selection:bg-[#6C5CE7]/10">
      <main className="max-w-6xl mx-auto px-6 py-8 flex flex-col gap-6">
        
        {/* COMPACT HEADER */}
        <div className="flex items-center justify-between animate-in fade-in duration-500">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 px-4 py-2 bg-[#F5F6FA] hover:bg-[#6C5CE7] group rounded-xl transition-all cursor-pointer border-none"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-[#6C5CE7] group-hover:text-white transition-colors">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            <span className="text-[9px] font-black uppercase tracking-widest group-hover:text-white">Directory</span>
          </button>
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#6C5CE7]">Student Dossier</div>
        </div>

        {/* PROFILE CARD - More Compact */}
        <div className="bg-[#F5F6FA] border border-[#F5F6FA] rounded-[32px] p-8 relative overflow-hidden animate-in slide-in-from-top-4 duration-700 shadow-sm">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <h1 className="text-3xl font-black tracking-tighter text-[#2D3436]">{student?.fullName}</h1>
              <p className="text-[10px] font-bold text-[#6C5CE7] uppercase tracking-[0.2em]">{student?.prn} • {student?.courseName}</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-4 border-t md:border-t-0 md:border-l border-[#2D3436]/5 pt-6 md:pt-0 md:pl-8">
              <QuickInfo label="Specialization" value={student?.specialization} />
              <QuickInfo label="Current Year" value={student?.Year} />
              <QuickInfo label="ABC ID" value={student?.abcId} />
            </div>
          </div>
        </div>

        {/* STATS STRIP - Compact Circles/Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 animate-in zoom-in-95 duration-700">
            <MiniStat label="Applied" value={stats.totalApplied} />
            <MiniStat label="Active" value={stats.applied} />
            <MiniStat label="Selected" value={stats.selected} highlight />
            <MiniStat label="Ongoing" value={stats.ongoing} />
            <MiniStat label="Finished" value={stats.completed} />
          </div>
        )}

        {/* COMPACT SECTION SPLIT */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CompactSection title="Live Placements" accent>
            {ongoing.length === 0 ? <TinyEmpty /> : (
              <div className="space-y-3">
                {ongoing.map((app) => <CompactInternCard key={app._id} app={app} type="ongoing" />)}
              </div>
            )}
          </CompactSection>

          <CompactSection title="Archived History">
            {completed.length === 0 ? <TinyEmpty /> : (
              <div className="space-y-3">
                {completed.map((app) => <CompactInternCard key={app._id} app={app} type="completed" />)}
              </div>
            )}
          </CompactSection>
        </div>
      </main>
    </div>
  );
}

/* --- HELPER COMPONENTS (STRICT COLORS & COMPACT SIZES) --- */

function QuickInfo({ label, value }) {
  return (
    <div className="flex flex-col">
      <span className="text-[8px] font-black uppercase tracking-widest text-[#2D3436]/40">{label}</span>
      <span className="text-[12px] font-bold text-[#2D3436]">{value || "—"}</span>
    </div>
  );
}

function MiniStat({ label, value, highlight }) {
  return (
    <div className={`p-4 rounded-2xl border transition-all ${highlight ? 'bg-[#6C5CE7] border-[#6C5CE7] text-white shadow-lg shadow-[#6C5CE7]/20' : 'bg-white border-[#F5F6FA] text-[#2D3436]'}`}>
      <div className="text-xl font-black leading-none mb-1">{value}</div>
      <div className={`text-[8px] font-black uppercase tracking-widest ${highlight ? 'text-white/60' : 'text-[#2D3436]/30'}`}>{label}</div>
    </div>
  );
}

function CompactSection({ title, children, accent }) {
  return (
    <div className="bg-[#F5F6FA]/50 border border-[#F5F6FA] rounded-[28px] p-5">
      <h2 className="text-[9px] font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-2 text-[#2D3436]/60">
        <span className={`w-1.5 h-1.5 rounded-full ${accent ? 'bg-[#6C5CE7]' : 'bg-[#2D3436]/20'}`}></span>
        {title}
      </h2>
      {children}
    </div>
  );
}

function CompactInternCard({ app, type }) {
  const navigate = useNavigate();
  return (
    <div className="bg-white border border-[#F5F6FA] rounded-2xl p-4 hover:shadow-md transition-all group">
      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="text-[8px] font-black text-[#6C5CE7] uppercase tracking-widest">{app.company?.name}</p>
          <h3 className="text-sm font-bold text-[#2D3436] leading-tight">{app.internship?.title}</h3>
        </div>
        <div className="text-lg opacity-20 group-hover:opacity-100 transition-opacity">
          {type === "ongoing" ? "🚀" : "🏅"}
        </div>
      </div>
      
      <div className="flex gap-2">
        {type === "ongoing" ? (
          <button 
            onClick={() => navigate(`/academic-internship-track/${app._id}`)}
            className="w-full py-2 bg-[#6C5CE7] text-white text-[9px] font-black rounded-lg uppercase tracking-widest cursor-pointer border-none"
          >
            Track Progress
          </button>
        ) : (
          <div className="flex gap-2 w-full">
            <button className="flex-1 py-2 bg-[#F5F6FA] text-[#2D3436] text-[8px] font-black rounded-lg uppercase border-none cursor-pointer">Report</button>
            <button className="flex-1 py-2 bg-[#2D3436] text-white text-[8px] font-black rounded-lg uppercase border-none cursor-pointer">Credits</button>
          </div>
        )}
      </div>
    </div>
  );
}

function TinyEmpty() {
  return <div className="py-8 text-center text-[9px] font-bold text-[#2D3436]/20 uppercase tracking-widest italic">No Records</div>;
}