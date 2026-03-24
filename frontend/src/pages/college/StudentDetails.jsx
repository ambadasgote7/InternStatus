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
      alert("Failed to load student data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center">
        <p className="text-[14px] font-bold text-[#333] animate-pulse">
          Loading Student Profile...
        </p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] p-4">
        <div className="max-w-6xl mx-auto bg-[#fff] border-2 border-dashed border-[#e5e5e5] rounded-[20px] p-10 text-center">
          <p className="text-[13px] font-bold text-[#333] opacity-60">
            Student record not found.
          </p>
        </div>
      </div>
    );
  }

  const ongoing = internships.filter((i) => i.status === "ongoing");
  const completed = internships.filter((i) => i.status === "completed");

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#333] font-sans pb-10">
      <main className="max-w-6xl mx-auto w-full px-4 md:px-6 py-6 flex flex-col gap-6">
        <div className="bg-[#fff] border border-[#e5e5e5] rounded-[20px] p-5 shadow-sm">
          <h1 className="text-[23px] font-black text-[#333] m-0 mb-4 tracking-tight">
            {student.fullName}
          </h1>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 pt-4 border-t border-[#f9f9f9]">
            <Info label="Email" value={student.user?.email} />
            <Info label="PRN" value={student.prn} />
            <Info label="ABC ID" value={student.abcId} />
            <Info label="Course" value={student.courseName} />
            <Info label="Specialization" value={student.specialization} />
            <Info label="Year" value={student.Year} />
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <StatCard label="Total Applied" value={stats.totalApplied} />
            <StatCard label="Active Apps" value={stats.applied} />
            <StatCard label="Selected" value={stats.selected} />
            <StatCard label="Ongoing" value={stats.ongoing} />
            <StatCard label="Completed" value={stats.completed} />
          </div>
        )}

        <Section title="Ongoing Internship">
          {ongoing.length === 0 ? (
            <p className="text-[13px] font-bold text-[#333] opacity-40 m-0 py-2">
              No active internship tracking found.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {ongoing.map((app) => (
                <InternshipCard key={app._id} app={app} type="ongoing" />
              ))}
            </div>
          )}
        </Section>

        <Section title="Completed Internships">
          {completed.length === 0 ? (
            <p className="text-[13px] font-bold text-[#333] opacity-40 m-0 py-2">
              No completed records available.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {completed.map((app) => (
                <InternshipCard key={app._id} app={app} type="completed" />
              ))}
            </div>
          )}
        </Section>
      </main>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] font-bold text-[#333] opacity-40 uppercase tracking-widest">
        {label}
      </span>
      <div className="text-[13px] font-bold text-[#333] truncate">
        {value || "—"}
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-[#fff] border border-[#e5e5e5] rounded-[16px] p-4 shadow-sm text-center">
      <div className="text-[20px] font-black text-[#111] leading-tight">
        {value}
      </div>
      <div className="text-[9px] font-bold text-[#333] opacity-50 uppercase tracking-widest mt-1">
        {label}
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-[#fff] border border-[#e5e5e5] rounded-[20px] p-5 shadow-sm">
      <h2 className="text-[11px] font-bold text-[#333] opacity-50 uppercase tracking-widest border-b border-[#f9f9f9] pb-3 mb-4">
        {title}
      </h2>
      {children}
    </div>
  );
}

function InternshipCard({ app, type }) {
  const navigate = useNavigate();
  const report = app.report || {};

  const handleViewReport = () => {
    if (!report?.reportUrl) return;
    window.open(report.reportUrl, "_blank");
  };

  const handleViewCertificate = () => {
    if (!app?.certificateUrl) return;
    window.open(app.certificateUrl, "_blank");
  };

  return (
    <div className="bg-[#f9f9f9] border border-[#e5e5e5] rounded-[14px] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#333] transition-colors">
      <div>
        <div className="text-[15px] font-black text-[#333] leading-tight">
          {app.internship?.title}
        </div>
        <div className="text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest mt-0.5">
          {app.company?.name}
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {type === "ongoing" && (
          <button
            onClick={() => navigate(`/academic-internship-track/${app._id}`)}
            className="px-4 py-2 bg-[#111] text-[#fff] text-[11px] font-bold rounded-[10px] uppercase tracking-widest cursor-pointer border-none"
          >
            Track Task
          </button>
        )}

        {type === "completed" && (
          <>
            {report?.reportUrl && (
              <button
                onClick={handleViewReport}
                className="px-4 py-2 bg-[#f9f9f9] border border-[#333] text-[#333] text-[11px] font-bold rounded-[10px] uppercase tracking-widest cursor-pointer"
              >
                View Report
              </button>
            )}

            {report?.status !== "faculty_approved" ? (
              <button
                onClick={() => navigate(`/credits?reportId=${report._id}`)}
                className="px-4 py-2 bg-[#111] text-[#fff] text-[11px] font-bold rounded-[10px] uppercase tracking-widest cursor-pointer border-none"
              >
                Assign Credits
              </button>
            ) : (
              <span className="px-3 py-2 bg-[#f9f9f9] text-[#008000] text-[10px] font-black uppercase tracking-widest rounded-[10px]">
                Validated
              </span>
            )}

            {app?.certificateUrl && (
              <button
                onClick={handleViewCertificate}
                className="px-4 py-2 bg-[#fff] border border-[#e5e5e5] text-[#333] text-[11px] font-bold rounded-[10px] uppercase tracking-widest cursor-pointer"
              >
                Certificate
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
