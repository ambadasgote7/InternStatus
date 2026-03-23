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
        API.get(`/students/${studentId}/internships`)
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
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!student) {
    return <div className="p-8">Student not found</div>;
  }

  const ongoing = internships.filter(i => i.status === "ongoing");
  const completed = internships.filter(i => i.status === "completed");

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">

      {/* ================= PROFILE ================= */}
      <div className="bg-amber-200 shadow rounded-xl p-6 mb-8">

        <h1 className="text-2xl font-bold mb-4">{student.fullName}</h1>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <Info label="Email" value={student.user?.email} />
          <Info label="PRN" value={student.prn} />
          <Info label="ABC ID" value={student.abcId} />
          <Info label="Course" value={student.courseName} />
          <Info label="Specialization" value={student.specialization} />
          <Info label="Year" value={student.Year} />
        </div>

      </div>

      {/* ================= STATS ================= */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Applications" value={stats.totalApplied} />
        <StatCard label="Active Applications" value={stats.applied} />
<StatCard label="Selected Opportunities" value={stats.selected} />
<StatCard label="Ongoing Internships" value={stats.ongoing} />
<StatCard label="Completed Internships" value={stats.completed} />
        </div>
      )}

      {/* ================= ONGOING ================= */}
      <Section title="Ongoing Internship">

        {ongoing.length === 0 ? (
          <p>No ongoing internship</p>
        ) : (
          ongoing.map(app => (
            <InternshipCard key={app._id} app={app} type="ongoing" />
          ))
        )}

      </Section>

      {/* ================= COMPLETED ================= */}
      <Section title="Completed Internships">

        {completed.length === 0 ? (
          <p>No completed internships</p>
        ) : (
          completed.map(app => (
            <InternshipCard key={app._id} app={app} type="completed" />
          ))
        )}

      </Section>

    </div>
  );
}

/* ================= SUB COMPONENTS ================= */

function Info({ label, value }) {
  return (
    <div>
      <span className="text-gray-500">{label}</span>
      <div>{value || "-"}</div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-amber-300 shadow rounded-xl p-4 text-center">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-gray-500 uppercase">{label}</div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-amber-200 shadow rounded-xl p-6 mb-8">
      <h2 className="text-lg font-bold mb-4">{title}</h2>
      {children}
    </div>
  );
}

/* ================= INTERNSHIP CARD ================= */
function InternshipCard({ app, type }) {

  const navigate = useNavigate();

  const report = app.report || {};

  const handleViewReport = () => {
    if (!report?.reportUrl) return;
    window.open(report.reportUrl, "_blank");
  };

  const handleApprove = async () => {
    try {
      await API.post(`/reports/approve/${app._id}`);
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.error || "Failed");
    }
  };

const handleViewCertificate = () => {
  if (!app?.certificateUrl) return;
  window.open(app.certificateUrl, "_blank");
};

  return (
    <div className="border rounded-lg p-4 space-y-3 bg-amber-200">

      {/* INFO */}
      <div>
        <div className="font-semibold">
          {app.internship?.title}
        </div>

        <div className="text-sm text-gray-500">
          {app.company?.name}
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex gap-2 flex-wrap">

        {/* 🟢 ONGOING */}
        {type === "ongoing" && (
          <button
            onClick={() =>  navigate(`/academic-internship-track/${app._id}`)}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
          >
            View Task
          </button>
        )}

       {type === "completed" && (
  <>

    {/* 🔵 VIEW REPORT */}
    {report?.reportUrl && (
      <button
        onClick={handleViewReport}
        className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
      >
        View Report
      </button>
    )}

    {/* 🟠 ASSIGN CREDITS */}
    {report?.status !== "faculty_approved" && (
      <button
        onClick={() => navigate(`/credits?reportId=${report._id}`)}
        className="px-3 py-1 bg-orange-600 text-white rounded text-sm"
      >
        Assign Credits
      </button>
    )}

    {/* 🟡 APPROVED */}
    {report?.status === "faculty_approved" && (
      <span className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm">
        Approved
      </span>
    )}

    {/* 🟣 CERTIFICATE */}
    {app?.certificateUrl && (
      <button
        onClick={handleViewCertificate}
        className="px-3 py-1 bg-purple-600 text-white rounded text-sm"
      >
        View Certificate
      </button>
    )}

  </>
)}
      </div>

    </div>
  );
}