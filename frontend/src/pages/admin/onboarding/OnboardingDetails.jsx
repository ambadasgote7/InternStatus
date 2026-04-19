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

  // LOADING STATE
  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F5F6FA] font-['Nunito']">
      <div className="relative flex items-center justify-center">
        <div className="absolute animate-ping h-16 w-16 rounded-full bg-[#6C5CE7]/20"></div>
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#6C5CE7]"></div>
      </div>
      <p className="mt-4 text-[#2D3436] font-semibold animate-pulse">Loading details...</p>
    </div>
  );

  // EMPTY STATE
  if (!data) return (
    <div className="flex items-center justify-center min-h-screen bg-[#F5F6FA] font-['Nunito'] p-6">
      <div className="bg-[#FFFFFF] p-10 rounded-2xl shadow-xl shadow-[#2D3436]/5 border border-[#F5F6FA] text-center max-w-md w-full">
        <div className="w-16 h-16 bg-[#F5F6FA] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔍</span>
        </div>
        <h3 className="text-[#2D3436] font-bold text-xl">No Data Found</h3>
        <p className="text-gray-500 mt-2">The record you are looking for does not exist or has been moved.</p>
      </div>
    </div>
  );

  const isCollege = type === "college";

  return (
    <div className="min-h-screen bg-[#F5F6FA] font-['Nunito'] text-[#2D3436] p-4 md:p-8 lg:p-10 transition-colors duration-500">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-2 gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
          <div>
            <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-[#6C5CE7]/10 text-[#6C5CE7] text-[10px] font-black uppercase tracking-widest rounded-md">Admin Portal</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#2D3436]">
              Onboarding <span className="text-[#6C5CE7]">Details</span>
            </h2>
            <p className="text-gray-500 mt-2 font-medium">
                Reviewing application for {isCollege ? "Educational Institution" : "Corporate Entity"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          
          {/* REQUESTER INFO */}
          <div className="bg-[#FFFFFF] rounded-3xl p-6 lg:p-8 shadow-sm border border-white hover:border-[#6C5CE7]/20 hover:shadow-xl hover:shadow-[#6C5CE7]/5 transition-all duration-500 animate-in fade-in slide-in-from-left-6">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-[#6C5CE7] flex items-center justify-center text-white shadow-lg shadow-[#6C5CE7]/30">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="font-black text-xl text-[#2D3436]">Requester</h3>
            </div>
            
            <div className="space-y-5">
              <div className="flex flex-col border-b border-[#F5F6FA] pb-3">
                <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider">Full Name</span>
                <span className="font-bold text-[#2D3436] text-lg">{data.requesterName}</span>
              </div>
              <div className="flex flex-col border-b border-[#F5F6FA] pb-3">
                <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider">Email Address</span>
                <span className="font-bold text-[#6C5CE7] break-all">{data.requesterEmail}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider">Contact Number</span>
                <span className="font-bold text-[#2D3436]">{data.requesterPhone || "Not Provided"}</span>
              </div>
            </div>
          </div>

          {/* DOCUMENT SECTION */}
          <div className="bg-[#FFFFFF] rounded-3xl p-6 lg:p-8 shadow-sm border border-white hover:border-[#6C5CE7]/20 hover:shadow-xl hover:shadow-[#6C5CE7]/5 transition-all duration-500 animate-in fade-in slide-in-from-right-6">
             <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-[#6C5CE7]/10 flex items-center justify-center text-[#6C5CE7]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-black text-xl text-[#2D3436]">Verification</h3>
            </div>
            <div className="flex flex-col items-center justify-center min-h-[160px] border-2 border-dashed border-[#F5F6FA] rounded-2xl bg-[#F5F6FA]/50 group transition-colors hover:bg-[#F5F6FA] hover:border-[#6C5CE7]/30">
              {data.verificationDocumentUrl ? (
                <a
                  href={data.verificationDocumentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-col items-center gap-3 p-4"
                >
                  <div className="w-14 h-14 bg-[#FFFFFF] rounded-full flex items-center justify-center shadow-sm group-hover:shadow-[#6C5CE7]/20 group-hover:scale-110 transition-all duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#6C5CE7]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <span className="text-[#6C5CE7] font-black text-sm uppercase tracking-tighter underline decoration-2 underline-offset-4">
                    Open Document
                  </span>
                </a>
              ) : (
                <div className="text-center">
                    <p className="text-gray-400 font-bold italic">No document attached</p>
                </div>
              )}
            </div>
          </div>

          {/* ORGANIZATION INFO - Full Width */}
          <div className="md:col-span-2 bg-[#FFFFFF] rounded-3xl p-6 lg:p-10 shadow-sm border border-white hover:shadow-2xl hover:shadow-[#6C5CE7]/5 transition-all duration-500 animate-in fade-in slide-in-from-bottom-8">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 rounded-2xl bg-[#2D3436] flex items-center justify-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="font-black text-2xl text-[#2D3436]">
                {isCollege ? "Institution Profile" : "Corporate Profile"}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {isCollege ? (
                <>
                  <div className="space-y-1 sm:col-span-2 lg:col-span-1">
                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Name</p>
                    <p className="font-bold text-xl text-[#2D3436] leading-tight">{data.collegeName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Location</p>
                    <p className="font-bold text-[#2D3436]">{data.location}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Official Website</p>
                    <a href={data.website} target="_blank" rel="noreferrer" className="font-bold text-[#6C5CE7] hover:underline block truncate">{data.website || "N/A"}</a>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Verification Domain</p>
                    <p className="font-bold px-3 py-1 bg-[#F5F6FA] text-[#2D3436] rounded-lg inline-block text-sm border border-gray-100">
                        @{data.emailDomain || "—"}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1 sm:col-span-2 lg:col-span-1">
                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Company</p>
                    <p className="font-bold text-xl text-[#2D3436] leading-tight">{data.companyName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Industry</p>
                    <p className="font-bold text-[#2D3436]">{data.industry || "—"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Scale</p>
                    <p className="font-bold text-[#2D3436]">{data.companySize || "—"} Employees</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Official Website</p>
                    <a href={data.website} target="_blank" rel="noreferrer" className="font-bold text-[#6C5CE7] hover:underline block truncate">{data.website || "N/A"}</a>
                  </div>
                  
                  {data.locations?.length > 0 && (
                    <div className="sm:col-span-2 lg:col-span-4 mt-6 p-6 bg-[#F5F6FA] rounded-2xl border border-gray-100">
                      <p className="text-[11px] text-gray-400 uppercase font-black tracking-widest mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#6C5CE7]"></span>
                        Registered Office Locations
                      </p>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {data.locations.map((loc, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm p-3 bg-white rounded-xl shadow-sm border border-white">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#6C5CE7] mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            <span className="font-bold text-[#2D3436]">{loc.city}, {loc.state}</span>
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
          <div className="bg-[#FFFFFF] rounded-3xl p-6 lg:p-8 shadow-sm border border-white hover:shadow-xl hover:shadow-[#6C5CE7]/5 transition-all duration-500 animate-in fade-in slide-in-from-left-6 delay-150">
            <h3 className="font-black text-xl text-[#2D3436] mb-6 flex items-center gap-2">
                Approval Status
            </h3>
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-[#F5F6FA] border border-gray-100">
                <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-2">Internal Status</p>
                <span className="px-5 py-2 rounded-full text-xs font-black bg-white border-2 border-[#2D3436] shadow-sm inline-block">
                  {data.status}
                </span>
              </div>
              
              <div className="grid grid-cols-1 gap-4 px-2">
                {data.reviewedBy && (
                  <div className="flex flex-col">
                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Reviewed By</p>
                    <p className="text-sm font-bold text-[#2D3436] truncate">{data.reviewedBy.email}</p>
                  </div>
                )}

                {data.reviewedAt && (
                  <div className="flex flex-col">
                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Review Date</p>
                    <p className="text-sm font-bold text-[#2D3436]">{new Date(data.reviewedAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CREATED ACCOUNT */}
          <div className="bg-[#FFFFFF] rounded-3xl p-6 lg:p-8 shadow-sm border border-white hover:shadow-xl hover:shadow-[#6C5CE7]/5 transition-all duration-500 animate-in fade-in slide-in-from-right-6 delay-150">
            <h3 className="font-black text-xl text-[#2D3436] mb-6">System Identity</h3>
            {data.createdUser ? (
              <div className="p-5 rounded-2xl bg-[#6C5CE7] text-white shadow-lg shadow-[#6C5CE7]/20 relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-[#6C5CE7] shadow-inner font-black text-xl">
                    {data.createdUser.email[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-white truncate max-w-[180px] text-sm md:text-base">{data.createdUser.email}</p>
                    <p className="text-[10px] font-black bg-white/20 px-2 py-0.5 rounded mt-1 inline-block uppercase tracking-tighter">
                        Authorized {data.createdUser.role}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[100px] text-gray-400 bg-[#F5F6FA] rounded-2xl border border-dashed border-gray-200">
                <p className="text-sm font-bold italic tracking-tight">System account pending creation</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}