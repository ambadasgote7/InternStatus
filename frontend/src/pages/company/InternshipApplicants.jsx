import React, { useEffect, useState } from "react";
import API from "../../api/api";
import { useParams } from "react-router-dom";

export default function InternshipApplicants() {
  const { id } = useParams();

  const [data, setData] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Modal State for Uploading Offer Letters
  const [offerModal, setOfferModal] = useState({
    open: false,
    appId: null,
    file: null,
    uploading: false,
  });

  const fetchData = async () => {
    try {
      const res = await API.get(`/applications/internship/${id}`);
      setData(res.data?.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load applicants");
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const updateStatus = async (appId, status) => {
    const confirmAction = window.confirm(
      `Are you sure you want to mark as ${status}?`
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

  const handleOfferUpload = async () => {
    if (!offerModal.file) return alert("Please select a PDF file");

    setOfferModal((prev) => ({ ...prev, uploading: true }));
    try {
      const formData = new FormData();
      formData.append("offerLetter", offerModal.file);

      await API.post(
  `/company/applications/${offerModal.appId}/offer-letter`,
  formData
);

      setOfferModal({ open: false, appId: null, file: null, uploading: false });
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Offer upload failed");
      setOfferModal((prev) => ({ ...prev, uploading: false }));
    }
  };

  const filteredData = data.filter((app) => {
    const name = app.studentSnapshot?.fullName || "";
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus ? app.status === filterStatus : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#FFFFFF] p-4 md:p-10 font-['Nunito'] text-[#2D3436]">
      <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700">
        
        {/* HEADER & CONTROLS */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12 border-b border-[#F5F6FA] pb-10">
          <div>
            <h2 className="text-[36px] font-black tracking-tight leading-none mb-2">
              Applicants <span className="text-[#6C5CE7]">Portal</span>
            </h2>
            <p className="text-[12px] font-black text-[#6C5CE7] uppercase tracking-[0.3em] opacity-70">
              Review and Manage Candidate Pipeline
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto">
            <div className="relative group flex-1">
              <input
                type="text"
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-[#F5F6FA] border-2 border-transparent rounded-2xl text-[14px] outline-none focus:bg-white focus:border-[#6C5CE7]/30"
              />
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </div>

            <div className="relative group">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full md:w-[200px] px-6 py-4 bg-[#F5F6FA] border-2 border-transparent rounded-2xl text-[12px] font-black uppercase tracking-widest outline-none cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="applied">Applied</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="selected">Selected</option>
                <option value="offer_accepted">Accepted</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* DATA DISPLAY */}
        {filteredData.length === 0 ? (
          <div className="bg-[#F5F6FA]/50 border-4 border-dashed border-[#F5F6FA] rounded-[40px] py-32 text-center">
             <p className="text-[14px] font-black text-[#2D3436] opacity-30 uppercase tracking-[0.3em]">No matching applicants found</p>
          </div>
        ) : (
          <div className="bg-[#F5F6FA]/30 border border-[#F5F6FA] rounded-[32px] p-2 md:p-6 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-y-3">
                <thead className="text-[11px] font-black text-[#6C5CE7] uppercase tracking-[0.2em] opacity-60">
                  <tr>
                    <th className="px-6 py-4">Candidate</th>
                    <th className="px-6 py-4">Contact Info</th>
                    <th className="px-6 py-4">Documents</th>
                    <th className="px-6 py-4">Current Flow</th>
                    <th className="px-6 py-4 text-right">Decision Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((app, index) => {
                    const s = app.studentSnapshot || {};
                    const isUpdating = loadingId === app._id;

                    return (
                      <tr key={app._id} className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-all">
                        <td className="px-6 py-6 rounded-l-2xl">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-[#F5F6FA] text-[#6C5CE7] rounded-xl flex items-center justify-center font-black">
                              {s.fullName?.charAt(0) || "?"}
                            </div>
                            <span className="text-[15px] font-black">{s.fullName || "—"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-6 text-[13px] font-bold text-[#2D3436]/60">
                          {s.email || "—"}
                        </td>
                        <td className="px-6 py-6">
                          {app.resumeSnapshot && (
                            <a href={app.resumeSnapshot} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-[#F5F6FA] text-[11px] font-black uppercase rounded-xl hover:bg-[#6C5CE7] hover:text-white transition-all">
                              View CV
                            </a>
                          )}
                        </td>
                        <td className="px-6 py-6">
                          <span className="inline-block px-3 py-1.5 bg-[#F5F6FA] rounded-xl text-[10px] font-black uppercase tracking-widest">
                            {app.status}
                          </span>
                        </td>
                        <td className="px-6 py-6 rounded-r-2xl text-right">
                          <div className="flex gap-2 justify-end items-center min-h-[40px]">
                            {app.status === "applied" && (
                              <>
                                <button onClick={() => updateStatus(app._id, "shortlisted")} disabled={isUpdating} className="px-5 py-2.5 bg-[#6C5CE7] text-white text-[10px] font-black uppercase rounded-xl">
                                  {isUpdating ? "..." : "Shortlist"}
                                </button>
                                <button onClick={() => updateStatus(app._id, "rejected")} className="px-5 py-2.5 border-2 border-red-100 text-red-500 text-[10px] font-black uppercase rounded-xl">
                                  Reject
                                </button>
                              </>
                            )}

                            {app.status === "shortlisted" && (
                              <>
                                <button onClick={() => updateStatus(app._id, "selected")} className="px-5 py-2.5 bg-[#2D3436] text-white text-[10px] font-black uppercase rounded-xl">
                                  Final Select
                                </button>
                                <button onClick={() => updateStatus(app._id, "rejected")} className="px-5 py-2.5 border-2 border-red-100 text-red-500 text-[10px] font-black uppercase rounded-xl">
                                  Reject
                                </button>
                              </>
                            )}

                            {app.status === "selected" && !app.offerLetterUrl && (
                              <button 
                                onClick={() => setOfferModal({ open: true, appId: app._id, file: null, uploading: false })}
                                className="px-5 py-2.5 bg-[#6C5CE7] text-white text-[10px] font-black uppercase rounded-xl"
                              >
                                Issue Offer
                              </button>
                            )}

                            {app.status === "selected" && app.offerLetterUrl && (
                                <span className="px-4 py-2 bg-yellow-50 text-yellow-600 text-[10px] font-black rounded-xl border border-yellow-100">
                                    Waiting for Response
                                </span>
                            )}
                            
                            {/* Other statuses as labels */}
                            {app.status === "offer_accepted" && <span className="text-blue-600 text-[11px] font-black">OFFER SECURED</span>}
                            {app.status === "ongoing" && <span className="text-blue-700 text-[11px] font-black">● WORKING</span>}
                            {app.status === "completed" && <span className="text-green-600 text-[11px] font-black">✓ FINISHED</span>}
                            {app.status === "rejected" && <span className="text-red-300 text-[11px] font-black uppercase">Rejected</span>}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MODAL COMPONENT */}
      {offerModal.open && (
        <div className="fixed inset-0 bg-[#2D3436]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-[32px] w-full max-w-[450px] shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-[24px] font-black tracking-tight mb-2">Upload Offer Letter</h3>
            <p className="text-[13px] text-[#2D3436]/60 mb-8 font-bold">Select the official PDF document for this candidate.</p>

            <div className="relative mb-8">
                <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setOfferModal({ ...offerModal, file: e.target.files[0] })}
                    className="w-full text-sm text-slate-500 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-[11px] file:font-black file:uppercase file:bg-[#6C5CE7]/10 file:text-[#6C5CE7] hover:file:bg-[#6C5CE7]/20 transition-all"
                />
            </div>

            <div className="flex gap-4">
              <button
                disabled={offerModal.uploading}
                onClick={() => setOfferModal({ open: false, appId: null, file: null, uploading: false })}
                className="flex-1 py-4 text-[12px] font-black uppercase tracking-widest text-[#2D3436]/40 hover:text-[#2D3436]"
              >
                Cancel
              </button>
              <button
                disabled={offerModal.uploading || !offerModal.file}
                onClick={handleOfferUpload}
                className="flex-1 py-4 bg-[#6C5CE7] text-white text-[12px] font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-[#6C5CE7]/20 disabled:opacity-50 transition-all active:scale-95"
              >
                {offerModal.uploading ? "Uploading..." : "Confirm & Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}