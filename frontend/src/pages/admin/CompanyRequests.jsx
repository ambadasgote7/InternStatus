import React, { useEffect, useState } from "react";
import API from "../../api/api";
import AdminNavBar from "../../components/navbars/AdminNavBar"; // Assuming standard inclusion

export default function CompanyRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await API.get("/onboarding/company");
      setRequests(res.data.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, status) => {
    try {
      await API.patch(`/onboarding/company/${id}/status`, { status });
      setRequests((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status } : r)),
      );
    } catch (err) {
      console.error(err);
      alert("Action failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] flex flex-col font-sans">
        <AdminNavBar />
        <div className="flex-grow flex items-center justify-center">
          <p className="text-[#333] font-bold text-[13px] animate-pulse m-0">
            Loading Requests...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#333] flex flex-col font-sans pb-10">
      <AdminNavBar />

      <main className="max-w-6xl mx-auto w-full px-4 md:px-6 py-6 flex flex-col gap-5">
        {/* Header */}
        <header className="border-b border-[#e5e5e5] pb-4 mb-2">
          <h2 className="text-[23px] font-black m-0 tracking-tight text-[#333]">
            Company Onboarding Requests
          </h2>
          <p className="text-[13px] font-bold text-[#333] opacity-60 m-0 mt-1">
            Review and manage new company registrations
          </p>
        </header>

        {requests.length === 0 && (
          <div className="bg-[#fff] border-2 border-dashed border-[#e5e5e5] rounded-[20px] p-10 text-center">
            <p className="text-[13px] font-bold text-[#333] opacity-60 m-0">
              No requests found
            </p>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {requests.map((req) => {
            const companyName =
              req.selectedCompany?.name || req.companyName || "—";
            const isExisting = !!req.selectedCompany;

            return (
              <div
                key={req._id}
                className="bg-[#fff] border border-[#e5e5e5] rounded-[20px] shadow-sm p-5 flex flex-col gap-4"
              >
                {/* Card Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#f9f9f9] pb-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-[18px] font-black text-[#333] m-0">
                      {companyName}
                    </h3>
                    {isExisting && (
                      <span className="px-2.5 py-1 text-[10px] font-bold text-[#333] bg-[#f9f9f9] border border-[#333] uppercase tracking-widest rounded-[10px]">
                        Existing Company
                      </span>
                    )}
                  </div>
                  <span
                    className={`inline-block px-3 py-1.5 rounded-[10px] text-[10px] font-bold uppercase tracking-widest border ${
                      req.status === "approved"
                        ? "bg-[#111] text-[#fff] border-[#111]"
                        : req.status === "rejected"
                          ? "bg-[#fff] text-[#cc0000] border-[#cc0000]"
                          : "bg-[#f9f9f9] text-[#333] border-[#e5e5e5]"
                    }`}
                  >
                    {req.status}
                  </span>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Requester Info */}
                  <div className="flex flex-col gap-2">
                    <h4 className="text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest m-0 border-b border-[#f9f9f9] pb-1">
                      Requester Details
                    </h4>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                          Name
                        </span>
                        <span className="text-[13px] font-bold text-[#333]">
                          {req.requesterName}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                          Email
                        </span>
                        <span className="text-[13px] font-medium text-[#333] break-all">
                          {req.requesterEmail}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Company Info */}
                  <div className="flex flex-col gap-2">
                    <h4 className="text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest m-0 border-b border-[#f9f9f9] pb-1">
                      Company Details
                    </h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-[#333] opacity-50 uppercase tracking-widest">
                          Industry
                        </span>
                        <span
                          className="text-[13px] font-medium text-[#333] truncate"
                          title={req.industry || "N/A"}
                        >
                          {req.industry || "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-[#333] opacity-50 uppercase tracking-widest">
                          Size
                        </span>
                        <span className="text-[13px] font-medium text-[#333]">
                          {req.companySize || "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-[#333] opacity-50 uppercase tracking-widest">
                          Website
                        </span>
                        <span
                          className="text-[13px] font-bold text-[#111] underline truncate"
                          title={req.website || "N/A"}
                        >
                          {req.website || "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-[#333] opacity-50 uppercase tracking-widest">
                          Domain
                        </span>
                        <span
                          className="text-[13px] font-medium text-[#333] truncate"
                          title={req.emailDomain || "N/A"}
                        >
                          {req.emailDomain || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Locations */}
                  {req.locations?.length > 0 && (
                    <div className="flex flex-col gap-1.5 md:col-span-2">
                      <span className="text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                        Locations
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {req.locations.map((loc, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 bg-[#f9f9f9] border border-[#e5e5e5] rounded-[10px] text-[11px] text-[#333] font-bold"
                          >
                            {[loc.city, loc.state, loc.country]
                              .filter(Boolean)
                              .join(", ")}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions Footer */}
                <div className="pt-4 border-t border-[#e5e5e5] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {req.verificationDocumentUrl && (
                      <a
                        href={req.verificationDocumentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full sm:w-auto text-center px-4 py-2 text-[11px] font-bold text-[#333] bg-[#f9f9f9] border border-[#e5e5e5] rounded-[12px] hover:bg-[#e5e5e5] transition-colors no-underline uppercase tracking-widest"
                      >
                        View Document
                      </a>
                    )}
                  </div>

                  {req.status === "pending" && (
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => handleAction(req._id, "approved")}
                        className="flex-1 sm:flex-none px-6 py-2 text-[11px] font-bold text-[#fff] bg-[#111] border-none rounded-[12px] hover:opacity-80 transition-opacity cursor-pointer uppercase tracking-widest outline-none"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(req._id, "rejected")}
                        className="flex-1 sm:flex-none px-6 py-2 text-[11px] font-bold text-[#cc0000] bg-[#fff] border border-[#cc0000] rounded-[12px] hover:bg-[#f9f9f9] transition-colors cursor-pointer uppercase tracking-widest outline-none"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
