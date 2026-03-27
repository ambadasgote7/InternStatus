import { useEffect, useState } from "react";
import API from "../../api/api";
import { useNavigate } from "react-router-dom";

// Simple status list
const STATUS_BUTTONS = ["ALL", "ongoing", "completed", "terminated"];

const MentorInterns = () => {
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ongoing");
  const [modeFilter, setModeFilter] = useState("ALL");

  const navigate = useNavigate();

  const fetchInterns = async () => {
    try {
      const res = await API.get("/mentor/interns");
      setInterns(res.data.data || []);
    } catch (err) {
      console.error("Error fetching list", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.patch(`/mentor/interns/${id}/status`, { status });
      fetchInterns();
    } catch (err) {
      console.error("Failed to update", err);
    }
  };

  useEffect(() => {
    fetchInterns();
  }, []);

  const filteredInterns = interns.filter((intern) => {
    const matchesSearch =
      intern.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      intern.studentEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" || intern.status === statusFilter;
    const matchesMode = modeFilter === "ALL" || intern.mode === modeFilter;
    return matchesSearch && matchesStatus && matchesMode;
  });

  const uniqueModes = ["ALL", ...new Set(interns.map((i) => i.mode).filter(Boolean))];

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center font-['Nunito']">
        <div className="w-10 h-10 border-4 border-[#F5F6FA] border-t-[#6C5CE7] rounded-full animate-spin mb-4" />
        <p className="text-[14px] font-bold text-[#2D3436] opacity-50 tracking-widest">LOADING LIST...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#2D3436] font-['Nunito'] pb-12">
      <main className="max-w-7xl mx-auto w-full px-4 md:px-8 py-10 flex flex-col gap-8">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-2 border-[#F5F6FA] pb-6">
          <div>
            <h1 className="text-[30px] font-black text-[#2D3436] m-0 tracking-tight">
              My <span className="text-[#6C5CE7]">Interns</span>
            </h1>
            <p className="text-[13px] font-bold text-[#2D3436] opacity-40 m-0 uppercase tracking-widest mt-1">
              List of all your students
            </p>
          </div>
          <div className="text-[12px] font-black text-[#6C5CE7] bg-[#6C5CE7]/10 px-5 py-2 rounded-full uppercase tracking-widest border border-[#6C5CE7]/20">
            Total: {interns.length}
          </div>
        </header>

        {interns.length > 0 && (
          <div className="flex flex-col gap-5 bg-[#F5F6FA] p-6 rounded-[28px] border border-white">
            {/* Simple Status Filters */}
            <div className="flex flex-wrap gap-2">
              {STATUS_BUTTONS.map((status) => {
                const isActive = statusFilter === status;
                return (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-5 py-2.5 text-[11px] font-black uppercase tracking-wider rounded-xl transition-all border-2 ${
                      isActive
                        ? "bg-[#6C5CE7] text-white border-[#6C5CE7] shadow-md shadow-[#6C5CE7]/20"
                        : "bg-white text-[#2D3436] border-transparent hover:border-[#6C5CE7]/20"
                    }`}
                  >
                    {status === "ALL" ? "Show All" : status}
                  </button>
                );
              })}
            </div>

            {/* Simple Search */}
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                placeholder="Search by student name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-6 py-4 text-[14px] font-bold bg-white border-2 border-transparent rounded-2xl outline-none focus:border-[#6C5CE7]/30 transition-all"
              />
              <select
                value={modeFilter}
                onChange={(e) => setModeFilter(e.target.value)}
                className="w-full md:w-56 px-6 py-4 text-[12px] font-black text-[#2D3436] bg-white border-2 border-transparent rounded-2xl outline-none focus:border-[#6C5CE7]/30 transition-all uppercase tracking-widest cursor-pointer"
              >
                {uniqueModes.map((mode) => (
                  <option key={mode} value={mode}>
                    {mode === "ALL" ? "All Modes" : mode}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Content Table */}
        {interns.length === 0 ? (
          <div className="bg-[#F5F6FA] border-2 border-dashed border-[#6C5CE7]/20 rounded-[30px] p-20 text-center">
            <p className="text-[14px] font-black text-[#2D3436] opacity-30 uppercase tracking-widest">
              No students found
            </p>
          </div>
        ) : filteredInterns.length === 0 ? (
          <div className="bg-white border-2 border-[#F5F6FA] rounded-[30px] p-16 text-center shadow-sm">
            <p className="text-[14px] font-black text-[#2D3436] opacity-30 uppercase tracking-widest mb-4">
              No matching records
            </p>
            <button
              onClick={() => { setSearchTerm(""); setStatusFilter("ongoing"); setModeFilter("ALL"); }}
              className="px-6 py-2 bg-[#F5F6FA] text-[#2D3436] text-[11px] font-black uppercase tracking-widest rounded-lg"
            >
              Reset
            </button>
          </div>
        ) : (
          <div className="bg-white border-2 border-[#F5F6FA] rounded-[32px] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F5F6FA]">
                    <th className="p-5 text-[10px] font-black text-[#2D3436] opacity-40 uppercase tracking-widest">Student Info</th>
                    <th className="p-5 text-[10px] font-black text-[#2D3436] opacity-40 uppercase tracking-widest">Project Details</th>
                    <th className="p-5 text-[10px] font-black text-[#2D3436] opacity-40 uppercase tracking-widest">Working Dates</th>
                    <th className="p-5 text-[10px] font-black text-[#2D3436] opacity-40 uppercase tracking-widest">Current Status</th>
                    <th className="p-5 text-[10px] font-black text-[#2D3436] opacity-40 uppercase tracking-widest text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5F6FA]">
                  {filteredInterns.map((intern) => (
                    <tr key={intern.applicationId} className="hover:bg-[#F5F6FA]/30 transition-colors">
                      <td className="p-5">
                        <div className="flex flex-col">
                          <span className="text-[15px] font-black text-[#2D3436]">{intern.studentName}</span>
                          <span className="text-[11px] font-bold text-[#6C5CE7]">{intern.studentEmail}</span>
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="flex flex-col">
                          <span className="text-[13px] font-black text-[#2D3436]">{intern.internshipTitle}</span>
                          <span className="text-[11px] font-bold opacity-40 uppercase mt-0.5">{intern.mode} • {intern.location}</span>
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="text-[11px] font-mono font-black text-[#2D3436]">
                          {intern.startDate ? new Date(intern.startDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "—"}
                          <span className="mx-1.5 opacity-20">to</span>
                          <span className={intern.endDate ? "" : "text-[#6C5CE7]"}>
                            {intern.endDate ? new Date(intern.endDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "Present"}
                          </span>
                        </div>
                      </td>
                      <td className="p-5">
                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border-2 ${
                          intern.status === 'ongoing' ? 'bg-white border-[#6C5CE7]/30 text-[#6C5CE7]' : 'bg-white border-[#F5F6FA] text-[#2D3436]/40'
                        }`}>
                          {intern.status}
                        </span>
                      </td>
                      <td className="p-5">
                        <div className="flex flex-wrap gap-2 justify-center">
                          {intern.status === "offer_accepted" && (
                            <button
                              onClick={() => updateStatus(intern.applicationId, "ongoing")}
                              className="px-4 py-2 bg-[#2D3436] text-white text-[10px] font-black rounded-lg uppercase tracking-widest hover:bg-[#6C5CE7] transition-all"
                            >
                              Start
                            </button>
                          )}
                          {intern.status === "ongoing" && (
                            <>
                              <button
                                onClick={() => updateStatus(intern.applicationId, "completed")}
                                className="px-4 py-2 bg-[#6C5CE7] text-white text-[10px] font-black rounded-lg uppercase tracking-widest hover:opacity-90 transition-all"
                              >
                                Done
                              </button>
                              <button
                                onClick={() => updateStatus(intern.applicationId, "terminated")}
                                className="px-4 py-2 border-2 border-[#cc0000]/10 text-[#cc0000] text-[10px] font-black rounded-lg uppercase tracking-widest hover:bg-[#cc0000] hover:text-white transition-all"
                              >
                                Stop
                              </button>
                            </>
                          )}
                          {intern.status === "completed" && intern.report && intern.report.status !== "generated" && (
                            <button
                              onClick={() => window.open(intern.report.reportUrl, "_blank")}
                              className="px-4 py-2 bg-[#F5F6FA] text-[#2D3436] text-[10px] font-black rounded-lg uppercase tracking-widest border border-transparent hover:border-[#6C5CE7]/30 transition-all"
                            >
                              Report
                            </button>
                          )}
                          <button
                            onClick={() => navigate(`/mentor/intern/${intern.applicationId}/track`)}
                            className="px-4 py-2 bg-white border-2 border-[#F5F6FA] text-[#2D3436] text-[10px] font-black rounded-lg uppercase tracking-widest hover:border-[#6C5CE7]/30 transition-all"
                          >
                            Tasks
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
};

export default MentorInterns;