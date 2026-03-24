import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../../api/api";

export default function AdminColleges() {
  const navigate = useNavigate();

  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchColleges = async () => {
    try {
      const res = await API.get("/admin/colleges");
      setColleges(res.data?.data || []);
    } catch (err) {
      console.error("Fetch colleges error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColleges();
  }, []);

  const toggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === "active" ? "inactive" : "active";

      await API.patch(`/admin/colleges/${id}/status`, {
        status: newStatus,
      });

      fetchColleges();
    } catch (err) {
      console.error(err);
      alert("Status update failed");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f9f9f9]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#e5e5e5] border-t-[#111] rounded-full animate-spin"></div>
          <p className="text-[#111] font-bold tracking-widest uppercase text-[10px] animate-pulse m-0">
            Loading Colleges
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9] p-4 md:p-8 font-sans text-[#111]">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-6 mb-10 border-b border-[#e5e5e5] pb-6">
          <h2 className="text-3xl md:text-4xl font-black m-0 tracking-tight text-[#111] uppercase">
            Colleges
          </h2>
          <button
            onClick={() => navigate("/admin/colleges/new")}
            className="px-8 py-3.5 text-[11px] font-black text-[#fff] bg-[#111] border border-[#111] rounded-[14px] cursor-pointer transition-all duration-300 hover:bg-[#333] hover:border-[#333] hover:-translate-y-0.5 whitespace-nowrap uppercase tracking-[0.15em]"
          >
            Add College
          </button>
        </header>

        <div className="bg-[#fff] border border-[#e5e5e5] rounded-[24px] shadow-sm overflow-hidden box-border transition-all duration-300 hover:border-[#ccc]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead className="bg-[#f9f9f9] border-b border-[#e5e5e5]">
                <tr>
                  <th className="px-6 py-5 text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                    Name
                  </th>
                  <th className="px-6 py-5 text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                    Email Domain
                  </th>
                  <th className="px-6 py-5 text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                    Website
                  </th>
                  <th className="px-6 py-5 text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                    Status
                  </th>
                  <th className="px-6 py-5 text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#e5e5e5]">
                {colleges.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-12 text-center text-sm font-medium text-[#999]"
                    >
                      No colleges found
                    </td>
                  </tr>
                )}

                {colleges.map((college) => (
                  <tr
                    key={college._id}
                    className="hover:bg-[#fcfcfc] transition-colors duration-300 group"
                  >
                    <td className="px-6 py-5 text-[13px] font-bold text-[#111] transition-colors">
                      {college.name}
                    </td>

                    <td className="px-6 py-5 text-[13px] text-[#555] font-medium">
                      {college.emailDomain || "—"}
                    </td>

                    <td className="px-6 py-5 text-[13px] text-[#555] font-medium tracking-wide">
                      {college.website || "—"}
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-[6px] text-[10px] font-bold uppercase tracking-widest border ${
                          college.status === "active"
                            ? "bg-[#f0fdf4] text-[#166534] border-[#bbf7d0]"
                            : "bg-[#fef2f2] text-[#991b1b] border-[#fecaca]"
                        }`}
                      >
                        {college.status}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            navigate(`/admin/colleges/${college._id}`)
                          }
                          className="px-4 py-2 text-[10px] font-bold tracking-widest uppercase text-[#111] bg-[#fff] border border-[#e5e5e5] rounded-[10px] hover:bg-[#f9f9f9] hover:border-[#ccc] transition-all duration-300 cursor-pointer hover:-translate-y-0.5 outline-none"
                        >
                          View
                        </button>

                        <button
                          onClick={() =>
                            navigate(`/admin/colleges/edit/${college._id}`)
                          }
                          className="px-4 py-2 text-[10px] font-bold tracking-widest uppercase text-[#fff] bg-[#111] border border-[#111] rounded-[10px] transition-all duration-300 cursor-pointer hover:bg-[#333] hover:border-[#333] hover:-translate-y-0.5 outline-none"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            toggleStatus(college._id, college.status)
                          }
                          className={`px-4 py-2 text-[10px] font-bold tracking-widest uppercase rounded-[10px] border transition-all duration-300 cursor-pointer hover:-translate-y-0.5 outline-none ${
                            college.status === "active"
                              ? "bg-[#fff] border-[#fecaca] text-[#991b1b] hover:bg-[#fef2f2]"
                              : "bg-[#fff] border-[#bbf7d0] text-[#166534] hover:bg-[#f0fdf4]"
                          }`}
                        >
                          {college.status === "active"
                            ? "Deactivate"
                            : "Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
