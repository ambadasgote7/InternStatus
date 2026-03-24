import React, { useEffect, useState } from "react";
import API from "../../api/api";
import { useParams, useNavigate } from "react-router-dom";

export default function InternDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [certificateFile, setCertificateFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fetchData = async () => {
    try {
      const res = await API.get(`/applications/${id}`);
      setData(res.data.data);
      const mentorRes = await API.get("/company/mentors");
      setMentors(mentorRes.data.data || []);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to load data");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssignMentor = async () => {
    if (!selectedMentor) return;
    if (!["offer_accepted", "ongoing"].includes(data.status)) {
      alert("Mentor can only be changed before or during internship.");
      return;
    }
    try {
      setLoading(true);
      await API.patch(`/company/${id}/assign-mentor`, {
        mentorId: selectedMentor._id,
      });
      alert("Mentor updated successfully");
      setShowModal(false);
      setSelectedMentor(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to assign mentor");
    } finally {
      setLoading(false);
    }
  };

  const handleCertificateUpload = async () => {
    if (!certificateFile) {
      alert("Please select a certificate file");
      return;
    }
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("certificate", certificateFile);
      await API.post(`/company/applications/${id}/certificate`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Certificate issued successfully");
      setCertificateFile(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center">
        <p className="text-[14px] font-bold text-[#333] animate-pulse">
          Loading Intern Profile...
        </p>
      </div>
    );
  }

  const s = data.studentSnapshot || {};
  const report = data.report || {};
  const isCompleted = data.status === "completed";
  const hasCertificate = !!data.certificateUrl;
  const canUploadCertificate = isCompleted && !hasCertificate;

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#333] font-sans pb-10">
      <main className="max-w-4xl mx-auto w-full px-4 md:px-6 py-6 flex flex-col gap-6">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#e5e5e5] pb-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-[23px] font-black text-[#333] m-0 tracking-tight leading-tight">
              Intern Details
            </h1>
            <p className="text-[13px] font-bold text-[#333] opacity-60 m-0 mt-1 uppercase tracking-widest">
              Individual Performance Record
            </p>
          </div>
          <span
            className={`px-3 py-1.5 rounded-[12px] text-[10px] font-black uppercase tracking-widest border ${
              data.status === "completed"
                ? "bg-[#f9f9f9] border-[#333] text-[#333]"
                : "bg-[#111] text-[#fff] border-[#111]"
            }`}
          >
            {data.status.replace("_", " ")}
          </span>
        </header>

        <div className="bg-[#fff] border border-[#e5e5e5] rounded-[20px] p-6 shadow-sm">
          <h3 className="text-[11px] font-bold text-[#333] opacity-50 m-0 uppercase tracking-widest border-b border-[#f9f9f9] pb-3 mb-5">
            Student Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-[#333] opacity-40 uppercase tracking-widest">
                Full Name
              </span>
              <span className="text-[15px] font-black">{s.fullName}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-[#333] opacity-40 uppercase tracking-widest">
                Email Address
              </span>
              <span className="text-[14px] font-bold truncate">{s.email}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-[#333] opacity-40 uppercase tracking-widest">
                Phone Number
              </span>
              <span className="text-[14px] font-bold">{s.phoneNo || "—"}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#fff] border border-[#e5e5e5] rounded-[20px] p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-[11px] font-bold text-[#333] opacity-50 m-0 uppercase tracking-widest border-b border-[#f9f9f9] pb-3 mb-4">
                Internship Tracking
              </h3>
              <p className="text-[13px] font-medium opacity-70 mb-5 leading-snug">
                Review assigned tasks, weekly progress logs, and performance
                metrics for this student.
              </p>
            </div>
            {["ongoing", "completed"].includes(data.status) && (
              <button
                onClick={() => navigate(`/company/interns/${id}/progress`)}
                className="w-full py-2.5 bg-[#111] text-[#fff] text-[11px] font-bold rounded-[14px] hover:opacity-80 transition-opacity uppercase tracking-widest"
              >
                View Progress Log
              </button>
            )}
          </div>

          <div className="bg-[#fff] border border-[#e5e5e5] rounded-[20px] p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-[11px] font-bold text-[#333] opacity-50 m-0 uppercase tracking-widest border-b border-[#f9f9f9] pb-3 mb-4">
                Mentor Management
              </h3>
              <div className="mb-5">
                <span className="text-[10px] font-bold text-[#333] opacity-40 uppercase tracking-widest">
                  Current Mentor
                </span>
                <div className="text-[15px] font-black mt-1">
                  {data.mentor?.fullName || "Awaiting Assignment"}
                </div>
                {data.mentor && (
                  <div className="text-[12px] font-bold opacity-60 mt-0.5">
                    {data.mentor.designation} • {data.mentor.department}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="w-full py-2.5 bg-[#f9f9f9] border border-[#333] text-[#333] text-[11px] font-bold rounded-[14px] hover:bg-[#333] hover:text-[#fff] transition-all uppercase tracking-widest cursor-pointer"
            >
              Change Mentor
            </button>
          </div>
        </div>

        {isCompleted && (
          <div className="bg-[#fff] border border-[#e5e5e5] rounded-[20px] p-6 shadow-sm">
            <h3 className="text-[11px] font-bold text-[#333] opacity-50 m-0 uppercase tracking-widest border-b border-[#f9f9f9] pb-3 mb-5">
              Documentation & Certification
            </h3>

            <div className="flex flex-col gap-6">
              {report?.reportUrl && (
                <div className="flex items-center justify-between py-2 border-b border-[#f9f9f9]">
                  <span className="text-[13px] font-bold">
                    Student Internship Report
                  </span>
                  <button
                    onClick={() => window.open(report.reportUrl, "_blank")}
                    className="px-4 py-2 bg-[#f9f9f9] border border-[#e5e5e5] text-[#333] text-[11px] font-bold rounded-[10px] hover:border-[#333] transition-colors uppercase tracking-widest"
                  >
                    View PDF
                  </button>
                </div>
              )}

              <div className="flex flex-col gap-4">
                <span className="text-[11px] font-bold text-[#333] opacity-40 uppercase tracking-widest">
                  Internship Certificate
                </span>

                {canUploadCertificate && (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.png"
                      onChange={(e) => setCertificateFile(e.target.files[0])}
                      className="flex-1 text-[12px] font-bold bg-[#f9f9f9] p-2 rounded-[10px] border border-dashed border-[#e5e5e5]"
                    />
                    <button
                      onClick={handleCertificateUpload}
                      disabled={uploading}
                      className="px-6 py-2 bg-[#111] text-[#fff] text-[11px] font-bold rounded-[14px] hover:opacity-80 transition-opacity uppercase tracking-widest disabled:opacity-30"
                    >
                      {uploading ? "Uploading..." : "Issue Certificate"}
                    </button>
                  </div>
                )}

                {hasCertificate && (
                  <div className="flex items-center justify-between p-4 bg-[#f9f9f9] rounded-[14px] border border-[#e5e5e5]">
                    <span className="text-[12px] font-bold text-[#008000] uppercase tracking-widest">
                      Certificate Issued
                    </span>
                    <button
                      onClick={() => window.open(data.certificateUrl, "_blank")}
                      className="px-4 py-2 bg-[#fff] border border-[#333] text-[#333] text-[11px] font-bold rounded-[10px] hover:bg-[#333] hover:text-[#fff] transition-all uppercase tracking-widest"
                    >
                      View Certificate
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-[#333]/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-[#fff] rounded-[20px] shadow-sm border border-[#e5e5e5] w-full max-w-lg flex flex-col max-h-[85vh]">
            <header className="px-6 py-4 border-b border-[#f9f9f9] flex justify-between items-center">
              <h3 className="text-[18px] font-black text-[#333] m-0 tracking-tight">
                Select Mentor
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedMentor(null);
                }}
                className="text-[11px] font-bold text-[#333] opacity-50 uppercase tracking-widest border-none bg-transparent cursor-pointer"
              >
                Close
              </button>
            </header>

            <div className="p-4 overflow-y-auto no-scrollbar flex flex-col gap-3">
              {mentors.map((m) => (
                <div
                  key={m._id}
                  onClick={() => setSelectedMentor(m)}
                  className={`p-4 border rounded-[14px] cursor-pointer transition-all ${
                    selectedMentor?._id === m._id
                      ? "bg-[#f9f9f9] border-[#333]"
                      : "bg-[#fff] border-[#e5e5e5] hover:border-[#333]"
                  }`}
                >
                  <div className="text-[14px] font-black text-[#333]">
                    {m.fullName}
                  </div>
                  <div className="text-[12px] font-bold opacity-60 uppercase tracking-tighter mt-0.5">
                    {m.designation || "Faculty"} • {m.department}
                  </div>
                </div>
              ))}
            </div>

            <footer className="p-4 border-t border-[#f9f9f9] flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedMentor(null);
                }}
                className="px-5 py-2 text-[12px] font-bold text-[#333] bg-[#f9f9f9] border border-[#e5e5e5] rounded-[12px] hover:bg-[#e5e5e5] transition-colors uppercase tracking-widest cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignMentor}
                disabled={!selectedMentor || loading}
                className="px-6 py-2 bg-[#111] text-[#fff] text-[12px] font-bold rounded-[12px] hover:opacity-80 transition-opacity uppercase tracking-widest disabled:opacity-30 cursor-pointer"
              >
                Assign
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
