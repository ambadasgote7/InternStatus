import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../../api/api";

export default function AdminCollegeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [college, setCollege] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCollege = async () => {
    try {
      const res = await API.get(`/admin/colleges/${id}`);
      setCollege(res.data?.data || null);
    } catch (err) {
      console.error("Fetch college error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollege();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center font-sans">
        <p className="text-[14px] font-bold text-[#333] animate-pulse m-0 uppercase tracking-widest">
          Syncing Institutional Records...
        </p>
      </div>
    );
  }

  if (!college) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center p-4 font-sans text-[#333]">
        <div className="w-full max-w-md bg-[#fff] border border-[#cc0000] p-8 md:p-12 rounded-[20px] text-center shadow-sm">
          <header className="mb-6">
            <h2 className="text-[23px] font-black tracking-tight m-0 uppercase">
              Record Not Found
            </h2>
            <p className="text-[11px] font-bold opacity-60 uppercase tracking-widest mt-1">
              Database Error
            </p>
          </header>
          <button
            onClick={() => navigate("/admin/colleges")}
            className="px-6 py-3 bg-[#111] text-[#fff] text-[11px] font-black rounded-[14px] uppercase tracking-widest border-none cursor-pointer"
          >
            Return to Directory
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#333] font-sans pb-10">
      <main className="max-w-5xl mx-auto w-full px-4 md:px-6 py-6 flex flex-col gap-6">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#e5e5e5] pb-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-[23px] font-black text-[#333] m-0 tracking-tight leading-tight">
              Institutional Profile
            </h1>
            <p className="text-[13px] font-bold text-[#333] opacity-60 m-0 uppercase tracking-widest">
              Verified College Data
            </p>
          </div>
          <button
            onClick={() => navigate(`/admin/colleges/edit/${college._id}`)}
            className="px-6 py-2.5 text-[11px] font-black text-[#fff] bg-[#111] border-none rounded-[12px] hover:opacity-80 transition-opacity cursor-pointer uppercase tracking-widest"
          >
            Modify Records
          </button>
        </header>

        <section className="bg-[#fff] border border-[#e5e5e5] rounded-[20px] p-6 md:p-8 shadow-sm">
          <h3 className="text-[11px] font-black opacity-40 uppercase tracking-widest mb-6 border-b border-[#f9f9f9] pb-3">
            Core Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 p-4 bg-[#f9f9f9] border border-[#e5e5e5] rounded-[14px]">
              <span className="text-[10px] font-black opacity-40 uppercase tracking-widest">
                Formal Name
              </span>
              <span className="text-[14px] font-black text-[#111]">
                {college.name}
              </span>
            </div>

            <div className="flex flex-col gap-1.5 p-4 bg-[#f9f9f9] border border-[#e5e5e5] rounded-[14px]">
              <span className="text-[10px] font-black opacity-40 uppercase tracking-widest">
                Account Status
              </span>
              <span
                className={`text-[11px] font-black tracking-widest uppercase px-2 py-1 rounded-[8px] w-max border ${
                  college.status === "active"
                    ? "bg-[#fff] border-[#008000] text-[#008000]"
                    : "bg-[#fff] border-[#cc0000] text-[#cc0000]"
                }`}
              >
                {college.status}
              </span>
            </div>

            <div className="flex flex-col gap-1.5 p-4 bg-[#f9f9f9] border border-[#e5e5e5] rounded-[14px]">
              <span className="text-[10px] font-black opacity-40 uppercase tracking-widest">
                Contact Channel
              </span>
              <span className="text-[13px] font-bold">
                {college.phone || "Not Specified"}
              </span>
            </div>

            <div className="flex flex-col gap-1.5 p-4 bg-[#f9f9f9] border border-[#e5e5e5] rounded-[14px]">
              <span className="text-[10px] font-black opacity-40 uppercase tracking-widest">
                Official Website
              </span>
              <a
                href={college.website}
                target="_blank"
                rel="noreferrer"
                className="text-[13px] font-bold text-[#111] underline truncate"
              >
                {college.website || "—"}
              </a>
            </div>

            <div className="flex flex-col gap-1.5 p-4 bg-[#f9f9f9] border border-[#e5e5e5] rounded-[14px]">
              <span className="text-[10px] font-black opacity-40 uppercase tracking-widest">
                Whitelisted Domain
              </span>
              <span className="text-[13px] font-mono font-bold text-[#111]">
                {college.emailDomain || "—"}
              </span>
            </div>

            <div className="flex flex-col gap-1.5 p-4 bg-[#f9f9f9] border border-[#e5e5e5] rounded-[14px] md:col-span-2">
              <span className="text-[10px] font-black opacity-40 uppercase tracking-widest">
                Physical Address
              </span>
              <span className="text-[13px] font-medium leading-relaxed">
                {college.address || "No address documented"}
              </span>
            </div>

            <div className="flex flex-col gap-1.5 p-4 bg-[#f9f9f9] border border-[#e5e5e5] rounded-[14px] md:col-span-2">
              <span className="text-[10px] font-black opacity-40 uppercase tracking-widest">
                Organizational Brief
              </span>
              <span className="text-[13px] font-medium leading-relaxed opacity-80">
                {college.description || "No description provided"}
              </span>
            </div>
          </div>
        </section>

        <section className="bg-[#fff] border border-[#e5e5e5] rounded-[20px] p-6 md:p-8 shadow-sm">
          <h3 className="text-[11px] font-black opacity-40 uppercase tracking-widest mb-6 border-b border-[#f9f9f9] pb-3">
            Academic Programs
          </h3>

          {!college.courses || college.courses.length === 0 ? (
            <div className="px-6 py-10 text-center border-2 border-dashed border-[#e5e5e5] rounded-[20px]">
              <p className="text-[13px] font-bold opacity-30 uppercase tracking-widest">
                No programs registered
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {college.courses.map((course, index) => (
                <div
                  key={index}
                  className="bg-[#f9f9f9] border border-[#e5e5e5] p-5 rounded-[18px] flex flex-col gap-5 transition-all hover:border-[#111]"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#e5e5e5] pb-4">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-[#111] opacity-40 uppercase tracking-widest">
                        Title
                      </span>
                      <span className="text-[16px] font-black text-[#111]">
                        {course.name}
                      </span>
                    </div>
                    <div className="flex flex-col md:items-end">
                      <span className="text-[9px] font-black text-[#111] opacity-40 uppercase tracking-widest">
                        Cycle Duration
                      </span>
                      <span className="text-[13px] font-bold text-[#111]">
                        {course.durationYears} Years
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-black opacity-40 uppercase tracking-widest">
                      Fields of Specialization
                    </span>
                    {!course.specializations ||
                    course.specializations.length === 0 ? (
                      <span className="text-[12px] font-bold opacity-30 italic">
                        No specializations specified
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {course.specializations.map((sp, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 text-[11px] font-bold bg-[#fff] border border-[#e5e5e5] rounded-[8px] uppercase tracking-tighter"
                          >
                            {sp}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
