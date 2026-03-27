import React, { useEffect, useState } from "react";
import API from "../../api/api";

export default function CollegeRegister() {
  const [colleges, setColleges] = useState([]);

  const [form, setForm] = useState({
    requesterName: "",
    requesterEmail: "",
    requesterPhone: "",
    selectedCollege: "",
    collegeName: "",
    location: "",
    website: "",
    emailDomain: "",
    verificationDocument: null,
  });

  const [loading, setLoading] = useState(false);
  const [isOther, setIsOther] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const res = await API.get("/college/list");
        setColleges(res.data.data || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchColleges();
  }, []);

  // ✅ Auto-hide success message after 2 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess("");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "verificationDocument") {
      setForm((prev) => ({
        ...prev,
        verificationDocument: files[0],
      }));
      return;
    }

    if (name === "selectedCollege") {
      if (value === "other") {
        setIsOther(true);
        setForm((prev) => ({
          ...prev,
          selectedCollege: "",
          collegeName: "",
        }));
      } else {
        setIsOther(false);
        setForm((prev) => ({
          ...prev,
          selectedCollege: value,
        }));
      }
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("requesterName", form.requesterName);
      formData.append("requesterEmail", form.requesterEmail);
      formData.append("requesterPhone", form.requesterPhone);

      if (form.selectedCollege) {
        formData.append("selectedCollege", form.selectedCollege);
      }

      if (isOther) {
        formData.append("collegeName", form.collegeName);
      }

      formData.append("location", form.location);
      formData.append("website", form.website);
      formData.append("emailDomain", form.emailDomain);

      if (form.verificationDocument) {
        formData.append("verificationDocument", form.verificationDocument);
      }

      await API.post("/onboarding/college", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess("Request submitted successfully. Please wait for admin approval.");
      setForm({
        requesterName: "",
        requesterEmail: "",
        requesterPhone: "",
        selectedCollege: "",
        collegeName: "",
        location: "",
        website: "",
        emailDomain: "",
        verificationDocument: null,
      });
      setIsOther(false);
    } catch (err) {
      setError(err.response?.data?.message || "Error submitting request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFFFFF] p-4 md:p-8 font-['Nunito'] text-[#2D3436]">
      <div className="w-full max-w-2xl bg-white p-8 md:p-12 rounded-[40px] shadow-2xl shadow-[#6C5CE7]/10 border border-[#F5F6FA] animate-in fade-in zoom-in duration-500">
        
        <header className="mb-10 text-center">
          <h2 className="text-[32px] font-black tracking-tight text-[#2D3436]">
            College Registration
          </h2>
          <div className="flex justify-center mt-2">
            <div className="h-1.5 w-12 bg-[#6C5CE7] rounded-full"></div>
          </div>
          <p className="text-[12px] font-black text-[#6C5CE7] mt-4 uppercase tracking-[0.2em] opacity-80">
            Institutional Access Request
          </p>
        </header>

        {error && (
          <div className="mb-6 px-6 py-4 text-[13px] font-bold text-red-600 bg-red-50 border border-red-100 rounded-[20px] text-center animate-bounce">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 px-6 py-4 text-[13px] font-bold text-[#6C5CE7] bg-[#6C5CE7]/5 border border-[#6C5CE7]/20 rounded-[20px] text-center animate-in slide-in-from-top duration-300">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="group flex flex-col gap-2">
              <label className="text-[12px] font-black text-[#2D3436] opacity-50 uppercase tracking-widest ml-1">
                Your Name
              </label>
              <input
                name="requesterName"
                placeholder="Full Name"
                value={form.requesterName}
                onChange={handleChange}
                required
                className="w-full px-5 py-4 text-[14px] font-bold text-[#2D3436] bg-[#F5F6FA] border-2 border-transparent rounded-[20px] outline-none focus:border-[#6C5CE7] focus:bg-white transition-all"
              />
            </div>
            <div className="group flex flex-col gap-2">
              <label className="text-[12px] font-black text-[#2D3436] opacity-50 uppercase tracking-widest ml-1">
                Official Email
              </label>
              <input
                name="requesterEmail"
                type="email"
                placeholder="email@college.edu"
                value={form.requesterEmail}
                onChange={handleChange}
                required
                className="w-full px-5 py-4 text-[14px] font-bold text-[#2D3436] bg-[#F5F6FA] border-2 border-transparent rounded-[20px] outline-none focus:border-[#6C5CE7] focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="group flex flex-col gap-2">
            <label className="text-[12px] font-black text-[#2D3436] opacity-50 uppercase tracking-widest ml-1">
              Phone Number
            </label>
            <input
              name="requesterPhone"
              placeholder="+91 XXXXX XXXXX"
              value={form.requesterPhone}
              onChange={handleChange}
              required
              className="w-full px-5 py-4 text-[14px] font-bold text-[#2D3436] bg-[#F5F6FA] border-2 border-transparent rounded-[20px] outline-none focus:border-[#6C5CE7] focus:bg-white transition-all"
            />
          </div>

          <div className="group flex flex-col gap-2">
            <label className="text-[12px] font-black text-[#2D3436] opacity-50 uppercase tracking-widest ml-1">
              Select Institution
            </label>
            <div className="relative">
              <select
                name="selectedCollege"
                value={form.selectedCollege}
                onChange={handleChange}
                className="w-full px-5 py-4 text-[14px] font-bold text-[#2D3436] bg-[#F5F6FA] border-2 border-transparent rounded-[20px] outline-none focus:border-[#6C5CE7] focus:bg-white transition-all cursor-pointer appearance-none"
              >
                <option value="" disabled>Select College</option>
                {colleges.map((col) => (
                  <option key={col._id} value={col._id}>{col.name}</option>
                ))}
                <option value="other">Other (Not Listed)</option>
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-[#6C5CE7]">
                ▼
              </div>
            </div>
          </div>

          {isOther && (
            <div className="flex flex-col gap-2 p-6 bg-[#F5F6FA] border-2 border-dashed border-[#6C5CE7]/30 rounded-[24px] animate-in fade-in slide-in-from-top duration-500">
              <label className="text-[12px] font-black text-[#6C5CE7] uppercase tracking-widest">
                New Institution Name
              </label>
              <input
                name="collegeName"
                placeholder="Full Institution Name"
                value={form.collegeName}
                onChange={handleChange}
                required
                className="w-full px-5 py-4 text-[14px] font-bold text-[#2D3436] bg-white border-2 border-transparent rounded-[18px] outline-none focus:border-[#6C5CE7] transition-all"
              />
            </div>
          )}

          <div className="group flex flex-col gap-2">
            <label className="text-[12px] font-black text-[#2D3436] opacity-50 uppercase tracking-widest ml-1">
              Address
            </label>
            <input
              name="location"
              placeholder="City, State"
              value={form.location}
              onChange={handleChange}
              required
              className="w-full px-5 py-4 text-[14px] font-bold text-[#2D3436] bg-[#F5F6FA] border-2 border-transparent rounded-[20px] outline-none focus:border-[#6C5CE7] focus:bg-white transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="group flex flex-col gap-2">
              <label className="text-[12px] font-black text-[#2D3436] opacity-50 uppercase tracking-widest ml-1">
                Website
              </label>
              <input
                name="website"
                placeholder="https://college.edu"
                value={form.website}
                onChange={handleChange}
                className="w-full px-5 py-4 text-[14px] font-bold text-[#2D3436] bg-[#F5F6FA] border-2 border-transparent rounded-[20px] outline-none focus:border-[#6C5CE7] focus:bg-white transition-all"
              />
            </div>

            <div className="group flex flex-col gap-2">
              <label className="text-[12px] font-black text-[#2D3436] opacity-50 uppercase tracking-widest ml-1">
                Domain
              </label>
              <input
                name="emailDomain"
                placeholder="college.edu"
                value={form.emailDomain}
                onChange={handleChange}
                className="w-full px-5 py-4 text-[14px] font-bold text-[#2D3436] bg-[#F5F6FA] border-2 border-transparent rounded-[20px] outline-none focus:border-[#6C5CE7] focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 p-6 bg-[#F5F6FA] border-2 border-dashed border-[#F5F6FA] rounded-[24px] text-center hover:border-[#6C5CE7]/30 transition-colors">
            <label className="text-[12px] font-black text-[#2D3436] opacity-50 uppercase tracking-widest">
              Verification Document
            </label>
            <input
              type="file"
              name="verificationDocument"
              onChange={handleChange}
              required
              className="block w-full text-[12px] text-[#2D3436] font-bold 
              file:mr-4 file:py-2.5 file:px-6 file:rounded-[12px] file:border-none 
              file:text-[11px] file:font-black file:uppercase file:bg-[#6C5CE7] 
              file:text-white file:cursor-pointer hover:file:bg-[#2D3436] transition-all"
            />
          </div>

          <div className="pt-6 border-t border-[#F5F6FA]">
            <button
              disabled={loading}
              className="w-full py-5 text-[14px] font-black text-white bg-[#6C5CE7] rounded-[22px] shadow-xl shadow-[#6C5CE7]/20 hover:shadow-[#6C5CE7]/40 hover:-translate-y-1 transition-all active:translate-y-0 disabled:opacity-50 uppercase tracking-widest flex items-center justify-center gap-3"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Submit Registration"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}