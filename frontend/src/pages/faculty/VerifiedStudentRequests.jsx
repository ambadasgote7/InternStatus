import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../utils/constants";
// Optional: Install lucide-react for better icons
import { UserCheck, Phone, FileText, IdCard, GraduationCap, Code } from "lucide-react";

const VerifiedStudentRequests = () => {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const fetchVerifiedStudents = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}/api/faculty/verified-student-requests`,
          { withCredentials: true }
        );
        setStudents(res.data?.verifiedRequests || []);
      } catch (err) {
        console.error("Failed to fetch verified students", err);
        setStudents([]);
      }
    };
    fetchVerifiedStudents();
  }, []);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Verified Students</h2>
            <p className="text-gray-500 mt-1">Review approved student profiles for industry interface.</p>
          </div>
          <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
            <UserCheck size={18} />
            {students.length} Total Verified
          </div>
        </header>

        {students.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center">
            <p className="text-gray-400 text-lg">No verified student records found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {students.map((student) => (
              <div
                key={student._id}
                className="group bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300"
              >
                {/* Header Section */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {student.fullName}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-gray-500 text-sm">
                      <GraduationCap size={14} />
                      <span>{student.course} • {student.year} Year</span>
                    </div>
                  </div>
                  <span className="bg-green-50 text-green-600 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-md">
                    Verified
                  </span>
                </div>

                <hr className="border-gray-50 mb-4" />

                {/* Details Grid */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">PRN Number</span>
                    <span className="font-mono font-semibold bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                      {student.prn}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Phone size={14} className="text-gray-400" />
                    <span>{student.phone}</span>
                  </div>

                  {/* Skills Section */}
                  <div className="mt-4">
                    <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-gray-800">
                      <Code size={14} />
                      <span>Tech Stack</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {student.skills?.length > 0 ? (
                        student.skills.map((skill, idx) => (
                          <span key={idx} className="text-[11px] bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-medium">
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400 italic">No skills listed</span>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-2 mt-3 italic leading-relaxed">
                    "{student.bio || "No bio provided"}"
                  </p>
                </div>

                {/* Action Footer */}
                <div className="flex gap-4 mt-6 pt-4 border-t border-gray-50">
                  <a
                    href={student.resumeFileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white text-sm font-medium py-2.5 rounded-xl hover:bg-gray-800 transition-colors"
                  >
                    <FileText size={16} />
                    Resume
                  </a>
                  <a
                    href={student.collegeIdImageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 border border-gray-200 text-gray-700 text-sm font-medium py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <IdCard size={16} />
                    ID Card
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifiedStudentRequests;