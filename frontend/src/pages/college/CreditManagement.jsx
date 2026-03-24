import { useState } from "react";
import API from "../../api/api";

export default function CreditManagement() {
  const [query, setQuery] = useState("");
  const [student, setStudent] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [scores, setScores] = useState({});
  const [remarks, setRemarks] = useState({});
  const [lockedReports, setLockedReports] = useState({});

  const handleSearch = async () => {
    if (!query.trim()) {
      alert("Enter ABC ID or Name");
      return;
    }

    try {
      setLoading(true);
      const res = await API.get(`/college/students/search?query=${query}`);
      const studentData = res.data.data;
      setStudent(studentData);

      const reportsRes = await API.get(
        `/college/students/${studentData._id}/reports`,
      );
      setReports(reportsRes.data.data);

      setScores({});
      setRemarks({});
      setLockedReports({});
    } catch (err) {
      alert(err.response?.data?.message || "Search failed");
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

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#333] font-sans pb-10">
      <main className="max-w-7xl mx-auto w-full px-4 md:px-6 py-6 flex flex-col gap-6">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#e5e5e5] pb-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-[23px] font-black text-[#333] m-0 tracking-tight leading-tight">
              Credit Management
            </h1>
            <p className="text-[13px] font-bold text-[#333] opacity-60 m-0 uppercase tracking-widest">
              Internship Evaluation & Credit Assignment
            </p>
          </div>
        </header>

        <div className="bg-[#fff] border border-[#e5e5e5] p-5 rounded-[20px] shadow-sm flex flex-col md:flex-row gap-3">
          <input
            type="text"
            placeholder="Search student by ABC ID or Name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 px-4 py-3 text-[13px] text-[#333] bg-[#fff] border border-[#e5e5e5] rounded-[14px] outline-none transition-colors focus:border-[#333]"
          />
          <button
            onClick={handleSearch}
            className="px-8 py-3 bg-[#111] text-[#fff] text-[13px] font-bold rounded-[14px] hover:opacity-80 transition-opacity cursor-pointer uppercase tracking-widest"
          >
            {loading ? "Searching..." : "Search Student"}
          </button>
        </div>

        {student && (
          <div className="bg-[#fff] border border-[#e5e5e5] p-5 rounded-[20px] shadow-sm flex items-center gap-5">
            <div className="w-12 h-12 bg-[#f9f9f9] border border-[#e5e5e5] rounded-full flex items-center justify-center text-[18px] font-black">
              {student.fullName[0].toUpperCase()}
            </div>
            <div>
              <h2 className="text-[17px] font-black text-[#333] m-0">
                {student.fullName}
              </h2>
              <p className="text-[12px] font-bold text-[#333] opacity-60 m-0 uppercase tracking-widest">
                ABC ID:{" "}
                <span className="text-[#111] opacity-100">
                  {student.abcId || "Not Linked"}
                </span>
              </p>
            </div>
          </div>
        )}

        {reports.length > 0 ? (
          <div className="bg-[#fff] border border-[#e5e5e5] rounded-[20px] shadow-sm overflow-hidden box-border">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead className="bg-[#f9f9f9] border-b border-[#e5e5e5]">
                  <tr>
                    <th className="px-5 py-3 text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                      Internship
                    </th>
                    <th className="px-5 py-3 text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest text-center">
                      Progress
                    </th>
                    <th className="px-5 py-3 text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                      Score (0-10)
                    </th>
                    <th className="px-5 py-3 text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest text-center">
                      Credits
                    </th>
                    <th className="px-5 py-3 text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                      Remarks
                    </th>
                    <th className="px-5 py-3 text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e5e5]">
                  {reports.map((r) => {
                    const isLocked =
                      r.facultyStatus === "approved" || lockedReports[r._id];

                    return (
                      <tr
                        key={r._id}
                        className="hover:bg-[#f9f9f9] transition-colors duration-200"
                      >
                        <td className="px-5 py-3 text-[13px] font-bold text-[#333]">
                          {r.application?.internship?.title || "N/A"}
                        </td>
                        <td className="px-5 py-3 text-center">
                          <span className="text-[13px] font-black text-[#111]">
                            {r.completionRate || 0}%
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          {isLocked ? (
                            <span className="text-[13px] font-black">
                              {r.facultyScore}
                            </span>
                          ) : (
                            <input
                              type="number"
                              min="0"
                              max="10"
                              value={scores[r._id] || ""}
                              onChange={(e) =>
                                handleScoreChange(r._id, e.target.value)
                              }
                              className="w-16 px-2 py-1.5 text-[13px] font-bold border border-[#e5e5e5] rounded-[8px] outline-none"
                            />
                          )}
                        </td>
                        <td className="px-5 py-3 text-center">
                          <span className="text-[13px] font-black text-[#008000]">
                            {r.creditsEarned ?? "—"}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          {isLocked ? (
                            <span className="text-[13px] text-[#333] opacity-70 italic">
                              {r.facultyRemarks || "No remarks"}
                            </span>
                          ) : (
                            <input
                              type="text"
                              placeholder="Add assessment..."
                              value={remarks[r._id] || ""}
                              onChange={(e) =>
                                handleRemarksChange(r._id, e.target.value)
                              }
                              className="w-full min-w-[200px] px-3 py-1.5 text-[12px] border border-[#e5e5e5] rounded-[8px] outline-none"
                            />
                          )}
                        </td>
                        <td className="px-5 py-3 text-right">
                          {isLocked ? (
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#008000] bg-[#008000]/10 px-2 py-1 rounded-[6px]">
                              Validated
                            </span>
                          ) : (
                            <button
                              onClick={() => handleSubmit(r._id)}
                              disabled={lockedReports[r._id]}
                              className="px-4 py-2 text-[11px] font-bold text-[#fff] bg-[#111] border-none rounded-[10px] hover:opacity-80 transition-opacity cursor-pointer uppercase tracking-widest disabled:opacity-30"
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
        ) : (
          student && (
            <div className="bg-[#fff] border-2 border-dashed border-[#e5e5e5] rounded-[20px] p-10 text-center">
              <p className="text-[13px] font-bold text-[#333] opacity-60 m-0">
                No internship reports available for this student.
              </p>
            </div>
          )
        )}
      </main>
    </div>
  );
}
