import axios from "axios";
import { BASE_URL } from "../../utils/constants";
import { useEffect, useState } from "react";
import AdminNavBar from "../../components/navbars/AdminNavBar";

const Colleges = () => {
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchColleges = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/college`, {
        withCredentials: true,
      });
      setColleges(res.data.colleges);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load colleges");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColleges();
  }, []);

  const filteredColleges = colleges.filter(
    (college) =>
      college.name.toLowerCase().includes(search.toLowerCase()) ||
      college.location.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#0B0F19] font-sans flex flex-col box-border selection:bg-fuchsia-500/30 selection:text-fuchsia-200">
        <AdminNavBar />
        <main className="w-full flex-grow flex flex-col items-center justify-center px-4">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-white/10 border-t-fuchsia-500 rounded-full animate-spin"></div>
            <p className="text-fuchsia-400 font-bold tracking-widest uppercase text-[10px] animate-pulse m-0">
              Loading Colleges
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full bg-[#0B0F19] font-sans flex flex-col box-border selection:bg-fuchsia-500/30 selection:text-fuchsia-200">
        <AdminNavBar />
        <main className="w-full max-w-7xl mx-auto flex-grow px-4 md:px-8 py-10 flex items-center justify-center">
          <div className="px-6 py-4 text-[11px] font-bold text-red-300 bg-red-500/10 border border-red-500/30 rounded-xl uppercase tracking-widest">
            {error}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#0B0F19] font-sans flex flex-col box-border text-white selection:bg-fuchsia-500/30 selection:text-fuchsia-200 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-fuchsia-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <AdminNavBar />

        <main className="w-full max-w-7xl mx-auto flex-grow px-4 md:px-8 py-10 md:py-16">
          <div className="mb-10 border-b border-white/10 pb-6">
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 mb-3 mt-0">
              Colleges
            </h1>
            <p className="text-white/40 font-medium text-sm md:text-base m-0 tracking-wide">
              List of all registered colleges
            </p>
          </div>

          <div className="mb-8">
            <input
              type="text"
              placeholder="Search by college name or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full max-w-xl px-5 py-4 rounded-xl border border-white/10 bg-[#0B0F19]/50 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all duration-300 text-sm text-white placeholder:text-white/20 box-border outline-none shadow-[0_4px_20px_-4px_rgba(0,0,0,0.3)]"
            />
          </div>

          {filteredColleges.length === 0 ? (
            <div className="bg-[#0B0F19]/50 border border-white/10 rounded-3xl p-16 text-center shadow-inner mt-8">
              <p className="text-white/40 m-0 text-base font-medium">
                No colleges found matching your search.
              </p>
            </div>
          ) : (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] overflow-hidden box-border transition-all duration-300 hover:border-white/20">
              <div className="overflow-x-auto bg-[#0B0F19]/30 shadow-inner">
                <table className="min-w-full text-left border-collapse whitespace-nowrap">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="px-6 py-5 text-[10px] font-bold text-violet-400 uppercase tracking-widest">
                        College Name
                      </th>
                      <th className="px-6 py-5 text-[10px] font-bold text-violet-400 uppercase tracking-widest">
                        Location
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/5">
                    {filteredColleges.map((college) => (
                      <tr
                        key={college._id}
                        className="hover:bg-white/5 transition-colors duration-300 group"
                      >
                        <td className="px-6 py-5 font-bold text-white/90 text-sm group-hover:text-fuchsia-300 transition-colors">
                          {college.name}
                        </td>
                        <td className="px-6 py-5 text-white/60 text-xs font-medium tracking-wide">
                          {college.location}
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
    </div>
  );
};

export default Colleges;
