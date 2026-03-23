import { useEffect, useState } from "react";
import API from "../../api/api";

export default function StudentCredits() {

  const [data, setData] = useState(null);

 

  const fetchCredits = async () => {
    try {
      const res = await API.get("/students/credits");
      setData(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

   useEffect(() => {
    fetchCredits();
  }, []);

  if (!data) {
    return <div className="p-10">Loading credits...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-8">

      {/* TOTAL */}
      <div className="bg-blue-600 text-white p-6 rounded-xl mb-6 text-center">
        <h2 className="text-xl font-semibold">Total Credits Earned</h2>
        <div className="text-3xl font-bold mt-2">
          {data.totalCredits}
        </div>
      </div>

      {/* BREAKDOWN */}
      <h3 className="text-lg font-semibold mb-4">
        Internship Breakdown
      </h3>

      <table className="w-full border text-sm">

        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Internship</th>
            <th className="p-2 border">Score</th>
            <th className="p-2 border">Credits</th>
            <th className="p-2 border">Completion %</th>
          </tr>
        </thead>

        <tbody>
          {data.internships.map((i, index) => (
            <tr key={index}>
              <td className="border p-2">{i.internshipTitle}</td>
              <td className="border p-2">{i.facultyScore}</td>
              <td className="border p-2">{i.creditsEarned}</td>
              <td className="border p-2">{i.completionRate}%</td>
            </tr>
          ))}
        </tbody>

      </table>

    </div>
  );
}