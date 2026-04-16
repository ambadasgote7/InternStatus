import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion"; // For the stunning vibe
import API from "../../api/api";
import { useSelector } from "react-redux";

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

      setStudent(profileRes.data?.data);
      setStats(statsRes.data?.data);
      setInternships(internshipsRes.data?.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load student data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center font-['Nunito']">
        <div className="w-10 h-10 border-4 border-[#F5F6FA] border-t-[#6C5CE7] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center font-['Nunito']">
        <p className="text-lg font-bold text-[#2D3436] opacity-40">Student not found</p>
      </div>
    );
  }

  const ongoing = internships.filter((i) => i.status === "ongoing");
  const completed = internships.filter((i) => i.status === "completed");

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#2D3436] font-['Nunito'] pb-16 transition-colors duration-300">
      <motion.main 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-8"
      >

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 px-5 py-2.5 bg-[#F5F6FA] hover:bg-[#6C5CE7] hover:text-white rounded-2xl text-xs font-black transition-all duration-300 shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
            Back
          </motion.button>
          <div className="flex flex-col items-end">
             <span className="text-[10px] uppercase tracking-[0.2em] font-black text-[#6C5CE7] opacity-80">
                Official Records
             </span>
             <span className="text-sm font-black text-[#2D3436]">Student Dossier</span>
          </div>
        </div>

        {/* PROFILE CARD */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-[#F5F6FA] rounded-[2.5rem] p-8 md:p-12 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-[0_20px_50px_rgba(108,92,231,0.05)] border border-white"
        >
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[#2D3436]">{student.fullName}</h1>
            <div className="flex items-center gap-3">
               <span className="px-3 py-1 bg-white text-[#6C5CE7] text-[10px] font-black rounded-full shadow-sm">PRN: {student.prn}</span>
               <span className="text-sm font-bold opacity-60">{student.courseName}</span>
            </div>
          </div>
          <div className="w-16 h-16 rounded-full bg-white border-4 border-[#6C5CE7]/20 flex items-center justify-center text-2xl shadow-inner">
             🎓
          </div>
        </motion.div>

        {/* STATS GRID */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <MiniStat label="Applied" value={stats.totalApplied} />
            <MiniStat label="Active" value={stats.applied} />
            <MiniStat label="Selected" value={stats.selected} highlight />
            <MiniStat label="Ongoing" value={stats.ongoing} />
            <MiniStat label="Finished" value={stats.completed} />
          </div>
        )}

        {/* SECTIONS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">

          {/* ONGOING PLACEMENTS */}
          <Section title="Live Placements" icon="⚡">
            <AnimatePresence>
                {ongoing.length === 0 ? (
                <Empty />
                ) : (
                ongoing.map((app, idx) => (
                    <motion.div key={app._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}>
                        <InternCard app={app} type="ongoing" />
                    </motion.div>
                ))
                )}
            </AnimatePresence>
          </Section>

          {/* COMPLETED HISTORY */}
          <Section title="Archived History" icon="📁">
            <AnimatePresence>
                {completed.length === 0 ? (
                <Empty />
                ) : (
                completed.map((app, idx) => (
                    <motion.div key={app._id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}>
                        <InternCard app={app} type="completed" />
                    </motion.div>
                ))
                )}
            </AnimatePresence>
          </Section>
        </div>
      </motion.main>
    </div>
  );
}

/* ================= REFINED COMPONENTS ================= */

function MiniStat({ label, value, highlight }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.03 }}
      className={`p-6 rounded-[2rem] transition-all duration-300 shadow-sm border ${
        highlight 
        ? "bg-[#6C5CE7] text-white border-[#6C5CE7] shadow-[#6C5CE7]/20 shadow-xl" 
        : "bg-white border-[#F5F6FA] text-[#2D3436]"
      }`}
    >
      <div className="text-3xl font-black tracking-tighter">{value ?? 0}</div>
      <div className={`text-[10px] font-black uppercase tracking-widest mt-1 ${highlight ? "opacity-80" : "opacity-40"}`}>
        {label}
      </div>
    </motion.div>
  );
}

function Section({ title, children, icon }) {
  return (
    <div className="bg-[#F5F6FA] p-6 sm:p-8 rounded-[2rem] border border-white/50">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-lg">{icon}</span>
        <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#2D3436] opacity-60">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Empty() {
  return (
    <div className="text-xs font-bold opacity-20 text-center py-12 bg-white/40 rounded-2xl border-2 border-dashed border-gray-200">
      No Records Found
    </div>
  );
}

function InternCard({ app, type }) {
  const navigate = useNavigate();
  const report = app.report || {};
   const { user } = useSelector((state) => state.user);

const handleCreditsNavigate = () => {
  const role = user?.role;

  const routeMap = {
    faculty: "/faculty/credits",
    college: "/college/credits",
  };

  navigate(routeMap[role] || "/");
};


  const openReport = () => { if (report?.reportUrl) window.open(report.reportUrl, "_blank"); };
  const openCertificate = () => { if (app?.certificateUrl) window.open(app.certificateUrl, "_blank"); };

  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className="bg-white border-2 border-transparent hover:border-[#6C5CE7]/10 rounded-[1.5rem] p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm transition-all duration-300"
    >
      <div>
        <p className="text-[10px] text-[#6C5CE7] font-black uppercase tracking-wider mb-0.5">
          {app.company?.name}
        </p>
        <h3 className="text-base font-black text-[#2D3436]">
          {app.internship?.title}
        </h3>
      </div>

      <div className="flex gap-2 flex-wrap w-full sm:w-auto">
        {type === "ongoing" && (
          <button
            onClick={() => navigate(`${user?.role === "college" ? "/college" : "/faculty"}/academic-internship-track/${app._id}`)}
            className="w-full sm:w-auto px-5 py-2 bg-[#6C5CE7] text-white text-[11px] font-black rounded-xl shadow-lg shadow-[#6C5CE7]/20 hover:bg-[#5a4bc4] transition-colors"
          >
            TRACK LIVE
          </button>
        )}

        {type === "completed" && (
          <div className="flex gap-2 w-full sm:w-auto">
            {report?.reportUrl && (
              <button onClick={openReport} className="flex-1 sm:flex-none px-4 py-2 border-2 border-[#F5F6FA] text-[#2D3436] text-[11px] font-black rounded-xl hover:border-[#6C5CE7] transition-all">
                REPORT
              </button>
            )}

            {report?._id && (
              report?.status !== "faculty_approved" ? (
                <button
                  onClick={handleCreditsNavigate}
                  className="flex-1 sm:flex-none px-4 py-2 bg-[#2D3436] text-white text-[11px] font-black rounded-xl hover:bg-black transition-colors"
                >
                  CREDITS
                </button>
              ) : (
                <div className="px-4 py-2 bg-emerald-50 text-emerald-600 text-[11px] font-black rounded-xl border border-emerald-100 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293l-4 4a1 1 0 01-1.414 0l-2-2a1 1 0 111.414-1.414L9 10.586l3.293-3.293a1 1 0 011.414 1.414z"></path></svg>
                  VALIDATED
                </div>
              )
            )}

            {app?.certificateUrl && (
              <button onClick={openCertificate} className="flex-1 sm:flex-none px-4 py-2 border-2 border-[#F5F6FA] text-[#2D3436] text-[11px] font-black rounded-xl hover:border-[#6C5CE7] transition-all">
                CERTIFICATE
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}