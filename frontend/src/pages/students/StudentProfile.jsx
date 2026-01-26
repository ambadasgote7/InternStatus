import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { BASE_URL } from "../../utils/constants";
import { addUser } from "../../store/userSlice";
import { setStudentProfile } from "../../store/studentProfileSlice";
import { User, FileText, GraduationCap, Lock, Upload, Shield } from "lucide-react";

const StudentProfile = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const isVerified = !!user?.isVerified;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    collegeName: "",
    prn: "",
    course: "",
    year: "",
    skills: "",
    bio: "",
  });

  const [collegeIdFile, setCollegeIdFile] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);

  /* ================= FETCH PROFILE ================= */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/student/profile`, {
          withCredentials: true,
        });

        const p = res.data?.data;

        if (p) {
          // ✅ sync form for editing
          setForm({
            fullName: p.fullName || "",
            phone: p.phone || "",
            collegeName: p.collegeName || "",
            prn: p.prn || "",
            course: p.course || "",
            year: p.year || "",
            skills: Array.isArray(p.skills) ? p.skills.join(", ") : "",
            bio: p.bio || "",
          });
        }
      } catch (err) {
        console.error("Profile fetch failed:", err);
      } finally {
        setFetching(false);
      }
    };

    fetchProfile();
  }, [dispatch]);

  /* ================= FORM HANDLERS ================= */
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    if (
      !form.fullName ||
      !form.prn ||
      !form.collegeName ||
      !form.phone ||
      !form.course ||
      !form.year
    ) {
      alert("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("fullName", form.fullName);
      formData.append("phone", form.phone);
      formData.append("collegeName", form.collegeName);
      formData.append("prn", form.prn);
      formData.append("course", form.course);
      formData.append("year", form.year);
      formData.append("bio", form.bio);

      const skillsArray = form.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      formData.append("skills", JSON.stringify(skillsArray));

      if (collegeIdFile) formData.append("collegeIdFile", collegeIdFile);
      if (resumeFile) formData.append("resumeFile", resumeFile);

      const res = await axios.post(
        `${BASE_URL}/api/student/profile`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      // ✅ backend is source of truth
      dispatch(addUser(res.data.user));
      dispatch(setStudentProfile(res.data.profile));

      alert(res.data.message || "Profile saved successfully!");

      setCollegeIdFile(null);
      setResumeFile(null);
      document
        .querySelectorAll('input[type="file"]')
        .forEach((input) => (input.value = ""));
    } catch (err) {
      alert(err.response?.data?.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= LOADING ================= */
  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Student Profile
          </h1>
          <p className="text-gray-600">Manage your academic profile and credentials</p>
        </div>

        {/* Verification Status */}
        {isVerified && (
          <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-5 rounded-xl shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-green-800 font-semibold flex items-center gap-2">
                  ✅ Profile Verified
                </p>
                <p className="text-green-700 text-sm">Identity fields are locked for security</p>
              </div>
            </div>
          </div>
        )}

        {/* Identity Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              Identity Information
              {isVerified && <Lock className="w-5 h-5 text-gray-400" />}
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                disabled={isVerified}
                required
                placeholder="Enter your full name"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PRN <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="prn"
                value={form.prn}
                onChange={handleChange}
                disabled={isVerified}
                required
                placeholder="Enter your PRN"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-800"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                College Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="collegeName"
                value={form.collegeName}
                onChange={handleChange}
                disabled={isVerified}
                required
                placeholder="Enter your college name"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-800"
              />
            </div>
          </div>
        </div>

        {/* Documents Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Documents</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                College ID {isVerified && <Lock className="w-4 h-4 text-gray-400" />}
              </label>
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={(e) => setCollegeIdFile(e.target.files?.[0] || null)}
                disabled={isVerified}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm text-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resume (PDF)
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 text-sm text-gray-700"
              />
            </div>
          </div>
        </div>

        {/* Academic & Contact Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Academic & Contact</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
                placeholder="Enter your phone number"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="course"
                value={form.course}
                onChange={handleChange}
                required
                placeholder="e.g., B.Tech Computer Science"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="year"
                value={form.year}
                onChange={handleChange}
                required
                placeholder="e.g., 2nd Year"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skills (comma-separated)
              </label>
              <input
                type="text"
                name="skills"
                value={form.skills}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-gray-800"
                placeholder="React, Python, SQL"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                rows="4"
                placeholder="Tell us about yourself..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition resize-none text-gray-800"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {loading ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </div>
  );
};

export default StudentProfile;