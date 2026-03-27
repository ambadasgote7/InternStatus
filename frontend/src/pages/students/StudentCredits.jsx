import { useEffect, useState } from "react";
import API from "../../api/api";
import StudentNavBar from "../../components/navbars/StudentNavBar";

export default function StudentCredits() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCredits = async () => {
    try {
      const res = await API.get("/students/credits");
      setData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredits();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] flex items-center justify-center font-['Nunito'] transition-all duration-300">
        <div className="flex flex-col items-center gap-4 animate-in fade-in duration-700">
          <div className="w-12 h-12 border-4 border-[#F5F6FA] border-t-[#6C5CE7] rounded-full animate-spin"></div>
          <p className="text-[12px] font-black text-[#6C5CE7] animate-pulse m-0 uppercase tracking-widest">
            Syncing Credit Records...
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] flex items-center justify-center p-4 font-['Nunito'] text-[#2D3436] transition-all duration-300">
        <div className="bg-[#F5F6FA] border-2 border-dashed border-[#6C5CE7]/20 rounded-[32px] p-16 text-center shadow-sm animate-in zoom-in duration-500">
          <p className="text-[14px] font-black text-[#2D3436] opacity-40 m-0 uppercase tracking-[0.15em]">
            No credit data found
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#FFFFFF] text-[#2D3436] font-['Nunito'] pb-12 transition-colors duration-500 selection:bg-[#6C5CE7]/20 selection:text-[#6C5CE7]">
        <main className="max-w-6xl mx-auto w-full px-4 md:px-8 py-8 md:py-10 flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#F5F6FA] pb-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl md:text-5xl font-black text-[#2D3436] m-0 tracking-tighter leading-tight uppercase">
                Academic Credits
              </h1>
              <p className="text-[13px] font-black text-[#6C5CE7] opacity-80 m-0 uppercase tracking-[0.2em]">
                Verified Internship Credentials
              </p>
            </div>
          </header>

          {/* Hero Stat Section */}
          <section className="bg-[#FFFFFF] border border-[#F5F6FA] rounded-[32px] p-10 md:p-14 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center relative overflow-hidden group hover:shadow-[0_20px_50px_rgba(108,92,231,0.08)] transition-all duration-500">
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-[#6C5CE7]/5 rounded-full blur-3xl group-hover:bg-[#6C5CE7]/10 transition-colors duration-700"></div>
            <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-[#6C5CE7]/5 rounded-full blur-3xl group-hover:bg-[#6C5CE7]/10 transition-colors duration-700"></div>

            <span className="text-[12px] font-black opacity-50 uppercase tracking-[0.2em] block mb-4 text-[#2D3436] relative z-10">
              Cumulative Total
            </span>
            <div className="text-[64px] md:text-[80px] font-black text-[#6C5CE7] leading-none tracking-tighter relative z-10 drop-shadow-sm group-hover:scale-105 transition-transform duration-500">
              {data.totalCredits}
            </div>
            <p className="text-[13px] font-bold text-[#2D3436] opacity-60 mt-4 uppercase tracking-widest relative z-10">
              Verified Points Earned
            </p>
          </section>

          {/* Details Table */}
          <section className="bg-[#FFFFFF] border border-[#F5F6FA] rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden box-border hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] transition-all duration-500">
            <div className="px-8 py-6 border-b border-[#F5F6FA] bg-[#FFFFFF]">
              <h3 className="text-[14px] font-black text-[#6C5CE7] m-0 uppercase tracking-[0.2em] border-l-4 border-[#6C5CE7] pl-4">
                Performance Breakdown
              </h3>
            </div>

            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead className="bg-[#F5F6FA] bg-opacity-50">
                  <tr>
                    <th className="px-8 py-6 text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-[0.15em]">
                      Program Title
                    </th>
                    <th className="px-8 py-6 text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-[0.15em] text-center">
                      Faculty Score
                    </th>
                    <th className="px-8 py-6 text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-[0.15em] text-center">
                      Points
                    </th>
                    <th className="px-8 py-6 text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-[0.15em] text-right">
                      Completion
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5F6FA]">
                  {data.internships.map((item, index) => (
                    <tr
                      key={index}
                      style={{ animationDelay: `${index * 50}ms` }}
                      className="hover:bg-[#F5F6FA]/40 transition-colors duration-300 group animate-in fade-in fill-mode-both"
                    >
                      <td className="px-8 py-6">
                        <div className="text-[15px] font-black text-[#2D3436] group-hover:text-[#6C5CE7] transition-colors duration-300">
                          {item.internshipTitle}
                        </div>
                      </td>

                      <td className="px-8 py-6 text-center">
                        <span className="text-[14px] font-mono font-bold text-[#2D3436] opacity-70 bg-[#F5F6FA] px-3 py-1.5 rounded-[10px] group-hover:bg-[#FFFFFF] transition-colors">
                          {item.facultyScore || "—"}
                        </span>
                      </td>

                      <td className="px-8 py-6 text-center">
                        <span className="inline-block px-4 py-1.5 rounded-[12px] bg-[#6C5CE7] text-[#FFFFFF] text-[12px] font-black shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:-translate-y-0.5">
                          {item.creditsEarned}
                        </span>
                      </td>

                      <td className="px-8 py-6 text-right">
                        <div className="flex flex-col items-end gap-2">
                          <span className="text-[13px] font-black text-[#008000]">
                            {item.completionRate}%
                          </span>
                          <div className="w-24 h-1.5 bg-[#F5F6FA] rounded-full overflow-hidden shadow-inner">
                            <div
                              className="h-full bg-[#008000] rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                              style={{ width: `${item.completionRate}%` }}
                            >
                              {/* Subte animated shimmer on the progress bar */}
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FFFFFF]/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
