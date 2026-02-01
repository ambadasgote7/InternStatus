import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { BASE_URL } from "../../utils/constants";
import { addUser } from "../../store/userSlice";
import { setStudentProfile } from "../../store/studentProfileSlice";
import {
  User,
  FileText,
  GraduationCap,
  Lock,
  Shield,
} from "lucide-react";

const StudentProfile = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const isVerified = !!user?.isVerified;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [colleges, setColleges] = useState([]);

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    college: "",        // 🔥 ObjectId
    prn: "",
    course: "",
    year: "",
    skills: "",
    bio: "",
  });

  const [collegeIdFile, setCollegeIdFile] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);

  /* ================= FETCH PROFILE + COLLEGES ================= */
  useEffect(() => {
    const loadData = async () => {
      try {
        const [profileRes, collegeRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/student/profile`, {
            withCredentials: true,
          }),
          axios.get(`${BASE_URL}/api/college`),
        ]);

        setColleges(collegeRes.data || []);

        const p = profileRes.data?.data;
        if (p) {
          setForm({
            fullName: p.fullName || "",
            phone: p.phone || "",
            college: p.college?._id || p.college || "",
            prn: p.prn || "",
            course: p.course || "",
            year: p.year || "",
            skills: Array.isArray(p.skills) ? p.skills.join(", ") : "",
            bio: p.bio || "",
          });
        }
      } catch (err) {
        console.error("Failed to load profile or colleges", err);
      } finally {
        setFetching(false);
      }
    };

    loadData();
  }, []);

  /* ================= FORM HANDLER ================= */
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    if (
      !form.fullName ||
      !form.prn ||
      !form.college ||
      !form.phone ||
      !form.course ||
      !form.year
    ) {
      window.alert("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("fullName", form.fullName);
      formData.append("phone", form.phone);
      formData.append("college", form.college); // 🔥 ObjectId
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

      dispatch(addUser(res.data.user));
      dispatch(setStudentProfile(res.data.profile));

      window.alert(res.data.message || "Profile saved successfully!");
      setCollegeIdFile(null);
      setResumeFile(null);
    } catch (err) {
      window.alert(err.response?.data?.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= LOADING ================= */
  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading profile…</p>
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <User className="mx-auto mb-2" />
          <h1 className="text-3xl font-bold">Student Profile</h1>
        </div>

        {/* Verified Banner */}
        {isVerified && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded">
            <div className="flex items-center gap-2">
              <Shield className="text-green-600" />
              <span className="font-semibold">Profile Verified</span>
            </div>
          </div>
        )}

        {/* Identity */}
        <section className="bg-white p-6 rounded shadow mb-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <User /> Identity {isVerified && <Lock size={16} />}
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <input
              name="fullName"
              placeholder="Full Name"
              value={form.fullName}
              onChange={handleChange}
              disabled={isVerified}
              className="input"
            />

            <input
              name="prn"
              placeholder="PRN"
              value={form.prn}
              onChange={handleChange}
              disabled={isVerified}
              className="input"
            />

            {/* 🔥 College Dropdown */}
            <select
              name="college"
              value={form.college}
              onChange={handleChange}
              disabled={isVerified}
              className="input md:col-span-2"
            >
              <option value="">Select College</option>
              {colleges.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* Academic */}
        <section className="bg-white p-6 rounded shadow mb-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <GraduationCap /> Academic & Contact
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <input
              name="phone"
              placeholder="Phone"
              value={form.phone}
              onChange={handleChange}
              className="input"
            />
            <input
              name="course"
              placeholder="Course"
              value={form.course}
              onChange={handleChange}
              className="input"
            />
            <input
              name="year"
              placeholder="Year"
              value={form.year}
              onChange={handleChange}
              className="input"
            />
            <input
              name="skills"
              placeholder="Skills (comma separated)"
              value={form.skills}
              onChange={handleChange}
              className="input"
            />
            <textarea
              name="bio"
              placeholder="Bio"
              value={form.bio}
              onChange={handleChange}
              rows={3}
              className="input md:col-span-2"
            />
          </div>
        </section>

        {/* Documents */}
        <section className="bg-white p-6 rounded shadow mb-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <FileText /> Documents
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="file"
              disabled={isVerified}
              onChange={(e) => setCollegeIdFile(e.target.files?.[0] || null)}
            />
            <input
              type="file"
              onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
            />
          </div>
        </section>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3 bg-indigo-600 text-white rounded font-semibold"
        >
          {loading ? "Saving…" : "Save Profile"}
        </button>
      </div>
    </div>
  );
};

export default StudentProfile;
