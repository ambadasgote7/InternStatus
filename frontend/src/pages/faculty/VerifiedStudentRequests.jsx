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
          { withCredentials: true },
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
      <div className="min-h-screen bg-[#FFFFFF] flex items-center justify-center font-['Nunito'] transition-all duration-300">
        <div className="flex flex-col items-center gap-4 animate-in fade-in duration-700">
          <div className="w-12 h-12 border-4 border-[#F5F6FA] border-t-[#6C5CE7] rounded-full animate-spin"></div>
          <p className="text-[12px] font-black text-[#6C5CE7] animate-pulse m-0 uppercase tracking-[0.2em]">
            Indexing Verified Cohort...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#2D3436] font-['Nunito'] pb-12 transition-colors duration-500 selection:bg-[#6C5CE7]/20 selection:text-[#6C5CE7]">
      <main className="max-w-7xl mx-auto w-full px-4 md:px-8 py-8 flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#F5F6FA] pb-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl md:text-5xl font-black text-[#2D3436] m-0 tracking-tighter leading-tight uppercase">
              Verified Students
            </h1>
            <p className="text-[13px] font-black text-[#6C5CE7] opacity-80 m-0 uppercase tracking-[0.2em]">
              Authorized Institutional Directory
            </p>
          </div>

          <div className="bg-[#F5F6FA] border border-transparent px-6 py-4 rounded-[16px] flex items-center gap-4 shadow-sm transition-all duration-300 hover:shadow-md hover:border-[#6C5CE7]/20">
            <span className="text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-widest">
              Database Size
            </span>
            <span className="text-[24px] font-black text-[#6C5CE7] leading-none">
              {students.length}
            </span>
          </div>
        </header>

        {students.length === 0 ? (
          <div className="bg-[#F5F6FA] border-2 border-dashed border-[#6C5CE7]/20 rounded-[32px] p-20 text-center animate-in zoom-in duration-500">
            <p className="text-[14px] font-black text-[#2D3436] opacity-40 m-0 uppercase tracking-[0.15em]">
              No verified student entities detected
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-8 duration-700">
            {students.map((student, idx) => (
              <div
                key={student._id}
                style={{ animationDelay: `${idx * 50}ms` }}
                className="bg-[#FFFFFF] border border-[#F5F6FA] rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(108,92,231,0.08)] hover:border-[#6C5CE7]/30 transition-all duration-500 flex flex-col overflow-hidden group transform hover:-translate-y-2 animate-in fade-in fill-mode-both"
              >
                <div className="p-8 flex-grow flex flex-col gap-6">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex flex-col gap-1">
                      <h3 className="text-[20px] font-black text-[#2D3436] m-0 leading-tight tracking-tight group-hover:text-[#6C5CE7] transition-colors duration-300">
                        {student.fullName}
                      </h3>
                      <p className="text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-[0.15em] mt-1">
                        {student.course} / Year {student.year}
                      </p>
                    </div>
                    <span className="px-3 py-1.5 rounded-[12px] text-[9px] font-black uppercase tracking-widest bg-emerald-50 border border-emerald-200 text-emerald-600 shadow-sm whitespace-nowrap flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></span>
                      Verified
                    </span>
                  </div>

                  <div className="flex flex-col gap-5 py-5 border-y border-[#F5F6FA]">
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-black text-[#2D3436] opacity-40 uppercase tracking-widest">
                        PRN Matrix
                      </span>
                      <span className="text-[14px] font-mono font-bold text-[#2D3436] bg-[#F5F6FA] px-3 py-1.5 rounded-[10px] w-max border border-transparent group-hover:border-[#6C5CE7]/10 transition-colors">
                        {student.prn}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-[#2D3436] opacity-40 uppercase tracking-widest">
                        Contact Channel
                      </span>
                      <span className="text-[14px] font-bold text-[#2D3436]">
                        {student.phone}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <span className="text-[10px] font-black text-[#2D3436] opacity-40 uppercase tracking-widest">
                      Tech Stack
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {student.skills?.length > 0 ? (
                        student.skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-black px-3 py-1.5 rounded-[12px] bg-[#F5F6FA] text-[#2D3436] opacity-80 uppercase tracking-wider border border-transparent group-hover:border-[#6C5CE7]/20 transition-colors duration-300"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] font-bold text-[#2D3436] opacity-30 italic bg-[#F5F6FA] px-3 py-1.5 rounded-[10px]">
                          Not Documented
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 mt-auto pt-4">
                    <span className="text-[10px] font-black text-[#2D3436] opacity-40 uppercase tracking-widest">
                      Professional Bio
                    </span>
                    <p className="text-[13px] font-bold text-[#2D3436] opacity-70 m-0 leading-relaxed line-clamp-2 bg-[#F5F6FA] p-3 rounded-[14px] border border-transparent group-hover:border-[#6C5CE7]/10 transition-colors">
                      {student.bio || "No summary provided for this candidate."}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 bg-[#F5F6FA] bg-opacity-50 border-t border-[#F5F6FA]">
                  <a
                    href={student.resumeFileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-center py-4 text-[11px] font-black text-[#6C5CE7] uppercase tracking-[0.15em] border-r border-[#FFFFFF] no-underline hover:bg-[#6C5CE7] hover:text-[#FFFFFF] transition-all duration-300 outline-none focus:bg-[#6C5CE7] focus:text-[#FFFFFF]"
                  >
                    Resume
                  </a>
                  <a
                    href={student.collegeIdImageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-center py-4 text-[11px] font-black text-[#6C5CE7] uppercase tracking-[0.15em] no-underline hover:bg-[#6C5CE7] hover:text-[#FFFFFF] transition-all duration-300 outline-none focus:bg-[#6C5CE7] focus:text-[#FFFFFF]"
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
