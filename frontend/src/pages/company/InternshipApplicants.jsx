import React, { useEffect, useState } from "react";
import API from "../../api/api";
import { useParams } from "react-router-dom";

export default function InternshipApplicants() {
  const { id } = useParams();
  const [data, setData] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  // New state for search
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    try {
      const res = await API.get(`/applications/internship/${id}`);
      setData(res.data.data || []);
    } catch {
      alert("Failed to load applicants");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateStatus = async (appId, status) => {
    const confirmAction = window.confirm(
      `Are you sure you want to mark as ${status}?`,
    );

    if (!confirmAction) return;

    setLoadingId(appId);

    try {
      await API.patch(`/applications/${appId}/status`, { status });
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    } finally {
      setLoadingId(null);
    }
  };

  const renderActions = (app) => {
    const btnBase =
      "px-6 py-2.5 text-[11px] font-black uppercase tracking-[0.15em] rounded-[10px] transition-all duration-300 outline-none disabled:opacity-50 disabled:cursor-not-allowed border cursor-pointer";

    switch (app.status) {
      case "applied":
        return (
          <div className="flex gap-3 mt-6 pt-6 border-t border-[#e5e5e5]">
            <button
              onClick={() => updateStatus(app._id, "shortlisted")}
              disabled={loadingId === app._id}
              className={`${btnBase} bg-[#111] text-[#fff] border-[#111] hover:bg-[#333] hover:border-[#333] hover:-translate-y-0.5`}
            >
              {loadingId === app._id ? "Processing..." : "Shortlist"}
            </button>
            <button
              onClick={() => updateStatus(app._id, "rejected")}
              disabled={loadingId === app._id}
              className={`${btnBase} bg-[#fff] text-[#111] border-[#e5e5e5] hover:bg-[#f9f9f9] hover:border-[#ccc]`}
            >
              Reject
            </button>
          </div>
        );

      case "shortlisted":
        return (
          <div className="flex gap-3 mt-6 pt-6 border-t border-[#e5e5e5]">
            <button
              onClick={() => updateStatus(app._id, "selected")}
              disabled={loadingId === app._id}
              className={`${btnBase} bg-[#111] text-[#fff] border-[#111] hover:bg-[#333] hover:border-[#333] hover:-translate-y-0.5`}
            >
              {loadingId === app._id ? "Processing..." : "Select"}
            </button>
            <button
              onClick={() => updateStatus(app._id, "rejected")}
              disabled={loadingId === app._id}
              className={`${btnBase} bg-[#fff] text-[#111] border-[#e5e5e5] hover:bg-[#f9f9f9] hover:border-[#ccc]`}
            >
              Reject
            </button>
          </div>
        );

      case "selected":
        return (
          <div className="mt-6 pt-6 border-t border-[#e5e5e5]">
            <span className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#b45309] bg-[#fffbeb] border border-[#fde68a] rounded-[8px]">
              Waiting for student acceptance
            </span>
          </div>
        );

      case "offer_accepted":
        return (
          <div className="mt-6 pt-6 border-t border-[#e5e5e5]">
            <span className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#166534] bg-[#f0fdf4] border border-[#bbf7d0] rounded-[8px]">
              Offer Accepted
            </span>
          </div>
        );

      case "rejected":
        return (
          <div className="mt-6 pt-6 border-t border-[#e5e5e5]">
            <span className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#991b1b] bg-[#fef2f2] border border-[#fecaca] rounded-[8px]">
              Rejected
            </span>
          </div>
        );

      case "withdrawn":
        return (
          <div className="mt-6 pt-6 border-t border-[#e5e5e5]">
            <span className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#555] bg-[#f9f9f9] border border-[#e5e5e5] rounded-[8px]">
              Withdrawn
            </span>
          </div>
        );

      case "ongoing":
        return (
          <div className="mt-6 pt-6 border-t border-[#e5e5e5]">
            <span className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#1d4ed8] bg-[#eff6ff] border border-[#bfdbfe] rounded-[8px]">
              Internship Ongoing
            </span>
          </div>
        );

      default:
        return (
          <div className="mt-6 pt-6 border-t border-[#e5e5e5]">
            <span className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#555] bg-[#f9f9f9] border border-[#e5e5e5] rounded-[8px]">
              {app.status}
            </span>
          </div>
        );
    }
  };

  // Filter data based on search term
  const filteredData = data.filter((app) => {
    const fullName = app.studentSnapshot?.fullName || "";
    return fullName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-[#f9f9f9] p-4 md:p-8 font-sans box-border text-[#111]">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8 text-center md:text-left flex flex-col md:flex-row justify-between md:items-end gap-6">
          <div>
            <div className="text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-[0.2em] mb-2">
              Management Console
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-[#111] m-0 tracking-tighter uppercase">
              Applicants Pool
            </h2>
          </div>

          {/* Search Input Area */}
          <div className="w-full md:w-auto md:min-w-[300px]">
            <input
              type="text"
              placeholder="Search by applicant name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-5 py-3.5 text-[13px] font-medium text-[#111] bg-[#fff] border border-[#e5e5e5] rounded-[14px] outline-none transition-all duration-300 focus:border-[#111] focus:ring-1 focus:ring-[#111] placeholder:text-[#999] shadow-sm"
            />
          </div>
        </header>

        {/* Empty States */}
        {data.length === 0 ? (
          <div className="bg-[#fff] p-16 rounded-[24px] border border-dashed border-[#e5e5e5] text-center shadow-sm">
            <p className="text-[#999] m-0 text-[12px] font-bold uppercase tracking-widest">
              No applications received yet.
            </p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="bg-[#fff] p-16 rounded-[24px] border border-dashed border-[#e5e5e5] text-center shadow-sm">
            <p className="text-[#999] m-0 text-[12px] font-bold uppercase tracking-widest">
              No applicants found matching "{searchTerm}".
            </p>
          </div>
        ) : null}

        {/* Render Filtered Data */}
        <div className="grid grid-cols-1 gap-6">
          {filteredData.map((app) => {
            const s = app.studentSnapshot || {};

            return (
              <div
                key={app._id}
                className="group bg-[#fff] p-6 md:p-10 rounded-[24px] border border-[#e5e5e5] box-border transition-all duration-300 hover:border-[#111] shadow-sm"
              >
                <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-8 gap-4">
                  <div>
                    <h3 className="text-[24px] font-black text-[#111] m-0 tracking-tight uppercase">
                      {s.fullName}
                    </h3>
                    <p className="text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-[0.2em] mt-1">
                      Candidate Profile
                    </p>
                  </div>
                  <div
                    className={`px-3 py-1.5 text-[9px] font-black tracking-[0.2em] rounded-[8px] uppercase border ${
                      app.status === "rejected"
                        ? "border-[#fecaca] text-[#991b1b] bg-[#fef2f2]"
                        : app.status === "shortlisted" ||
                            app.status === "selected" ||
                            app.status === "offer_accepted"
                          ? "border-[#bbf7d0] text-[#166534] bg-[#f0fdf4]"
                          : "border-[#e5e5e5] text-[#555] bg-[#f9f9f9]"
                    }`}
                  >
                    {app.status}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                  <div className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-[0.15em]">
                        Academic Institution
                      </span>
                      <span className="text-[13px] font-bold text-[#111] leading-tight">
                        {s.collegeName}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-[0.15em]">
                        Specialization
                      </span>
                      <span className="text-[13px] font-medium text-[#555]">
                        <span className="font-bold text-[#111]">
                          {s.courseName}
                        </span>
                        <span className="mx-1.5 opacity-40">/</span>
                        {s.specialization}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-[0.15em]">
                        Contact Channel
                      </span>
                      <span className="text-[13px] font-medium text-[#111] flex flex-wrap gap-x-4">
                        <span className="break-all font-bold">{s.email}</span>
                        <span className="text-[#555]">{s.phoneNo}</span>
                      </span>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-[0.15em]">
                        Technical Arsenal
                      </span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {app.skillsSnapshot?.length ? (
                          app.skillsSnapshot.map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 text-[10px] font-bold bg-[#f9f9f9] border border-[#e5e5e5] rounded-[6px] text-[#111]"
                            >
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-[#999] text-[11px] italic font-medium">
                            No skills listed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  {app.resumeSnapshot && (
                    <a
                      href={app.resumeSnapshot}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-[11px] font-black text-[#111] uppercase tracking-[0.15em] hover:underline transition-all group/link"
                    >
                      <svg
                        className="w-4 h-4 transition-transform group-hover/link:-translate-y-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Analyze Resume
                    </a>
                  )}
                  {renderActions(app)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
