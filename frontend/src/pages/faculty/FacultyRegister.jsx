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
    <div className="min-h-screen flex items-center justify-center bg-[#FFFFFF] p-4 md:p-12 font-['Nunito'] box-border text-[#2D3436] selection:bg-[#6C5CE7]/20 selection:text-[#6C5CE7] relative overflow-hidden transition-all duration-500">
      {/* Decorative Background Elements */}
      <div
        className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#6C5CE7]/5 rounded-full blur-[100px] pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#6C5CE7]/5 rounded-full blur-[100px] pointer-events-none"
        aria-hidden="true"
      />

      <div className="w-full max-w-4xl bg-[#FFFFFF] p-8 md:p-14 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#F5F6FA] box-border relative z-10 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(108,92,231,0.08)] animate-in fade-in slide-in-from-bottom-6">
        <header className="text-center mb-12 border-b border-[#F5F6FA] pb-8">
          <div className="text-[11px] font-black text-[#6C5CE7] uppercase tracking-[0.3em] mb-4">
            Institutional Uplink
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-[#2D3436] m-0 tracking-tighter leading-tight">
            Faculty Registration
          </h1>
          <p className="text-[#2D3436] opacity-60 text-sm md:text-base mt-4 m-0 tracking-wide font-bold">
            Authenticate your institution to manage student cohorts.
          </p>
        </header>

        {message && (
          <div className="mb-8 px-6 py-4 text-[12px] font-black text-rose-600 bg-rose-50 border border-rose-200 rounded-[16px] uppercase tracking-widest text-center shadow-sm animate-in fade-in zoom-in duration-300">
            {message}
          </div>
        )}

        {success && (
          <div className="mb-8 px-6 py-4 text-[12px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-[16px] uppercase tracking-widest text-center shadow-sm animate-in fade-in zoom-in duration-300">
            Registration submitted. Initiating redirect...
          </div>
        )}

        <div className="flex flex-col gap-14">
          {/* SECTION 1: Identity Parameters */}
          <section className="flex flex-col gap-6 group">
            <div className="flex items-center gap-4 border-b border-[#F5F6FA] pb-4 transition-colors group-hover:border-[#6C5CE7]/30">
              <span className="w-10 h-10 rounded-[12px] bg-[#F5F6FA] text-[#6C5CE7] flex items-center justify-center text-[12px] font-black shadow-sm group-hover:bg-[#6C5CE7] group-hover:text-[#FFFFFF] transition-all duration-300">
                01
              </span>
              <h2 className="text-[13px] font-black text-[#2D3436] uppercase tracking-[0.2em] m-0">
                Identity Parameters
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-[#2D3436] opacity-50 uppercase tracking-widest px-1">
                  Requester Name
                </label>
                <input
                  name="requesterName"
                  placeholder="e.g. Dr. John Smith"
                  value={form.requesterName}
                  onChange={handleFormChange}
                  className="w-full px-5 py-4 text-[14px] font-bold text-[#2D3436] bg-[#F5F6FA] border border-transparent rounded-[16px] outline-none focus:bg-[#FFFFFF] focus:border-[#6C5CE7] focus:ring-4 focus:ring-[#6C5CE7]/10 transition-all duration-300 placeholder-[#2D3436] placeholder-opacity-30 shadow-sm"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-[#2D3436] opacity-50 uppercase tracking-widest px-1">
                  Primary Email (Locked)
                </label>
                <input
                  value={requesterEmail}
                  disabled
                  className="w-full px-5 py-4 text-[14px] font-bold text-[#2D3436] opacity-40 bg-[#F5F6FA] border border-transparent rounded-[16px] outline-none cursor-not-allowed italic"
                />
              </div>
            </div>
          </section>

          {/* SECTION 2: Institutional Context */}
          <section className="flex flex-col gap-6 group">
            <div className="flex items-center gap-4 border-b border-[#F5F6FA] pb-4 transition-colors group-hover:border-[#6C5CE7]/30">
              <span className="w-10 h-10 rounded-[12px] bg-[#F5F6FA] text-[#6C5CE7] flex items-center justify-center text-[12px] font-black shadow-sm group-hover:bg-[#6C5CE7] group-hover:text-[#FFFFFF] transition-all duration-300">
                02
              </span>
              <h2 className="text-[13px] font-black text-[#2D3436] uppercase tracking-[0.2em] m-0">
                Institutional Context
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-[#2D3436] opacity-50 uppercase tracking-widest px-1">
                  College / University
                </label>
                <div className="relative">
                  <select
                    name="college"
                    value={form.college}
                    onChange={handleFormChange}
                    className="w-full px-5 py-4 text-[14px] font-bold text-[#2D3436] bg-[#F5F6FA] border border-transparent rounded-[16px] outline-none focus:bg-[#FFFFFF] focus:border-[#6C5CE7] focus:ring-4 focus:ring-[#6C5CE7]/10 transition-all duration-300 cursor-pointer appearance-none shadow-sm"
                  >
                    <option
                      value=""
                      disabled
                      className="text-[#2D3436] opacity-30"
                    >
                      Select Entity
                    </option>
                    {colleges.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-[#2D3436] opacity-40 font-black text-[10px]">
                    ▼
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-[#2D3436] opacity-50 uppercase tracking-widest px-1">
                  Official Website
                </label>
                <input
                  name="collegeWebsite"
                  placeholder="https://university.edu"
                  value={form.collegeWebsite}
                  onChange={handleFormChange}
                  className="w-full px-5 py-4 text-[14px] font-bold text-[#2D3436] bg-[#F5F6FA] border border-transparent rounded-[16px] outline-none focus:bg-[#FFFFFF] focus:border-[#6C5CE7] focus:ring-4 focus:ring-[#6C5CE7]/10 transition-all duration-300 placeholder-[#2D3436] placeholder-opacity-30 shadow-sm"
                />
              </div>
            </div>
          </section>

          {/* SECTION 3: Faculty Roster */}
          <section className="flex flex-col gap-6 group">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#F5F6FA] pb-4 gap-4 transition-colors group-hover:border-[#6C5CE7]/30">
              <div className="flex items-center gap-4">
                <span className="w-10 h-10 rounded-[12px] bg-[#F5F6FA] text-[#6C5CE7] flex items-center justify-center text-[12px] font-black shadow-sm group-hover:bg-[#6C5CE7] group-hover:text-[#FFFFFF] transition-all duration-300">
                  03
                </span>
                <h2 className="text-[13px] font-black text-[#2D3436] uppercase tracking-[0.2em] m-0">
                  Faculty Roster
                </h2>
              </div>
              <button
                type="button"
                onClick={addFaculty}
                className="px-6 py-2.5 rounded-[12px] bg-[#FFFFFF] border border-[#F5F6FA] text-[#6C5CE7] text-[10px] font-black uppercase tracking-widest hover:border-[#6C5CE7] hover:shadow-sm transition-all duration-300 active:scale-95 outline-none cursor-pointer"
              >
                + Add Member
              </button>
            </div>

            <div className="grid grid-cols-1 gap-5">
              {faculties.map((f, i) => (
                <div
                  key={i}
                  className="flex flex-col md:flex-row gap-5 items-center p-6 bg-[#F5F6FA] rounded-[20px] border border-transparent transition-all duration-300 hover:border-[#6C5CE7]/30 hover:bg-[#FFFFFF] shadow-sm"
                >
                  <div className="w-full flex-1">
                    <input
                      placeholder="Full Name"
                      value={f.facultyName}
                      onChange={(e) =>
                        handleFacultyChange(i, "facultyName", e.target.value)
                      }
                      className="w-full bg-transparent border-none text-[14px] text-[#2D3436] outline-none placeholder-[#2D3436] placeholder-opacity-40 font-bold"
                    />
                  </div>
                  <div className="hidden md:block w-px h-8 bg-[#2D3436] opacity-10"></div>
                  <div className="w-full flex-1 border-t md:border-t-0 border-[#2D3436] border-opacity-10 pt-4 md:pt-0">
                    <input
                      placeholder="Institutional Email"
                      value={f.facultyEmail}
                      onChange={(e) =>
                        handleFacultyChange(i, "facultyEmail", e.target.value)
                      }
                      className="w-full bg-transparent border-none text-[14px] text-[#2D3436] outline-none placeholder-[#2D3436] placeholder-opacity-40 font-bold"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFaculty(i)}
                    disabled={faculties.length === 1}
                    className="w-full md:w-auto px-5 py-3 rounded-[12px] bg-rose-50 border border-rose-200 text-rose-600 text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all duration-300 disabled:opacity-0 disabled:pointer-events-none outline-none cursor-pointer mt-4 md:mt-0"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 4: Authorization Evidence */}
          <section className="flex flex-col gap-6 group">
            <div className="flex items-center gap-4 border-b border-[#F5F6FA] pb-4 transition-colors group-hover:border-[#6C5CE7]/30">
              <span className="w-10 h-10 rounded-[12px] bg-[#F5F6FA] text-[#6C5CE7] flex items-center justify-center text-[12px] font-black shadow-sm group-hover:bg-[#6C5CE7] group-hover:text-[#FFFFFF] transition-all duration-300">
                04
              </span>
              <h2 className="text-[13px] font-black text-[#2D3436] uppercase tracking-[0.2em] m-0">
                Authorization Evidence
              </h2>
            </div>
            <div className="p-10 bg-[#F5F6FA] rounded-[24px] border-2 border-transparent border-dashed hover:border-[#6C5CE7]/40 hover:bg-[#FFFFFF] transition-all duration-300 flex flex-col items-center justify-center gap-5 cursor-pointer relative shadow-sm">
              <input
                type="file"
                id="verify-upload"
                accept=".pdf,image/*"
                onChange={(e) => setVerificationFile(e.target.files[0])}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="flex flex-col items-center pointer-events-none z-0">
                <span
                  className={`px-8 py-4 bg-[#FFFFFF] border rounded-[16px] text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 shadow-sm ${verificationFile ? "border-[#6C5CE7] text-[#6C5CE7]" : "border-[#F5F6FA] text-[#2D3436] opacity-80"}`}
                >
                  {verificationFile ? verificationFile.name : "Select Document"}
                </span>
                <span className="mt-5 text-[11px] text-[#2D3436] opacity-40 uppercase font-black tracking-widest">
                  PDF or High-Res Image (Max 5MB)
                </span>
              </div>
            </div>
          </section>

          {/* Submit Button */}
          <div className="pt-10 border-t border-[#F5F6FA]">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-5 text-[13px] font-black text-[#FFFFFF] bg-[#6C5CE7] border-none rounded-[16px] cursor-pointer transition-all duration-300 hover:shadow-[0_12px_24px_-8px_rgba(108,92,231,0.6)] hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-[0.2em] flex items-center justify-center gap-4 outline-none"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-[#FFFFFF]/30 border-t-[#FFFFFF] rounded-full animate-spin" />
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
