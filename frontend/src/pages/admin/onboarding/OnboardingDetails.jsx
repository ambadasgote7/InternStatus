import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../../api/api";

export default function OnboardingDetails() {
  const { type, id } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/admin/onboarding/${type}/${id}`);
      setData(res.data?.data || null);
    } catch (err) {
      console.error("Details fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [type, id]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#F5F6FA] font-['Nunito']">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6C5CE7]"></div>
    </div>
  );

  if (!data) return (
    <div className="flex items-center justify-center min-h-screen bg-[#F5F6FA] font-['Nunito'] text-[#2D3436]">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">No data found</div>
    </div>
  );

  const isCollege = type === "college";

  return (
    <div className="min-h-screen bg-[#F5F6FA] font-['Nunito'] text-[#2D3436] p-4 md:p-8 lg:p-12 animate-in fade-in duration-500">
      <div className="max-w-5xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-[#2D3436]">
              Onboarding <span className="text-[#6C5CE7]">Details</span>
            </h2>
            <p className="text-sm text-gray-500 mt-1">Reviewing application for {isCollege ? "Educational Institution" : "Corporate Entity"}</p>
          </div>
          <div className="px-4 py-1.5 rounded-full bg-white border border-[#6C5CE7]/20 text-[#6C5CE7] font-bold text-sm shadow-sm self-start md:self-center">
            ID: {id?.substring(0, 8)}...
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* REQUESTER INFO */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#6C5CE7]/10 flex items-center justify-center text-[#6C5CE7]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor font-bold">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg text-[#2D3436]">Requester Information</h3>
            </div>
            
            <div className="space-y-3">
              <p className="flex justify-between border-b border-gray-50 pb-2"><span className="text-gray-500">Name</span> <span className="font-semibold">{data.requesterName}</span></p>
              <p className="flex justify-between border-b border-gray-50 pb-2"><span className="text-gray-500">Email</span> <span className="font-semibold text-[#6C5CE7]">{data.requesterEmail}</span></p>
              <p className="flex justify-between pb-2"><span className="text-gray-500">Phone</span> <span className="font-semibold">{data.requesterPhone || "—"}</span></p>
            </div>
          </div>

          {/* DOCUMENT SECTION */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
             <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#6C5CE7]/10 flex items-center justify-center text-[#6C5CE7]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg text-[#2D3436]">Verification Document</h3>
            </div>
            <div className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-gray-100 rounded-xl bg-[#F5F6FA]">
              {data.verificationDocumentUrl ? (
                <a
                  href={data.verificationDocumentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center gap-2 text-[#6C5CE7] font-bold hover:scale-105 transition-transform"
                >
                  View Document 
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              ) : (
                <p className="text-gray-400 italic">No document attached</p>
              )}
            </div>
          </div>

          {/* ORGANIZATION INFO - Full Width */}
          <div className="md:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-[#6C5CE7]/10 flex items-center justify-center text-[#6C5CE7]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="font-bold text-lg text-[#2D3436]">
                {isCollege ? "College Details" : "Company Details"}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4">
              {isCollege ? (
                <>
                  <div className="space-y-1"><p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Institution Name</p><p className="font-semibold text-lg">{data.collegeName}</p></div>
                  <div className="space-y-1"><p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Location</p><p className="font-semibold">{data.location}</p></div>
                  <div className="space-y-1"><p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Official Website</p><p className="font-semibold text-[#6C5CE7] underline decoration-2 underline-offset-4">{data.website || "—"}</p></div>
                  <div className="space-y-1"><p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Allowed Domain</p><p className="font-semibold px-2 py-0.5 bg-gray-100 rounded inline-block text-sm">@{data.emailDomain || "—"}</p></div>
                </>
              ) : (
                <>
                  <div className="space-y-1"><p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Company Name</p><p className="font-semibold text-lg">{data.companyName}</p></div>
                  <div className="space-y-1"><p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Industry</p><p className="font-semibold">{data.industry || "—"}</p></div>
                  <div className="space-y-1"><p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Company Size</p><p className="font-semibold">{data.companySize || "—"}</p></div>
                  <div className="space-y-1"><p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Official Website</p><p className="font-semibold text-[#6C5CE7] underline decoration-2 underline-offset-4">{data.website || "—"}</p></div>
                  
                  {data.locations?.length > 0 && (
                    <div className="sm:col-span-2 mt-4 p-4 bg-[#F5F6FA] rounded-xl">
                      <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-2">Office Locations</p>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {data.locations.map((loc, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#6C5CE7]"></span>
                            {loc.city}, {loc.state}, {loc.country}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* APPROVAL INFO */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
            <h3 className="font-bold text-lg text-[#2D3436] mb-4">Approval Status</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Current State</p>
                <span className="px-4 py-1 rounded-full text-sm font-bold bg-white border-2 border-current shadow-sm" style={{ color: 'inherit' }}>
                  {data.status}
                </span>
              </div>
              
              {data.reviewedBy && (
                <div className="pt-4 border-t border-gray-50">
                  <p className="text-sm font-semibold">Reviewed By</p>
                  <p className="text-sm text-gray-500">{data.reviewedBy.email}</p>
                </div>
              )}

              {data.reviewedAt && (
                <div>
                  <p className="text-sm font-semibold">Review Date</p>
                  <p className="text-sm text-gray-500">{new Date(data.reviewedAt).toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>

          {/* CREATED ACCOUNT */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
            <h3 className="font-bold text-lg text-[#2D3436] mb-4">System Account</h3>
            {data.createdUser ? (
              <div className="p-4 rounded-xl bg-[#6C5CE7]/5 border border-[#6C5CE7]/10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#6C5CE7] shadow-sm font-bold">
                    {data.createdUser.email[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-[#2D3436] truncate max-w-[180px]">{data.createdUser.email}</p>
                    <p className="text-xs font-bold text-[#6C5CE7] uppercase">{data.createdUser.role}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-24 text-gray-400 bg-gray-50 rounded-xl border border-gray-100 italic">
                No account created yet
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}