import React, { useEffect, useState, useRef } from "react";
import MentorNavBar from "../../components/navbars/MentorNavBar";
import API from "../../api/api";

const MentorDashboard = () => {
  const [interns, setInterns] = useState([]);
  const [selectedIntern, setSelectedIntern] = useState(null);

  const tableRef = useRef(null);

  // ================= FETCH =================
  const fetchData = async () => {
    try {
      const res = await API.get("/mentor/interns");
      setInterns(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ================= STATS =================
  const total = interns.length;

  const ongoing = interns.filter((i) => i.status === "ongoing").length;
  const completed = interns.filter((i) => i.status === "completed").length;
  const accepted = interns.filter((i) => i.status === "offer_accepted").length;

  // ================= SCROLL =================
  const scrollToTable = () => {
    setTimeout(() => {
      tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  // ================= UPDATE STATUS =================
  const updateStatus = async (id, status) => {
    try {
      await API.patch(`/mentor/interns/${id}/status`, { status });
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#111] font-sans pb-12">
      <MentorNavBar />

      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        {/* HEADER */}
        <header className="border-b border-[#e5e5e5] pb-6">
          <div className="text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-[0.2em] mb-2">
            Overview
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-[#111] m-0 tracking-tighter uppercase">
            Mentor Dashboard
          </h1>
        </header>

        {/* ================= STATS ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            onClick={scrollToTable}
            className="bg-[#fff] border border-[#e5e5e5] p-8 rounded-[24px] shadow-sm transition-all duration-300 cursor-pointer flex flex-col gap-2 hover:border-[#111] hover:-translate-y-1 hover:shadow-md"
          >
            <p className="text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-[0.15em] m-0">
              Total Interns
            </p>
            <h2 className="text-[40px] font-black text-[#111] m-0 leading-none">
              {total}
            </h2>
          </div>

          <div
            onClick={scrollToTable}
            className="bg-[#fff] border border-[#e5e5e5] p-8 rounded-[24px] shadow-sm transition-all duration-300 cursor-pointer flex flex-col gap-2 hover:border-[#111] hover:-translate-y-1 hover:shadow-md"
          >
            <p className="text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-[0.15em] m-0">
              Accepted
            </p>
            <h2 className="text-[40px] font-black text-[#111] m-0 leading-none">
              {accepted}
            </h2>
          </div>

          <div
            onClick={scrollToTable}
            className="bg-[#fff] border border-[#e5e5e5] p-8 rounded-[24px] shadow-sm transition-all duration-300 cursor-pointer flex flex-col gap-2 hover:border-[#111] hover:-translate-y-1 hover:shadow-md"
          >
            <p className="text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-[0.15em] m-0">
              Ongoing
            </p>
            <h2 className="text-[40px] font-black text-[#1d4ed8] m-0 leading-none">
              {ongoing}
            </h2>
          </div>

          <div
            onClick={scrollToTable}
            className="bg-[#fff] border border-[#e5e5e5] p-8 rounded-[24px] shadow-sm transition-all duration-300 cursor-pointer flex flex-col gap-2 hover:border-[#111] hover:-translate-y-1 hover:shadow-md"
          >
            <p className="text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-[0.15em] m-0">
              Completed
            </p>
            <h2 className="text-[40px] font-black text-[#166534] m-0 leading-none">
              {completed}
            </h2>
          </div>
        </div>

        {/* ================= TABLE ================= */}
        <div
          ref={tableRef}
          className="bg-[#fff] border border-[#e5e5e5] p-8 rounded-[24px] shadow-sm scroll-mt-6"
        >
          <h2 className="text-[12px] font-black text-[#111] uppercase tracking-widest border-l-4 border-[#111] pl-3 m-0 mb-6">
            Interns List
          </h2>

          <div className="overflow-x-auto rounded-[14px] border border-[#e5e5e5]">
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
                    Mode
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                    Location
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                    Status
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#e5e5e5]">
                {interns.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-12 text-center text-[12px] font-bold text-[#999] uppercase tracking-widest"
                    >
                      No Interns Found
                    </td>
                  </tr>
                ) : (
                  interns.map((i) => (
                    <tr
                      key={i.applicationId}
                      className="hover:bg-[#fcfcfc] transition-colors group"
                    >
                      <td
                        className="px-6 py-4 cursor-pointer"
                        onClick={() => setSelectedIntern(i)}
                      >
                        <div className="text-[13px] font-black text-[#111] group-hover:underline">
                          {i.studentName}
                        </div>
                        <div className="text-[11px] font-bold text-[#555] mt-0.5">
                          {i.studentEmail}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-[13px] font-medium text-[#555]">
                        {i.internshipTitle}
                      </td>
                      <td className="px-6 py-4 text-[13px] font-bold text-[#111]">
                        {i.mode}
                      </td>
                      <td className="px-6 py-4 text-[13px] font-medium text-[#555]">
                        {i.location}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-[6px] text-[9px] font-bold uppercase tracking-widest border ${
                            i.status === "completed"
                              ? "bg-[#f0fdf4] text-[#166534] border-[#bbf7d0]"
                              : i.status === "ongoing"
                                ? "bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe]"
                                : "bg-[#fffbeb] text-[#b45309] border-[#fde68a]"
                          }`}
                        >
                          {i.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 space-x-2">
                        {i.status === "offer_accepted" && (
                          <button
                            onClick={() =>
                              updateStatus(i.applicationId, "ongoing")
                            }
                            className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#fff] bg-[#111] border border-[#111] rounded-[8px] hover:bg-[#333] transition-all outline-none cursor-pointer"
                          >
                            Start
                          </button>
                        )}

                        {i.status === "ongoing" && (
                          <button
                            onClick={() =>
                              updateStatus(i.applicationId, "completed")
                            }
                            className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#fff] bg-[#111] border border-[#111] rounded-[8px] hover:bg-[#333] transition-all outline-none cursor-pointer"
                          >
                            Complete
                          </button>
                        )}
                      </td>
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
                  {selectedIntern.studentName || "N/A"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-[#999] uppercase tracking-widest">
                  Email
                </span>
                <span className="text-[13px] font-medium text-[#555]">
                  {selectedIntern.studentEmail || "N/A"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-[#999] uppercase tracking-widest">
                  Internship
                </span>
                <span className="text-[13px] font-medium text-[#111]">
                  {selectedIntern.internshipTitle || "N/A"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-[#999] uppercase tracking-widest">
                  Mode
                </span>
                <span className="text-[13px] font-black text-[#111]">
                  {selectedIntern.mode || "N/A"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-[#999] uppercase tracking-widest">
                  Location
                </span>
                <span className="text-[13px] font-medium text-[#555]">
                  {selectedIntern.location || "N/A"}
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
              <div className="flex justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-[#999] uppercase tracking-widest">
                    Start Date
                  </span>
                  <span className="text-[13px] font-mono font-bold text-[#555]">
                    {selectedIntern.startDate
                      ? new Date(selectedIntern.startDate).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[10px] font-bold text-[#999] uppercase tracking-widest">
                    End Date
                  </span>
                  <span className="text-[13px] font-mono font-bold text-[#555]">
                    {selectedIntern.endDate
                      ? new Date(selectedIntern.endDate).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* RESUME LINK */}
            {selectedIntern.resumeUrl && (
              <a
                href={selectedIntern.resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 mt-6 text-[11px] font-black text-[#111] uppercase tracking-[0.15em] hover:underline transition-all group/link"
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
                View Resume
              </a>
            )}

            {/* CLOSE BUTTON */}
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

export default MentorDashboard;
