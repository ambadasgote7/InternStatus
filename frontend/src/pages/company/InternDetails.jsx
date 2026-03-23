import React, { useEffect, useState } from "react";
import API from "../../api/api";
import { useParams, useNavigate } from "react-router-dom";

export default function InternDetails() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔥 modal
  const [showModal, setShowModal] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);

  // 🔥 certificate
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

  // ================= MENTOR =================
  const handleAssignMentor = async () => {

    if (!selectedMentor) return;

    if (!["offer_accepted", "ongoing"].includes(data.status)) {
      alert("Mentor can only be changed before or during internship.");
      return;
    }

    try {
      setLoading(true);

      await API.patch(`/company/${id}/assign-mentor`, {
        mentorId: selectedMentor._id
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

  // ================= CERTIFICATE =================
  const handleCertificateUpload = async () => {

    if (!certificateFile) {
      alert("Please select a certificate file");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("certificate", certificateFile);

      await API.post(
        `/company/applications/${id}/certificate`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" }
        }
      );

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
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  const s = data.studentSnapshot || {};
  const report = data.report || {};

  const isCompleted = data.status === "completed";
  const hasCertificate = !!data.certificateUrl;
  const canUploadCertificate = isCompleted && !hasCertificate;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0F19] p-6 text-white">

      <div className="w-full max-w-3xl bg-white/5 p-8 rounded-2xl border border-white/10">

        <h2 className="text-2xl font-bold mb-6">Intern Details</h2>

        {/* STUDENT */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>{s.fullName}</div>
          <div>{s.email}</div>
          <div>{s.phoneNo}</div>
          <div className="capitalize">{data.status}</div>
        </div>

        {/* PROGRESS */}
        {["ongoing", "completed"].includes(data.status) && (
          <button
            onClick={() => navigate(`/company/interns/${id}/progress`)}
            className="mb-6 px-4 py-2 bg-blue-600 rounded"
          >
            View Progress
          </button>
        )}

        {/* ================= REPORT ================= */}
        {isCompleted && report?.reportUrl && (
          <div className="mb-4">
            <button
              onClick={() => window.open(report.reportUrl, "_blank")}
              className="px-4 py-2 bg-gray-700 rounded"
            >
              View Report
            </button>
          </div>
        )}

        {/* ================= CERTIFICATE ================= */}
        {isCompleted && (
          <div className="mb-6 flex flex-col gap-3">

            {/* ISSUE */}
            {canUploadCertificate && (
              <>
                <input
                  type="file"
                  accept=".pdf,.jpg,.png"
                  onChange={(e) => setCertificateFile(e.target.files[0])}
                />

                <button
                  onClick={handleCertificateUpload}
                  disabled={uploading}
                  className="px-4 py-2 bg-purple-600 rounded"
                >
                  {uploading ? "Uploading..." : "Issue Certificate"}
                </button>
              </>
            )}

            {/* VIEW */}
            {hasCertificate && (
              <button
                onClick={() => window.open(data.certificateUrl, "_blank")}
                className="px-4 py-2 bg-green-600 rounded"
              >
                View Certificate
              </button>
            )}

          </div>
        )}

        {/* ================= MENTOR ================= */}
        <div className="mt-6">

          <div className="mb-3">
            <span className="text-gray-400 text-sm">Current Mentor:</span>
            <div className="font-medium text-lg">
              {data.mentor?.fullName || "Not Assigned"}
            </div>

            {data.mentor && (
              <div className="text-sm text-gray-400">
                {data.mentor.designation || "No designation"} • {data.mentor.department || "No department"}
              </div>
            )}
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-yellow-600 rounded"
          >
            Change Mentor
          </button>

        </div>

      </div>

      {/* ================= MODAL ================= */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">

          <div className="bg-white text-black p-6 rounded-xl w-full max-w-lg">

            <h3 className="text-lg font-semibold mb-4">
              Select New Mentor
            </h3>

            <div className="space-y-3 max-h-64 overflow-y-auto">

              {mentors.map((m) => (
                <div
                  key={m._id}
                  onClick={() => setSelectedMentor(m)}
                  className={`p-4 border rounded cursor-pointer ${
                    selectedMentor?._id === m._id
                      ? "bg-blue-100 border-blue-500"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <div className="font-semibold">{m.fullName}</div>

                  <div className="text-sm text-gray-600">
                    {m.designation || "No designation"} • {m.department || "No department"}
                  </div>

                  <div className="text-xs text-gray-500">
                    {m.bio || "No bio available"}
                  </div>
                </div>
              ))}

            </div>

            <div className="mt-6 flex justify-end gap-3">

              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedMentor(null);
                }}
                className="px-4 py-2 bg-gray-400 rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleAssignMentor}
                disabled={!selectedMentor || loading}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Confirm Change
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}