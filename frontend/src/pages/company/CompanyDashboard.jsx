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
      setFiltered(internData); // default
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

    if (type === "all") {
      result = interns;
    } else if (type === "applications") {
      result = interns.filter((i) => ["applied", "pending"].includes(i.status));
    } else if (type === "interns") {
      result = interns.filter((i) => ["ongoing"].includes(i.status));
    } else if (type === "completed") {
      result = interns.filter((i) => i.status === "completed");
    } else if (type === "certificates") {
      result = interns.filter((i) => i.certificateUrl);
    }

    setFiltered(result);

    setTimeout(() => {
      tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  // ================= CERTIFICATE =================
  const issueCertificate = async (id, file) => {
    try {
      const formData = new FormData();
      formData.append("certificate", file);

      await API.post(`/company/applications/${id}/certificate`, formData);

      alert("Certificate issued successfully");
      fetchData();
    } catch (err) {
      alert("Error issuing certificate");
    }
  };

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f9f9f9]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#e5e5e5] border-t-[#111] rounded-full animate-spin"></div>
          <p className="text-[#111] font-bold tracking-widest uppercase text-[10px] animate-pulse m-0">
            Initializing Dashboard...
          </p>
        </div>
      </div>
    );
  }

  const cardBase =
    "bg-[#fff] border p-6 rounded-[24px] shadow-sm transition-all duration-300 cursor-pointer flex flex-col gap-2 hover:border-[#111] hover:-translate-y-1 hover:shadow-md";

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#111] font-sans pb-12">
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        {/* HEADER */}
        <header className="border-b border-[#e5e5e5] pb-6">
          <div className="text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-[0.2em] mb-2">
            Overview
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-[#111] m-0 tracking-tighter uppercase">
            Company Dashboard
          </h1>
        </header>

        {/* ================= CARDS ================= */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <div
            className={`${cardBase} ${view === "all" ? "border-[#111] shadow-md -translate-y-1" : "border-[#e5e5e5]"}`}
            onClick={() => handleView("all")}
          >
            <p className="text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-[0.15em] m-0">
              Total Postings
            </p>
            <h2 className="text-[32px] font-black text-[#111] m-0 leading-none">
              {data.totalInternships}
            </h2>
          </div>

          <div
            className={`${cardBase} ${view === "applications" ? "border-[#111] shadow-md -translate-y-1" : "border-[#e5e5e5]"}`}
            onClick={() => handleView("applications")}
          >
            <p className="text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-[0.15em] m-0">
              Applications
            </p>
            <h2 className="text-[32px] font-black text-[#111] m-0 leading-none">
              {data.totalApplications}
            </h2>
          </div>

          <div
            className={`${cardBase} ${view === "interns" ? "border-[#111] shadow-md -translate-y-1" : "border-[#e5e5e5]"}`}
            onClick={() => handleView("interns")}
          >
            <p className="text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-[0.15em] m-0">
              Active Interns
            </p>
            <h2 className="text-[32px] font-black text-[#1d4ed8] m-0 leading-none">
              {data.totalInterns}
            </h2>
          </div>

          <div
            className={`${cardBase} ${view === "mentors" ? "border-[#111] shadow-md -translate-y-1" : "border-[#e5e5e5]"}`}
            onClick={() => {
              setView("mentors");
              setTimeout(
                () =>
                  tableRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  }),
                100,
              );
            }}
          >
            <p className="text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-[0.15em] m-0">
              Mentors
            </p>
            <h2 className="text-[32px] font-black text-[#111] m-0 leading-none">
              {data.totalMentors}
            </h2>
          </div>

          <div
            className={`${cardBase} ${view === "completed" ? "border-[#111] shadow-md -translate-y-1" : "border-[#e5e5e5]"}`}
            onClick={() => handleView("completed")}
          >
            <p className="text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-[0.15em] m-0">
              Completed
            </p>
            <h2 className="text-[32px] font-black text-[#166534] m-0 leading-none">
              {data.completedInternships}
            </h2>
          </div>

          <div
            className={`${cardBase} ${view === "certificates" ? "border-[#111] shadow-md -translate-y-1" : "border-[#e5e5e5]"}`}
            onClick={() => handleView("certificates")}
          >
            <p className="text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-[0.15em] m-0">
              Certificates
            </p>
            <h2 className="text-[32px] font-black text-[#111] m-0 leading-none">
              {data.certificatesIssued}
            </h2>
          </div>
        </div>

        {/* ================= TABLE ================= */}
        <div
          ref={tableRef}
          className="bg-[#fff] border border-[#e5e5e5] p-8 rounded-[24px] shadow-sm scroll-mt-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[12px] font-black text-[#111] uppercase tracking-widest border-l-4 border-[#111] pl-3 m-0">
              {view === "all" ? "All Interns" : view} Data
            </h2>
            <div className="text-[10px] font-bold bg-[#f9f9f9] border border-[#e5e5e5] px-3 py-1.5 rounded-[8px] uppercase tracking-widest text-[#555]">
              Viewing: {view}
            </div>
          </div>

          <div className="overflow-x-auto rounded-[14px] border border-[#e5e5e5]">
            {view === "mentors" ? (
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead className="bg-[#f9f9f9] border-b border-[#e5e5e5]">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                      Name
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                      Email
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                      Department
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e5e5]">
                  {mentors.length === 0 ? (
                    <tr>
                      <td
                        colSpan="3"
                        className="px-6 py-12 text-center text-[12px] font-bold text-[#999] uppercase tracking-widest"
                      >
                        No Mentors Found
                      </td>
                    </tr>
                  ) : (
                    mentors.map((m) => (
                      <tr
                        key={m._id}
                        className="hover:bg-[#fcfcfc] transition-colors group"
                      >
                        <td className="px-6 py-4 text-[13px] font-black text-[#111]">
                          {m.fullName || "—"}
                        </td>
                        <td className="px-6 py-4 text-[13px] font-medium text-[#555]">
                          {m.user?.email || "—"}
                        </td>
                        <td className="px-6 py-4 text-[13px] font-bold text-[#111]">
                          {m.department || "N/A"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead className="bg-[#f9f9f9] border-b border-[#e5e5e5]">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                      Student
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                      Internship
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                      Status
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-widest text-right">
                      Certificate
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#e5e5e5]">
                  {filtered.length === 0 ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="px-6 py-12 text-center text-[12px] font-bold text-[#999] uppercase tracking-widest"
                      >
                        No Data Found
                      </td>
                    </tr>
                  ) : (
                    filtered.map((i) => (
                      <tr
                        key={i.applicationId || i._id}
                        className="hover:bg-[#fcfcfc] cursor-pointer transition-colors group"
                        onClick={() => setSelectedIntern(i)}
                      >
                        <td className="px-6 py-4 text-[13px] font-black text-[#111] group-hover:underline">
                          {i.student?.fullName || i.studentName || "—"}
                        </td>
                        <td className="px-6 py-4 text-[13px] font-medium text-[#555]">
                          {i.internship?.title || i.internshipTitle || "—"}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-[6px] text-[9px] font-bold uppercase tracking-widest border ${
                              i.status === "completed"
                                ? "bg-[#f0fdf4] text-[#166534] border-[#bbf7d0]"
                                : i.status === "ongoing"
                                  ? "bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe]"
                                  : i.status === "pending" ||
                                      i.status === "applied"
                                    ? "bg-[#fef2f2] text-[#991b1b] border-[#fecaca]"
                                    : "bg-[#f9f9f9] text-[#555] border-[#e5e5e5]"
                            }`}
                          >
                            {i.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span
                            className={`text-[10px] font-black uppercase tracking-widest ${i.certificateUrl ? "text-[#166534]" : "text-[#999]"}`}
                          >
                            {i.certificateUrl ? "Issued" : "Not Issued"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* ================= MODAL ================= */}
      {selectedIntern && (
        <div className="fixed inset-0 bg-[#111]/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-[#fff] p-8 rounded-[24px] w-full max-w-md shadow-2xl border border-[#e5e5e5]">
            <div className="flex justify-between items-start border-b border-[#e5e5e5] pb-4 mb-6">
              <h2 className="text-[18px] font-black text-[#111] m-0 uppercase tracking-tighter">
                Intern Details
              </h2>
              <button
                onClick={() => setSelectedIntern(null)}
                className="text-[10px] font-bold text-[#999] hover:text-[#111] uppercase tracking-widest bg-transparent border-none cursor-pointer outline-none"
              >
                Close
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-[#999] uppercase tracking-widest">
                  Name
                </span>
                <span className="text-[14px] font-black text-[#111]">
                  {selectedIntern.student?.fullName ||
                    selectedIntern.studentName ||
                    "—"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-[#999] uppercase tracking-widest">
                  Email
                </span>
                <span className="text-[13px] font-medium text-[#555] break-all">
                  {selectedIntern.student?.email ||
                    selectedIntern.studentEmail ||
                    "—"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-[#999] uppercase tracking-widest">
                  Status
                </span>
                <span
                  className={`text-[12px] font-black uppercase tracking-widest ${
                    selectedIntern.status === "completed"
                      ? "text-[#166534]"
                      : selectedIntern.status === "ongoing"
                        ? "text-[#1d4ed8]"
                        : "text-[#b45309]"
                  }`}
                >
                  {selectedIntern.status}
                </span>
              </div>

              {selectedIntern.certificateUrl && (
                <div className="flex flex-col mt-2">
                  <span className="text-[10px] font-bold text-[#999] uppercase tracking-widest mb-1">
                    Certificate
                  </span>
                  <a
                    href={selectedIntern.certificateUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-[11px] font-black text-[#111] uppercase tracking-[0.15em] hover:underline transition-all group/link"
                  >
                    <svg
                      className="w-4 h-4 transition-transform group-hover/link:-translate-y-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    View Certificate
                  </a>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedIntern(null)}
              className="mt-8 w-full bg-[#111] text-[#fff] font-black text-[10px] uppercase tracking-[0.15em] px-4 py-3.5 rounded-[12px] hover:bg-[#333] transition-colors outline-none cursor-pointer border-none"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyDashboard;
