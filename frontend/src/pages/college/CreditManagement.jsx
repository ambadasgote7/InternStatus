import React, { useState } from "react";
import API from "../../api/api";

export default function CreditManagement() {
  const [query, setQuery] = useState("");
  const [students, setStudents] = useState([]);
  const [student, setStudent] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [scores, setScores] = useState({});
  const [remarks, setRemarks] = useState({});
  const [lockedReports, setLockedReports] = useState({});

  const loadReports = async (selected) => {
    if (!selected?._id) throw new Error("Invalid student data");
    const reportsRes = await API.get(`/college/students/${selected._id}/reports`);
    setReports(reportsRes.data.data || []);
  };

  const handleSearch = async () => {
    if (!query.trim()) {
      alert("Enter ABC ID or Name");
      return;
    }
    try {
      setLoading(true);
      setStudent(null);
      setStudents([]);
      setReports([]);
      setScores({});
      setRemarks({});
      setLockedReports({});

      const res = await API.get(`/college/students/search?query=${query}`);
      const results = res?.data?.data?.results || [];

      if (!results.length) return alert("No students found");

      if (results.length === 1) {
        setStudent(results[0]);
        await loadReports(results[0]);
      } else {
        setStudents(results);
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectStudent = async (selected) => {
    try {
      setLoading(true);
      setStudent(selected);
      setStudents([]);
      setReports([]);
      setScores({});
      setRemarks({});
      setLockedReports({});
      await loadReports(selected);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (reportId, value) => {
    setScores((prev) => ({ ...prev, [reportId]: value }));
  };

  const handleRemarksChange = (reportId, value) => {
    setRemarks((prev) => ({ ...prev, [reportId]: value }));
  };

  const handleSubmit = async (reportId) => {
    const score = Number(scores[reportId]);
    if (isNaN(score) || score < 0 || score > 10) {
      return alert("Score must be between 0 and 10");
    }
    try {
      setLockedReports((prev) => ({ ...prev, [reportId]: true }));
      await API.post(`/college/reports/${reportId}/credits`, {
        facultyScore: score,
        remarks: remarks[reportId] || "",
      });
      alert("Score submitted. Credits assigned automatically.");
      handleSearch();
    } catch (err) {
      setLockedReports((prev) => ({ ...prev, [reportId]: false }));
      alert(err.response?.data?.message || "Failed");
    }
  };

  // UI Helper Classes
  const cardBase = "bg-[#FFFFFF] border-2 border-[#F5F6FA] rounded-[30px] shadow-xl shadow-[#6C5CE7]/5 p-6 transition-all duration-300";
  const labelHeader = "text-[11px] font-black text-[#2D3436] opacity-40 uppercase tracking-[0.2em]";

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#2D3436] font-['Nunito'] pb-12">
      <main className="max-w-7xl mx-auto w-full px-4 md:px-8 py-8 flex flex-col gap-10">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
          <div>
            <h1 className="text-[36px] font-black tracking-tight text-[#2D3436]">Credit Management</h1>
            <div className="flex items-center gap-3 mt-1">
               <span className="h-[2px] w-8 bg-[#6C5CE7]"></span>
               <p className="text-[#6C5CE7] font-black text-[12px] uppercase tracking-[0.25em]">Evaluation & Assignment</p>
            </div>
          </div>
        </header>

        {/* Search Bar Section */}
        <section className={`${cardBase} group hover:border-[#6C5CE7]/20`}>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search student by ABC ID or Name..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-6 pr-4 py-4 text-[15px] font-bold text-[#2D3436] bg-[#F5F6FA] border-2 border-transparent rounded-[22px] outline-none transition-all focus:border-[#6C5CE7] focus:bg-white placeholder:text-[#2D3436]/30"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-10 py-4 bg-[#6C5CE7] text-white text-[14px] font-black rounded-[22px] shadow-lg shadow-[#6C5CE7]/30 hover:-translate-y-1 active:translate-y-0 transition-all cursor-pointer uppercase tracking-widest"
            >
              {loading ? "Searching..." : "Search Student"}
            </button>
          </div>
        </section>

        {/* Multi-Result List */}
        {students.length > 1 && (
          <div className="animate-in zoom-in-95 duration-500 bg-[#F5F6FA] p-2 rounded-[35px]">
            <div className="bg-white rounded-[30px] overflow-hidden shadow-inner">
              <div className="px-8 py-4 bg-[#F5F6FA]/50">
                <p className={labelHeader}>{students.length} Candidates Found</p>
              </div>
              <ul className="divide-y-2 divide-[#F5F6FA]">
                {students.map((s) => (
                  <li
                    key={s._id}
                    onClick={() => handleSelectStudent(s)}
                    className="flex items-center gap-6 px-8 py-5 hover:bg-[#6C5CE7]/5 cursor-pointer transition-all group"
                  >
                    <div className="w-12 h-12 bg-[#6C5CE7] text-white rounded-2xl flex items-center justify-center text-[18px] font-black shadow-lg shadow-[#6C5CE7]/20 group-hover:scale-110 transition-transform">
                      {s.fullName?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div>
                      <p className="text-[16px] font-black text-[#2D3436]">{s.fullName}</p>
                      <p className="text-[11px] font-black text-[#6C5CE7] uppercase tracking-widest mt-0.5">
                        ABC ID: <span className="opacity-60">{s.abcId || "NOT LINKED"}</span>
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Active Student Profile */}
        {student && (
          <div className="animate-in slide-in-from-left-6 duration-500 bg-[#2D3436] p-8 rounded-[35px] flex items-center gap-6 shadow-2xl shadow-[#2D3436]/20">
            <div className="w-16 h-16 bg-[#6C5CE7] border-4 border-[#FFFFFF]/10 rounded-[24px] flex items-center justify-center text-[24px] font-black text-white shadow-xl">
              {student.fullName[0].toUpperCase()}
            </div>
            <div>
              <h2 className="text-[22px] font-black text-white leading-tight">
                {student.fullName}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-[#6C5CE7] animate-pulse"></span>
                <p className="text-[11px] font-black text-white/50 uppercase tracking-[0.2em]">
                   ABC ID: <span className="text-[#6C5CE7]">{student.abcId || "UNAVAILABLE"}</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Reports Table */}
        {reports.length > 0 ? (
          <div className="bg-[#F5F6FA] p-1 rounded-[40px] animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="bg-white rounded-[38px] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="bg-[#F5F6FA]/50">
                      <th className={`px-8 py-7 ${labelHeader}`}>Internship Title</th>
                      <th className={`px-8 py-7 ${labelHeader} text-center`}>Progress</th>
                      <th className={`px-8 py-7 ${labelHeader}`}>Score (0-10)</th>
                      <th className={`px-8 py-7 ${labelHeader} text-center`}>Credits</th>
                      <th className={`px-8 py-7 ${labelHeader}`}>Faculty Remarks</th>
                      <th className={`px-8 py-7 ${labelHeader} text-right`}>Execution</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-[#F5F6FA]">
                    {reports.map((r) => {
                      const isLocked = r.status === "faculty_approved" || lockedReports[r._id];
                      return (
                        <tr key={r._id} className="group hover:bg-[#F5F6FA]/30 transition-all">
                          <td className="px-8 py-6 text-[15px] font-black text-[#2D3436]">
                            {r.application?.internship?.title || "N/A"}
                          </td>
                          <td className="px-8 py-6 text-center">
                            <div className="inline-block px-4 py-1.5 bg-[#F5F6FA] group-hover:bg-white rounded-full text-[13px] font-black border-2 border-transparent group-hover:border-[#6C5CE7]/10 transition-all">
                              {r.completionRate || 0}%
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            {isLocked ? (
                              <span className="text-[16px] font-black text-[#6C5CE7]">{r.facultyScore}</span>
                            ) : (
                              <input
                                type="number"
                                min="0" max="10"
                                value={scores[r._id] || ""}
                                onChange={(e) => handleScoreChange(r._id, e.target.value)}
                                className="w-20 px-4 py-2 text-[14px] font-black text-[#2D3436] bg-[#F5F6FA] border-2 border-transparent rounded-xl outline-none focus:border-[#6C5CE7] focus:bg-white transition-all"
                              />
                            )}
                          </td>
                          <td className="px-8 py-6 text-center">
                            <span className="text-[15px] font-black text-[#008000] bg-[#008000]/5 px-4 py-1 rounded-lg">
                              {r.creditsEarned ?? "—"}
                            </span>
                          </td>
                          <td className="px-8 py-6">
                            {isLocked ? (
                              <span className="text-[13px] font-bold text-[#2D3436]/40 italic">
                                {r.facultyRemarks || "No remarks"}
                              </span>
                            ) : (
                              <input
                                type="text"
                                placeholder="Add professional feedback..."
                                value={remarks[r._id] || ""}
                                onChange={(e) => handleRemarksChange(r._id, e.target.value)}
                                className="w-full min-w-[220px] px-4 py-2 text-[13px] font-bold text-[#2D3436] bg-[#F5F6FA] border-2 border-transparent rounded-xl outline-none focus:border-[#6C5CE7] focus:bg-white transition-all"
                              />
                            )}
                          </td>
                          <td className="px-8 py-6 text-right">
                            {isLocked ? (
                              <span className="text-[10px] font-black uppercase tracking-widest text-[#008000] bg-[#008000]/10 px-4 py-2 rounded-xl">
                                Validated
                              </span>
                            ) : (
                              <button
                                onClick={() => handleSubmit(r._id)}
                                disabled={lockedReports[r._id]}
                                className="px-6 py-2.5 text-[11px] font-black text-white bg-[#2D3436] rounded-xl hover:bg-[#6C5CE7] hover:shadow-lg hover:shadow-[#6C5CE7]/20 transition-all uppercase tracking-widest disabled:opacity-20 cursor-pointer"
                              >
                                Submit
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          student && (
            <div className="bg-white border-4 border-dashed border-[#F5F6FA] rounded-[45px] p-20 text-center animate-in zoom-in duration-500">
              <div className="w-20 h-20 bg-[#F5F6FA] rounded-full flex items-center justify-center mx-auto mb-6 text-[30px]">📂</div>
              <p className="text-[15px] font-black text-[#2D3436] opacity-30 uppercase tracking-[0.2em]">
                No internship reports indexed
              </p>
            </div>
          )
        )}
      </main>
    </div>
  );
}