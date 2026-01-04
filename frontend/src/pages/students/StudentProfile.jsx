import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { BASE_URL } from "../../utils/constants";
import { addUser } from "../../store/userSlice";
import { setStudentProfile } from "../../store/studentProfileSlice";

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Student Profile</h1>

        {isVerified && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4 rounded">
            <p className="text-green-800 font-semibold">✅ Profile Verified</p>
            <p className="text-green-700 text-sm">Identity fields are locked</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Identity Section */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Identity Information {isVerified && "🔒"}</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  disabled={isVerified}
                  required
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  PRN <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="prn"
                  value={form.prn}
                  onChange={handleChange}
                  disabled={isVerified}
                  required
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  College Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="collegeName"
                  value={form.collegeName}
                  onChange={handleChange}
                  disabled={isVerified}
                  required
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
            </div>
          </div>

          {/* Documents */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Documents</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">College ID {isVerified && "🔒"}</label>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => setCollegeIdFile(e.target.files?.[0] || null)}
                  disabled={isVerified}
                  className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Resume (PDF)</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                  className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700"
                />
              </div>
            </div>
          </div>

          {/* Academic Details */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Academic & Contact</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Course <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="course"
                  value={form.course}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Year <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="year"
                  value={form.year}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Skills (comma-separated)</label>
                <input
                  type="text"
                  name="skills"
                  value={form.skills}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="React, Python, SQL"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Bio</label>
                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;