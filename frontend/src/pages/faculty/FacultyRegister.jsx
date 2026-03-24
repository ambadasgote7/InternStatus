import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../../utils/constants";

const FacultyRegister = () => {
  const user = useSelector((state) => state.user);
  const requesterEmail = user?.email || "";
  const navigate = useNavigate();

  const [form, setForm] = useState({
    requesterName: "",
    college: "",
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

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/college`);
        setColleges(res.data?.colleges || []);
      } catch (err) {
        setMessage("Unable to load colleges");
      }
    };
    fetchColleges();
  }, []);

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

  const handleSubmit = async () => {
    setMessage("");
    setSuccess(false);

    if (!form.requesterName.trim()) {
      setMessage("Requester name is required");
      return;
    }

    if (!form.college) {
      setMessage("College selection is required");
    }

    if (!verificationFile) {
      setMessage("Verification document is required");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("requesterName", form.requesterName.trim());
      formData.append("college", form.college);

      if (form.collegeWebsite.trim()) {
        formData.append("collegeWebsite", form.collegeWebsite.trim());
      }

      formData.append(
        "requestedFaculties",
        JSON.stringify(
          faculties.filter(
            (f) => f.facultyName.trim() && f.facultyEmail.trim(),
          ),
        ),
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0F19] p-4 md:p-12 font-sans box-border text-white selection:bg-violet-500/30 selection:text-violet-200 relative overflow-hidden">
      <div
        className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-fuchsia-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"
        aria-hidden="true"
      />

      <div className="w-full max-w-4xl bg-white/5 backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] border border-white/10 box-border relative z-10 transition-all duration-300 hover:border-white/20">
        <header className="text-center mb-12 border-b border-white/10 pb-8">
          <div className="text-[10px] font-bold text-fuchsia-400 uppercase tracking-[0.3em] mb-3">
            Institutional Uplink
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 m-0 tracking-tight">
            Faculty Registration
          </h1>
          <p className="text-white/40 text-sm md:text-base mt-3 m-0 tracking-wide font-medium">
            Authenticate your institution to manage student cohorts.
          </p>
        </header>

        {message && (
          <div className="mb-8 px-6 py-4 text-[11px] font-bold text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl uppercase tracking-widest text-center animate-pulse">
            {message}
          </div>
        )}

        {success && (
          <div className="mb-8 px-6 py-4 text-[11px] font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-xl uppercase tracking-widest text-center animate-bounce">
            Registration submitted. Initiating redirect...
          </div>
        )}

        <div className="flex flex-col gap-12">
          <section className="flex flex-col gap-6">
            <div className="flex items-center gap-4 border-b border-white/5 pb-4">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white flex items-center justify-center text-[10px] font-black shadow-lg">
                01
              </span>
              <h2 className="text-xs font-bold text-white/90 uppercase tracking-[0.2em] m-0">
                Identity Parameters
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest ml-1">
                  Requester Name
                </label>
                <input
                  name="requesterName"
                  placeholder="e.g. Dr. John Smith"
                  value={form.requesterName}
                  onChange={handleFormChange}
                  className="w-full px-5 py-4 text-sm text-white bg-[#0B0F19]/50 border border-white/10 rounded-xl outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all duration-300 placeholder:text-white/20"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest ml-1">
                  Primary Email (Locked)
                </label>
                <input
                  value={requesterEmail}
                  disabled
                  className="w-full px-5 py-4 text-sm text-white/40 bg-white/5 border border-white/5 rounded-xl outline-none cursor-not-allowed italic"
                />
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-6">
            <div className="flex items-center gap-4 border-b border-white/5 pb-4">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white flex items-center justify-center text-[10px] font-black shadow-lg">
                02
              </span>
              <h2 className="text-xs font-bold text-white/90 uppercase tracking-[0.2em] m-0">
                Institutional Context
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest ml-1">
                  College / University
                </label>
                <div className="relative">
                  <select
                    name="college"
                    value={form.college}
                    onChange={handleFormChange}
                    className="w-full px-5 py-4 text-sm text-white bg-[#0B0F19]/50 border border-white/10 rounded-xl outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all duration-300 cursor-pointer appearance-none [&>option]:bg-[#0B0F19]"
                  >
                    <option value="" disabled className="text-white/20">
                      Select Entity
                    </option>
                    {colleges.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
                    ▼
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest ml-1">
                  Official Website
                </label>
                <input
                  name="collegeWebsite"
                  placeholder="https://university.edu"
                  value={form.collegeWebsite}
                  onChange={handleFormChange}
                  className="w-full px-5 py-4 text-sm text-white bg-[#0B0F19]/50 border border-white/10 rounded-xl outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all duration-300 placeholder:text-white/20"
                />
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/5 pb-4 gap-4">
              <div className="flex items-center gap-4">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white flex items-center justify-center text-[10px] font-black shadow-lg">
                  03
                </span>
                <h2 className="text-xs font-bold text-white/90 uppercase tracking-[0.2em] m-0">
                  Faculty Roster
                </h2>
              </div>
              <button
                type="button"
                onClick={addFaculty}
                className="px-5 py-2 rounded-lg bg-violet-500/10 border border-violet-500/30 text-violet-300 text-[10px] font-black uppercase tracking-widest hover:bg-violet-500/20 transition-all active:scale-95"
              >
                + Add Member
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {faculties.map((f, i) => (
                <div
                  key={i}
                  className="group flex flex-col md:flex-row gap-4 items-center p-5 bg-[#0B0F19]/30 rounded-2xl border border-white/5 transition-all hover:border-white/10"
                >
                  <div className="w-full flex-1">
                    <input
                      placeholder="Full Name"
                      value={f.facultyName}
                      onChange={(e) =>
                        handleFacultyChange(i, "facultyName", e.target.value)
                      }
                      className="w-full bg-transparent border-none text-sm text-white outline-none placeholder:text-white/20 font-medium"
                    />
                  </div>
                  <div className="hidden md:block w-px h-6 bg-white/10"></div>
                  <div className="w-full flex-1">
                    <input
                      placeholder="Institutional Email"
                      value={f.facultyEmail}
                      onChange={(e) =>
                        handleFacultyChange(i, "facultyEmail", e.target.value)
                      }
                      className="w-full bg-transparent border-none text-sm text-white outline-none placeholder:text-white/20 font-medium"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFaculty(i)}
                    disabled={faculties.length === 1}
                    className="w-full md:w-auto px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[9px] font-black uppercase tracking-tighter hover:bg-red-500/20 transition-all disabled:opacity-0"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-6">
            <div className="flex items-center gap-4 border-b border-white/5 pb-4">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white flex items-center justify-center text-[10px] font-black shadow-lg">
                04
              </span>
              <h2 className="text-xs font-bold text-white/90 uppercase tracking-[0.2em] m-0">
                Authorization Evidence
              </h2>
            </div>
            <div className="p-8 bg-[#0B0F19]/30 rounded-3xl border-2 border-white/5 border-dashed hover:border-violet-500/30 transition-all group flex flex-col items-center justify-center gap-4">
              <input
                type="file"
                id="verify-upload"
                accept=".pdf,image/*"
                onChange={(e) => setVerificationFile(e.target.files[0])}
                className="hidden"
              />
              <label
                htmlFor="verify-upload"
                className="flex flex-col items-center cursor-pointer"
              >
                <span className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] text-white/80 group-hover:text-white group-hover:bg-white/10 transition-all">
                  {verificationFile ? verificationFile.name : "Select Document"}
                </span>
                <span className="mt-4 text-[11px] text-white/30 group-hover:text-white/50 transition-colors uppercase font-medium tracking-widest">
                  PDF or High-Res Image (Max 5MB)
                </span>
              </label>
            </div>
          </section>

          <div className="pt-8 border-t border-white/10">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-5 text-xs font-black text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 border-none rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-[0_12px_24px_-8px_rgba(217,70,239,0.6)] hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-[0.2em] flex items-center justify-center gap-4"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying Link...
                </>
              ) : (
                "Submit for Approval"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyRegister;
