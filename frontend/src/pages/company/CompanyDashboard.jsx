import { useEffect, useState, useRef } from "react";
import API from "../../api/api";
import CompanyNavBar from "../../components/navbars/CompanyNavBar";

const CompanyDashboard = () => {
  const [data, setData] = useState(null);
  const [interns, setInterns] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [view, setView] = useState("all");
  const [selectedIntern, setSelectedIntern] = useState(null);

  const tableRef = useRef(null);

  // ================= FETCH =================
  const fetchData = async () => {
    try {
      const [dashboardRes, internsRes, mentorsRes] = await Promise.all([
        API.get("/company/dashboard"),
        API.get("/company/interns"),
        API.get("/company/mentors"),
      ]);

      const internData = internsRes.data.data || [];
      setData(dashboardRes.data.data);
      setInterns(internData);
      setMentors(mentorsRes.data.data);
      setFiltered(internData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ================= FILTER =================
  const handleView = (type) => {
    setView(type);
    let result = interns;
    if (type === "all") result = interns;
    else if (type === "applications") result = interns.filter((i) => ["applied", "pending"].includes(i.status));
    else if (type === "interns") result = interns.filter((i) => ["ongoing"].includes(i.status));
    else if (type === "completed") result = interns.filter((i) => i.status === "completed");
    else if (type === "certificates") result = interns.filter((i) => i.certificateUrl);

    setFiltered(result);
    setTimeout(() => {
      tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  // ================= LOADING STATE =================
  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FFFFFF] font-['Nunito']">
        <div className="flex flex-col items-center gap-4 animate-in fade-in duration-700">
          <div className="w-12 h-12 border-4 border-[#F5F6FA] border-t-[#6C5CE7] rounded-full animate-spin"></div>
          <p className="text-[#2D3436] font-bold tracking-widest uppercase text-xs animate-pulse">
            Initializing Dashboard...
          </p>
        </div>
      </div>
    );
  }

  const cardBase = "bg-[#FFFFFF] border p-6 rounded-[24px] transition-all duration-300 cursor-pointer flex flex-col gap-2 hover:-translate-y-2";

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#2D3436] font-['Nunito'] pb-12 transition-colors duration-500">
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-10">
        
        {/* HEADER */}
        <header className="border-b border-[#F5F6FA] pb-8 animate-in slide-in-from-top duration-700">
          <div className="text-[12px] font-extrabold text-[#6C5CE7] opacity-80 uppercase tracking-[0.3em] mb-3">
            Corporate Analytics
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[#2D3436] m-0 tracking-tight uppercase">
            Company <span className="text-[#6C5CE7]">Dashboard</span>
          </h1>
        </header>

        {/* ================= STATS CARDS ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {[
            { label: "Total Postings", key: "totalInternships", type: "all", color: "#2D3436" },
            { label: "Applications", key: "totalApplications", type: "applications", color: "#2D3436" },
            { label: "Active Interns", key: "totalInterns", type: "interns", color: "#1d4ed8" },
            { label: "Mentors", key: "totalMentors", type: "mentors", color: "#2D3436" },
            { label: "Completed", key: "completedInternships", type: "completed", color: "#166534" },
            { label: "Certificates", key: "certificatesIssued", type: "certificates", color: "#6C5CE7" },
          ].map((stat, idx) => (
            <div
              key={stat.type}
              style={{ animationDelay: `${idx * 100}ms` }}
              className={`${cardBase} animate-in zoom-in-95 duration-500 ${
                view === stat.type 
                ? "border-[#6C5CE7] shadow-[0_10px_25px_-5px_rgba(108,92,231,0.2)] ring-1 ring-[#6C5CE7]" 
                : "border-[#F5F6FA] bg-[#F5F6FA]/50 hover:bg-[#FFFFFF] hover:shadow-xl hover:border-[#6C5CE7]/30"
              }`}
              onClick={() => stat.type === "mentors" ? (setView("mentors"), setTimeout(() => tableRef.current?.scrollIntoView({ behavior: "smooth" }), 100)) : handleView(stat.type)}
            >
              <p className="text-[10px] font-bold text-[#2D3436] opacity-50 uppercase tracking-[0.15em] m-0">
                {stat.label}
              </p>
              <h2 className="text-[34px] font-black m-0 leading-none tracking-tighter" style={{ color: stat.color }}>
                {stat.type === "mentors" ? data.totalMentors : (stat.type === "all" ? data.totalInternships : data[stat.key])}
              </h2>
            </div>
          ))}
        </div>

        {/* ================= TABLE SECTION ================= */}
        <div
          ref={tableRef}
          className="bg-[#FFFFFF] border border-[#F5F6FA] p-6 md:p-10 rounded-[32px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] scroll-mt-10 animate-in fade-in slide-in-from-bottom-5 duration-1000"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <h2 className="text-[14px] font-black text-[#2D3436] uppercase tracking-[0.2em] border-l-4 border-[#6C5CE7] pl-4 m-0">
              {view === "all" ? "Master Database" : `${view} Overview`}
            </h2>
            <div className="text-[11px] font-bold bg-[#F5F6FA] text-[#6C5CE7] border border-[#6C5CE7]/10 px-4 py-2 rounded-full uppercase tracking-widest shadow-sm">
              Current View: <span className="text-[#2D3436]">{view}</span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-[20px] border border-[#F5F6FA]">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#F5F6FA] border-b border-[#F5F6FA]">
                <tr>
                  {view === "mentors" ? (
                    <>
                      {["Name", "Email", "Department"].map(h => (
                        <th key={h} className="px-8 py-5 text-[11px] font-extrabold text-[#2D3436] opacity-60 uppercase tracking-widest">{h}</th>
                      ))}
                    </>
                  ) : (
                    <>
                      {["Student", "Internship", "Status", "Certificate"].map((h, i) => (
                        <th key={h} className={`px-8 py-5 text-[11px] font-extrabold text-[#2D3436] opacity-60 uppercase tracking-widest ${i === 3 ? "text-right" : ""}`}>{h}</th>
                      ))}
                    </>
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-[#F5F6FA]">
                {(view === "mentors" ? mentors : filtered).length === 0 ? (
                  <tr>
                    <td colSpan="100%" className="px-8 py-20 text-center text-[13px] font-bold text-[#2D3436] opacity-30 uppercase tracking-[0.2em]">
                      No records found in this category
                    </td>
                  </tr>
                ) : (
                  (view === "mentors" ? mentors : filtered).map((item, idx) => (
                    <tr
                      key={item._id || idx}
                      onClick={() => view !== "mentors" && setSelectedIntern(item)}
                      className={`transition-all duration-200 hover:bg-[#F5F6FA]/40 group ${view !== "mentors" ? "cursor-pointer" : ""}`}
                    >
                      {view === "mentors" ? (
                        <>
                          <td className="px-8 py-5 text-[14px] font-black text-[#2D3436] group-hover:text-[#6C5CE7]">{item.fullName || "—"}</td>
                          <td className="px-8 py-5 text-[14px] font-medium text-[#2D3436]/70">{item.user?.email || "—"}</td>
                          <td className="px-8 py-5 text-[14px] font-bold text-[#2D3436]">{item.department || "N/A"}</td>
                        </>
                      ) : (
                        <>
                          <td className="px-8 py-5 text-[14px] font-black text-[#2D3436] group-hover:text-[#6C5CE7] transition-colors">{item.student?.fullName || item.studentName || "—"}</td>
                          <td className="px-8 py-5 text-[14px] font-medium text-[#2D3436]/70">{item.internship?.title || item.internshipTitle || "—"}</td>
                          <td className="px-8 py-5">
                            <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter border ${
                              item.status === "completed" ? "bg-[#f0fdf4] text-[#166534] border-[#bbf7d0]" :
                              item.status === "ongoing" ? "bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe]" :
                              "bg-[#fef2f2] text-[#991b1b] border-[#fecaca]"
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <span className={`text-[11px] font-black uppercase tracking-widest ${item.certificateUrl ? "text-[#166534]" : "text-[#2D3436] opacity-30"}`}>
                              {item.certificateUrl ? "● Issued" : "Pending"}
                            </span>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ================= MODAL ================= */}
      {selectedIntern && (
        <div className="fixed inset-0 bg-[#2D3436]/60 backdrop-blur-md flex justify-center items-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-[#FFFFFF] p-10 rounded-[40px] w-full max-w-md shadow-2xl border border-[#F5F6FA] animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
            <div className="flex justify-between items-start border-b border-[#F5F6FA] pb-6 mb-8">
              <h2 className="text-2xl font-black text-[#2D3436] m-0 uppercase tracking-tighter">
                Profile <span className="text-[#6C5CE7]">Brief</span>
              </h2>
              <button
                onClick={() => setSelectedIntern(null)}
                className="p-2 hover:bg-[#F5F6FA] rounded-full transition-colors group"
              >
                <svg className="w-5 h-5 text-[#2D3436]/40 group-hover:text-[#6C5CE7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {[
                { label: "Full Name", value: selectedIntern.student?.fullName || selectedIntern.studentName, bold: true },
                { label: "Official Email", value: selectedIntern.student?.email || selectedIntern.studentEmail, bold: false },
                { label: "Status", value: selectedIntern.status, isStatus: true }
              ].map((field, i) => (
                <div key={i} className="flex flex-col">
                  <span className="text-[10px] font-extrabold text-[#6C5CE7] uppercase tracking-[0.2em] mb-1">{field.label}</span>
                  <span className={`text-[15px] ${field.bold ? "font-black text-[#2D3436]" : "font-semibold text-[#2D3436]/70"} ${field.isStatus ? "uppercase tracking-widest text-[#1d4ed8]" : ""}`}>
                    {field.value || "—"}
                  </span>
                </div>
              ))}

              {selectedIntern.certificateUrl && (
                <div className="pt-4 border-t border-[#F5F6FA]">
                  <a
                    href={selectedIntern.certificateUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-3 w-full bg-[#F5F6FA] text-[#6C5CE7] font-black text-[12px] uppercase tracking-widest px-6 py-4 rounded-[18px] hover:bg-[#6C5CE7] hover:text-[#FFFFFF] transition-all duration-300 shadow-sm"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Verify Certificate
                  </a>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedIntern(null)}
              className="mt-8 w-full bg-[#2D3436] text-[#FFFFFF] font-black text-[11px] uppercase tracking-[0.2em] px-4 py-4 rounded-[20px] hover:bg-[#6C5CE7] hover:shadow-lg hover:shadow-[#6C5CE7]/30 transition-all duration-300 shadow-md"
            >
              Close Record
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyDashboard;