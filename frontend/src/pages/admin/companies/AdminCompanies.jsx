import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../../api/api";
import AdminNavBar from "../../../components/navbars/AdminNavBar";

export default function AdminCompanies() {
  const navigate = useNavigate();

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCompanies = async () => {
    try {
      const res = await API.get("/admin/companies");
      setCompanies(res.data?.data || []);
    } catch (err) {
      console.error("Fetch companies error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const toggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === "active" ? "inactive" : "active";

      await API.patch(`/admin/companies/${id}/status`, {
        status: newStatus,
      });

      fetchCompanies();
    } catch (err) {
      console.error(err);
      alert("Status update failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#f9f9f9] flex flex-col font-sans">
  
        <main className="flex-grow flex items-center justify-center">
          <p className="text-[#333] font-bold text-[14px] animate-pulse m-0">
            Loading Companies...
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#333] flex flex-col font-sans pb-10">


      <main className="max-w-7xl mx-auto w-full px-4 md:px-6 py-6 flex flex-col gap-6">
        <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-[#e5e5e5] pb-5">
          <div>
            <h1 className="text-[23px] font-black text-[#333] m-0 tracking-tight leading-tight">
              Companies
            </h1>
            <p className="text-[13px] font-bold text-[#333] opacity-60 m-0 mt-1 uppercase tracking-widest">
              Industry Partners
            </p>
          </div>
          <button
            onClick={() => navigate("/admin/companies/new")}
            className="px-6 py-2.5 text-[13px] font-bold text-[#fff] bg-[#111] border-none rounded-[14px] cursor-pointer hover:opacity-80 transition-opacity uppercase tracking-widest"
          >
            Add Company
          </button>
        </header>

        <div className="bg-[#fff] border border-[#e5e5e5] rounded-[20px] shadow-sm overflow-hidden box-border transition-all">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead className="bg-[#f9f9f9] border-b border-[#e5e5e5]">
                <tr>
                  <th className="px-5 py-3 text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                    Name
                  </th>
                  <th className="px-5 py-3 text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                    Industry
                  </th>
                  <th className="px-5 py-3 text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                    Website
                  </th>
                  <th className="px-5 py-3 text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                    Status
                  </th>
                  <th className="px-5 py-3 text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest text-center">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#e5e5e5]">
                {companies.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-5 py-10 text-center">
                      <p className="text-[13px] font-bold text-[#333] opacity-40 m-0">
                        No companies found
                      </p>
                    </td>
                  </tr>
                ) : (
                  companies.map((company) => (
                    <tr
                      key={company._id}
                      className="hover:bg-[#f9f9f9] transition-colors duration-200"
                    >
                      <td className="px-5 py-3 text-[13px] font-bold text-[#333]">
                        {company.name}
                      </td>

                      <td className="px-5 py-3 text-[13px] font-medium text-[#333] opacity-70">
                        {company.industry || "—"}
                      </td>

                      <td className="px-5 py-3">
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[13px] font-bold text-[#111] underline hover:opacity-70 transition-opacity"
                        >
                          {company.website ? "Visit Website" : "—"}
                        </a>
                      </td>

                      <td className="px-5 py-3">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-[10px] text-[10px] font-bold uppercase tracking-widest border ${
                            company.status === "active"
                              ? "bg-[#111] text-[#fff] border-[#111]"
                              : "bg-[#fff] text-[#cc0000] border-[#cc0000]"
                          }`}
                        >
                          {company.status}
                        </span>
                      </td>

                      <td className="px-5 py-3">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() =>
                              navigate(`/admin/companies/${company._id}`)
                            }
                            className="px-3 py-1.5 text-[11px] font-bold text-[#333] uppercase tracking-widest bg-[#f9f9f9] border border-[#e5e5e5] rounded-[10px] hover:border-[#333] transition-colors cursor-pointer"
                          >
                            View
                          </button>

                          <button
                            onClick={() =>
                              navigate(`/admin/companies/edit/${company._id}`)
                            }
                            className="px-3 py-1.5 text-[11px] font-bold text-[#fff] bg-[#111] border-none rounded-[10px] hover:opacity-80 transition-opacity cursor-pointer"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              toggleStatus(company._id, company.status)
                            }
                            className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest border rounded-[10px] transition-colors cursor-pointer ${
                              company.status === "active"
                                ? "bg-[#fff] border-[#cc0000] text-[#cc0000] hover:bg-[#cc0000] hover:text-[#fff]"
                                : "bg-[#f9f9f9] border-[#008000] text-[#008000] hover:bg-[#008000] hover:text-[#fff]"
                            }`}
                          >
                            {company.status === "active"
                              ? "Deactivate"
                              : "Activate"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
