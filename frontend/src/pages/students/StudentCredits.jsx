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
      <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center font-sans">
        <p className="text-[14px] font-bold text-[#333] animate-pulse m-0 uppercase tracking-widest">
          Syncing Credit Records
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center p-4 font-sans">
        <div className="bg-[#fff] border-2 border-dashed border-[#e5e5e5] rounded-[20px] p-10 text-center">
          <p className="text-[13px] font-bold text-[#333] opacity-60 m-0 uppercase tracking-widest">
            No credit data found
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <StudentNavBar />

      <div className="min-h-screen bg-[#f9f9f9] text-[#333] font-sans pb-10">
        <main className="max-w-5xl mx-auto w-full px-4 md:px-6 py-6 flex flex-col gap-6">
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#e5e5e5] pb-4">
            <div className="flex flex-col gap-1">
              <h1 className="text-[23px] font-black text-[#333] m-0 tracking-tight leading-tight">
                Academic Credits
              </h1>
              <p className="text-[13px] font-bold text-[#333] opacity-60 m-0 uppercase tracking-widest">
                Verified Internship Credentials
              </p>
            </div>
          </header>

          <section className="bg-[#fff] border border-[#333] rounded-[20px] p-8 shadow-sm text-center">
            <span className="text-[11px] font-black opacity-40 uppercase tracking-widest block mb-2">
              Cumulative Total
            </span>
            <div className="text-[48px] font-black text-[#111] leading-none tracking-tighter">
              {data.totalCredits}
            </div>
            <p className="text-[12px] font-bold opacity-60 mt-2 uppercase">
              Verified Points Earned
            </p>
          </section>

          <section className="bg-[#fff] border border-[#e5e5e5] rounded-[20px] shadow-sm overflow-hidden box-border">
            <div className="px-6 py-4 border-b border-[#f9f9f9] bg-[#fcfcfc]">
              <h3 className="text-[11px] font-black text-[#333] opacity-50 m-0 uppercase tracking-widest">
                Performance Breakdown
              </h3>
            </div>

            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead className="bg-[#f9f9f9] border-b border-[#e5e5e5]">
                  <tr>
                    <th className="px-6 py-4 text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                      Program Title
                    </th>
                    <th className="px-6 py-4 text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest text-center">
                      Faculty Score
                    </th>
                    <th className="px-6 py-4 text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest text-center">
                      Points
                    </th>
                    <th className="px-6 py-4 text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest text-right">
                      Completion
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e5e5]">
                  {data.internships.map((item, index) => (
                    <tr
                      key={index}
                      className="hover:bg-[#fcfcfc] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="text-[14px] font-black text-[#111]">
                          {item.internshipTitle}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-[13px] font-mono font-bold">
                          {item.facultyScore || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-block px-3 py-1 rounded-[8px] bg-[#111] text-[#fff] text-[12px] font-black">
                          {item.creditsEarned}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-[12px] font-black text-[#008000]">
                            {item.completionRate}%
                          </span>
                          <div className="w-20 h-1 bg-[#f9f9f9] rounded-full overflow-hidden border border-[#e5e5e5]">
                            <div
                              className="h-full bg-[#008000]"
                              style={{ width: `${item.completionRate}%` }}
                            ></div>
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
