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

// ================= SEARCH =================
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
    `/college/students/${studentData._id}/reports`
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

// ================= INPUT HANDLERS =================
const handleScoreChange = (reportId, value) => {
setScores(prev => ({ ...prev, [reportId]: value }));
};

const handleRemarksChange = (reportId, value) => {
setRemarks(prev => ({ ...prev, [reportId]: value }));
};

// ================= SUBMIT =================
const handleSubmit = async (reportId) => {

const score = Number(scores[reportId]);

if (isNaN(score) || score < 0 || score > 10) {
  return alert("Score must be between 0 and 10");
}

try {
  setLockedReports(prev => ({ ...prev, [reportId]: true }));

  await API.post(`/college/reports/${reportId}/credits`, {
    facultyScore: score,
    remarks: remarks[reportId] || ""
  });

  alert("Score submitted. Credits assigned automatically.");

  handleSearch();

} catch (err) {
  setLockedReports(prev => ({ ...prev, [reportId]: false }));
  alert(err.response?.data?.message || "Failed");
}

};

return ( <div className="max-w-6xl mx-auto p-8">

  {/* ================= HEADER ================= */}
  <h1 className="text-xl font-semibold mb-4">
    Internship Evaluation & Credit Assignment
  </h1>

  <p className="text-sm text-gray-600 mb-6">
    Faculty assigns score. Credits are automatically granted based on course.
  </p>

  {/* ================= SEARCH ================= */}
  <div className="mb-6 flex gap-3">

    <input
      type="text"
      placeholder="Enter ABC ID or Name"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      className="border p-2 flex-1"
    />

    <button
      onClick={handleSearch}
      className="px-4 py-2 bg-blue-600 text-white rounded"
    >
      {loading ? "Searching..." : "Search"}
    </button>

  </div>

  {/* ================= STUDENT ================= */}
  {student && (
    <div className="mb-6 p-4 border rounded bg-gray-50">

      <div className="font-semibold text-lg">
        {student.fullName}
      </div>

      <div className="text-sm text-gray-600">
        ABC ID: {student.abcId}
      </div>

    </div>
  )}

  {/* ================= TABLE ================= */}
  {reports.length > 0 && (

    <table className="w-full border text-sm">

      <thead className="bg-gray-100">
        <tr>
          <th className="p-2 border">Internship</th>
          <th className="p-2 border">Completion %</th>
          <th className="p-2 border">Score (0–10)</th>
          <th className="p-2 border">Credits</th>
          <th className="p-2 border">Remarks</th>
          <th className="p-2 border">Action</th>
        </tr>
      </thead>

      <tbody>

        {reports.map((r) => {

          const isLocked =
            r.facultyStatus === "approved" || lockedReports[r._id];

          return (
            <tr key={r._id}>

              {/* Internship */}
              <td className="border p-2">
                {r.application?.internship?.title || "N/A"}
              </td>

              {/* Completion */}
              <td className="border p-2">
                {r.completionRate || 0}%
              </td>

              {/* Score */}
              <td className="border p-2">
                {isLocked ? (
                  <span className="font-medium">
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
                    className="border p-1 w-20"
                  />
                )}
              </td>

              {/* Credits (READ ONLY) */}
              <td className="border p-2 font-semibold text-green-600">
                {r.creditsEarned ?? "-"}
              </td>

              {/* Remarks */}
              <td className="border p-2">
                {isLocked ? (
                  <span>{r.facultyRemarks || "-"}</span>
                ) : (
                  <input
                    type="text"
                    placeholder="Optional remarks"
                    value={remarks[r._id] || ""}
                    onChange={(e) =>
                      handleRemarksChange(r._id, e.target.value)
                    }
                    className="border p-1 w-full"
                  />
                )}
              </td>

              {/* Action */}
              <td className="border p-2">
                {isLocked ? (
                  <span className="text-green-600 font-medium">
                    Locked
                  </span>
                ) : (
                  <button
                    onClick={() => handleSubmit(r._id)}
                    disabled={lockedReports[r._id]}
                    className={`px-3 py-1 rounded text-white ${
                      lockedReports[r._id]
                        ? "bg-gray-400"
                        : "bg-green-600"
                    }`}
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

  )}

</div>

);
}
