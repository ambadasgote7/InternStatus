import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../utils/constants";

const VerifiedStudentRequests = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVerifiedStudents = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${BASE_URL}/api/faculty/verified-student-requests`,
          { withCredentials: true }
        );
        setStudents(res.data?.verifiedRequests || []);
      } catch (err) {
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchVerifiedStudents();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center font-sans">
        <p className="text-[14px] font-bold text-[#333] animate-pulse m-0">
          Indexing Verified Cohort...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#333] font-sans pb-10">
      <main className="max-w-7xl mx-auto w-full px-4 md:px-6 py-6 flex flex-col gap-6">
        
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#e5e5e5] pb-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-[23px] font-black text-[#333] m-0 tracking-tight leading-tight">
              Verified Students
            </h1>
            <p className="text-[13px] font-bold text-[#333] opacity-60 m-0 uppercase tracking-widest">
              Authorized Institutional Directory
            </p>
          </div>

          <div className="bg-[#fff] border border-[#e5e5e5] px-4 py-2 rounded-[12px] flex items-center gap-3">
            <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Database Size</span>
            <span className="text-[18px] font-black text-[#111] leading-none">{students.length}</span>
          </div>
        </header>

        {students.length === 0 ? (
          <div className="bg-[#fff] border-2 border-dashed border-[#e5e5e5] rounded-[20px] p-20 text-center">
            <p className="text-[13px] font-bold text-[#333] opacity-40 m-0 uppercase tracking-widest">
              No verified student entities detected
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students.map((student) => (
              <div
                key={student._id}
                className="bg-[#fff] border border-[#e5e5e5] rounded-[20px] shadow-sm hover:border-[#333] transition-all flex flex-col overflow-hidden"
              >
                <div className="p-6 flex-grow flex flex-col gap-5">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-1">
                      <h3 className="text-[17px] font-black text-[#333] m-0 leading-tight">
                        {student.fullName}
                      </h3>
                      <p className="text-[11px] font-bold opacity-50 uppercase tracking-widest">
                        {student.course} / Year {student.year}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-[10px] text-[9px] font-black uppercase tracking-widest bg-[#f9f9f9] border border-[#008000] text-[#008000]">
                      Verified
                    </span>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">PRN Matrix</span>
                      <span className="text-[13px] font-mono font-bold text-[#111]">{student.prn}</span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Contact Channel</span>
                      <span className="text-[13px] font-bold">{student.phone}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Tech Stack</span>
                    <div className="flex flex-wrap gap-1">
                      {student.skills?.length > 0 ? (
                        student.skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-bold px-2 py-0.5 rounded-[6px] bg-[#f9f9f9] border border-[#e5e5e5]"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] font-bold opacity-30 italic">Not Documented</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 mt-auto">
                    <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Professional Bio</span>
                    <p className="text-[12px] font-medium opacity-70 m-0 leading-relaxed line-clamp-2">
                      {student.bio || "No summary provided."}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 border-t border-[#f9f9f9] bg-[#fcfcfc]">
                  <a
                    href={student.resumeFileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-center py-3 text-[11px] font-black text-[#111] uppercase tracking-widest border-r border-[#f9f9f9] no-underline hover:bg-[#fff] transition-colors"
                  >
                    Resume
                  </a>
                  <a
                    href={student.collegeIdImageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-center py-3 text-[11px] font-black text-[#111] uppercase tracking-widest no-underline hover:bg-[#fff] transition-colors"
                  >
                    ID Card
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default VerifiedStudentRequests;