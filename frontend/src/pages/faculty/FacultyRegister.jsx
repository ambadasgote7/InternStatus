import { useEffect, useState } from "react";
import axios from "axios";
import {
  Plus,
  Trash2,
  Upload,
  FileText,
  User,
  Globe,
  Building2,
  Mail,
  Users,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../../utils/constants";

const FacultyRegister = () => {
  const user = useSelector((state) => state.user);
  const requesterEmail = user?.email || "";
  const navigate = useNavigate();

  /* ---------------- state ---------------- */

  const [form, setForm] = useState({
    requesterName: "",
    college: "", // 🔥 ObjectId
    collegeWebsite: "",
  });

  const [colleges, setColleges] = useState([]);

  const [faculties, setFaculties] = useState([
    { facultyName: "", facultyEmail: "" },
  ]);

  const [verificationFile, setVerificationFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  /* ---------------- fetch colleges ---------------- */

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/college`);
        setColleges(res.data || []);
      } catch (err) {
        console.error("Failed to fetch colleges", err);
        setMessage("Unable to load colleges");
      }
    };

    fetchColleges();
  }, []);

  /* ---------------- handlers ---------------- */

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFacultyChange = (index, field, value) => {
    const updated = [...faculties];
    updated[index][field] = value;
    setFaculties(updated);
  };

  const addFaculty = () => {
    setFaculties([...faculties, { facultyName: "", facultyEmail: "" }]);
  };

  const removeFaculty = (index) => {
    if (faculties.length === 1) return;
    setFaculties(faculties.filter((_, i) => i !== index));
  };

  /* ---------------- submit ---------------- */

  const handleSubmit = async () => {
    setMessage("");
    setSuccess(false);

    if (!form.requesterName.trim()) {
      setMessage("Requester name is required");
      return;
    }

    if (!form.college) {
      setMessage("College selection is required");
      return;
    }

    if (!verificationFile) {
      setMessage("Verification document is required");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("requesterName", form.requesterName.trim());
      formData.append("college", form.college); // 🔥 ObjectId

      if (form.collegeWebsite.trim()) {
        formData.append("collegeWebsite", form.collegeWebsite.trim());
      }

      formData.append(
        "requestedFaculties",
        JSON.stringify(
          faculties.filter(
            (f) => f.facultyName.trim() && f.facultyEmail.trim()
          )
        )
      );

      formData.append("verificationDocument", verificationFile);

      await axios.post(`${BASE_URL}/api/faculty/register`, formData, {
        withCredentials: true,
      });

      setSuccess(true);
      setTimeout(() => navigate("/pending-verification"), 1500);
    } catch (err) {
      setMessage(err.response?.data?.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-10">

        {/* Header */}
        <div className="text-center">
          <div className="inline-flex p-3 bg-white rounded-2xl shadow border mb-6">
            <div className="bg-indigo-600 p-3 rounded-xl">
              <Building2 className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900">
            Faculty Portal Registration
          </h1>
          <p className="text-slate-500 mt-2">
            Provide your institution details for verification.
          </p>
        </div>

        {/* Identity */}
        <section className="bg-white rounded-3xl border p-8 shadow-sm">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <User className="text-indigo-600" />
            Identity Details
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <input
              name="requesterName"
              placeholder="Requester Name"
              value={form.requesterName}
              onChange={handleFormChange}
              className="w-full px-4 py-3 border rounded-xl"
            />

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={requesterEmail}
                disabled
                className="w-full pl-12 py-3 border rounded-xl bg-slate-100"
              />
            </div>
          </div>
        </section>

        {/* Institution */}
        <section className="bg-white rounded-3xl border p-8 shadow-sm">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Globe className="text-purple-600" />
            Institution Info
          </h2>

          <div className="space-y-5">
            {/* 🔥 College Dropdown */}
            <select
              name="college"
              value={form.college}
              onChange={handleFormChange}
              className="w-full px-4 py-3 border rounded-xl bg-white"
            >
              <option value="">Select College / University</option>
              {colleges.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>

            <input
              name="collegeWebsite"
              placeholder="Official Website"
              value={form.collegeWebsite}
              onChange={handleFormChange}
              className="w-full px-4 py-3 border rounded-xl"
            />
          </div>
        </section>

        {/* Faculty List */}
        <section className="bg-white rounded-3xl border p-8 shadow-sm">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Users className="text-blue-600" />
            Faculty Members <span className="text-sm text-slate-400">(Optional)</span>
          </h2>

          <div className="space-y-4">
            {faculties.map((f, i) => (
              <div key={i} className="grid md:grid-cols-[1fr,1fr,auto] gap-4">
                <input
                  placeholder="Faculty Name"
                  value={f.facultyName}
                  onChange={(e) =>
                    handleFacultyChange(i, "facultyName", e.target.value)
                  }
                  className="px-4 py-3 border rounded-xl"
                />
                <input
                  placeholder="Faculty Email"
                  value={f.facultyEmail}
                  onChange={(e) =>
                    handleFacultyChange(i, "facultyEmail", e.target.value)
                  }
                  className="px-4 py-3 border rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => removeFaculty(i)}
                  className="p-3 text-slate-400 hover:text-red-500"
                >
                  <Trash2 />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addFaculty}
              className="w-full py-4 border-2 border-dashed rounded-2xl text-slate-500"
            >
              <Plus className="inline mr-2" />
              Add Faculty Member
            </button>
          </div>
        </section>

        {/* Verification */}
        <section className="bg-white rounded-3xl border p-8 shadow-sm">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FileText className="text-emerald-600" />
            Verification Document
          </h2>

          <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-2xl cursor-pointer bg-slate-50">
            <Upload className="w-8 h-8 text-slate-400 mb-2" />
            <p className="text-sm font-semibold">
              {verificationFile
                ? verificationFile.name
                : "Click to upload document"}
            </p>
            <input
              type="file"
              accept=".pdf,image/*"
              className="hidden"
              onChange={(e) => setVerificationFile(e.target.files[0])}
            />
          </label>
        </section>

        {/* Status */}
        {message && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-50 text-rose-700">
            <AlertCircle />
            {message}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 text-emerald-700">
            <CheckCircle2 />
            Registration submitted. Redirecting…
          </div>
        )}

        {/* Submit */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-5 rounded-2xl bg-slate-900 text-white font-bold disabled:opacity-50"
        >
          {loading ? "Submitting…" : "Submit for Approval"}
        </button>

      </div>
    </div>
  );
};

export default FacultyRegister;
