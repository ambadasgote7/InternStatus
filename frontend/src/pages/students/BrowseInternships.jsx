import React, { useEffect, useState } from "react";
import API from "../../api/api";
import { useNavigate } from "react-router-dom";

export default function BrowseInternships() {
  const [data, setData] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const res = await API.get("/internships/browse");
      setData(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const apply = async (id) => {
    try {
      setLoadingId(id);
      await API.post(`/applications/apply/${id}`);
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] p-4 md:p-8 lg:p-10 font-['Nunito'] text-[#2D3436] transition-all duration-500 selection:bg-[#6C5CE7]/20 selection:text-[#6C5CE7]">
      <main className="max-w-7xl mx-auto w-full flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <header className="flex flex-col gap-3 border-b border-[#F5F6FA] pb-8">
          <h2 className="text-3xl md:text-5xl font-black m-0 tracking-tighter text-[#2D3436] uppercase leading-tight">
            Browse Internships
          </h2>
          <p className="text-[13px] font-black text-[#6C5CE7] opacity-80 m-0 uppercase tracking-[0.2em]">
            Explore and apply for opportunities that match your skills
          </p>
        </header>

        {data.length === 0 ? (
          <div className="bg-[#F5F6FA] border-2 border-dashed border-[#6C5CE7]/20 rounded-[32px] p-20 text-center animate-in zoom-in duration-500">
            <p className="text-[14px] font-black text-[#2D3436] opacity-40 m-0 uppercase tracking-[0.15em]">
              No internships currently available
            </p>
          </div>
        ) : (
          <div className="bg-[#FFFFFF] border border-[#F5F6FA] rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden box-border hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] transition-all duration-500">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead className="bg-[#F5F6FA] bg-opacity-50 border-b border-[#F5F6FA]">
                  <tr>
                    <th className="px-8 py-6 text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-[0.15em]">
                      Opportunity Name
                    </th>
                    <th className="px-8 py-6 text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-[0.15em]">
                      Organization
                    </th>
                    <th className="px-8 py-6 text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-[0.15em]">
                      Deadline
                    </th>
                    <th className="px-8 py-6 text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-[0.15em] text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5F6FA]">
                  {data.map((item, idx) => (
                    <tr
                      key={item._id}
                      style={{ animationDelay: `${idx * 50}ms` }}
                      className="hover:bg-[#F5F6FA]/40 transition-colors duration-300 group animate-in fade-in fill-mode-both"
                    >
                      {/* Name */}
                      <td className="px-8 py-6">
                        <div className="text-[15px] font-black text-[#2D3436] group-hover:text-[#6C5CE7] transition-colors duration-300">
                          {item.title}
                        </div>
                      </td>

                      {/* Company Name */}
                      <td className="px-8 py-6">
                        <div className="text-[14px] font-bold text-[#2D3436] opacity-80">
                          {item.company?.name || "Unknown"}
                        </div>
                      </td>

                      {/* Deadline */}
                      <td className="px-8 py-6">
                        <span className="text-[13px] font-bold text-[#2D3436] bg-[#F5F6FA] px-3 py-1.5 rounded-[10px] group-hover:bg-[#FFFFFF] transition-colors">
                          {new Date(
                            item.applicationDeadline,
                          ).toLocaleDateString("en-IN", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-8 py-6">
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() =>
                              navigate(`/student/internships/${item._id}`)
                            }
                            className="px-5 py-2.5 text-[10px] font-black text-[#2D3436] bg-[#FFFFFF] border border-[#F5F6FA] rounded-[12px] hover:border-[#6C5CE7] hover:text-[#6C5CE7] hover:shadow-sm transition-all duration-300 cursor-pointer uppercase tracking-widest outline-none transform hover:-translate-y-0.5"
                          >
                            View Details
                          </button>

                          <button
                            disabled={
                              item.alreadyApplied || loadingId === item._id
                            }
                            onClick={() => apply(item._id)}
                            className={`px-6 py-2.5 text-[10px] font-black rounded-[12px] transition-all duration-300 uppercase tracking-widest outline-none transform flex items-center justify-center min-w-[120px] shadow-sm
                              ${
                                item.alreadyApplied
                                  ? "bg-[#F5F6FA] text-[#2D3436] opacity-50 cursor-not-allowed border-none shadow-none"
                                  : "bg-[#6C5CE7] text-[#FFFFFF] border-none hover:shadow-md hover:-translate-y-0.5 hover:bg-opacity-90 cursor-pointer"
                              }
                            `}
                          >
                            {loadingId === item._id ? (
                              <div className="flex items-center gap-2">
                                <span className="w-3 h-3 border-2 border-[#FFFFFF]/30 border-t-[#FFFFFF] rounded-full animate-spin"></span>
                                Applying...
                              </div>
                            ) : item.alreadyApplied ? (
                              "Applied"
                            ) : (
                              "Apply Now"
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
