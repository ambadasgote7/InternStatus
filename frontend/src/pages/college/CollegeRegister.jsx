import React, { useEffect, useState } from "react";
import API from "../../api/api";
import { motion, AnimatePresence } from "framer-motion"; // Added for stunning UI feel

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

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "verificationDocument") {
      setForm((prev) => ({ ...prev, verificationDocument: files[0] }));
      return;
    }
    if (name === "selectedCollege") {
      if (value === "other") {
        setIsOther(true);
        setForm((prev) => ({ ...prev, selectedCollege: "", collegeName: "" }));
      } else {
        setIsOther(false);
        setForm((prev) => ({ ...prev, selectedCollege: value, collegeName: "" }));
      }
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
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
      formData.append("location", form.location);
      if (form.website) formData.append("website", form.website);
      if (form.emailDomain) formData.append("emailDomain", form.emailDomain);
      if (isOther) {
        if (!form.collegeName.trim()) throw new Error("College name is required");
        formData.append("collegeName", form.collegeName.trim());
      } else {
        if (!form.selectedCollege) throw new Error("Please select a college");
        formData.append("selectedCollege", form.selectedCollege);
      }
      if (!form.verificationDocument) throw new Error("Verification document required");
      formData.append("verificationDocument", form.verificationDocument);

      await API.post("/onboarding/college", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess("Request submitted successfully. Please wait for admin approval.");
      setForm({
        requesterName: "", requesterEmail: "", requesterPhone: "",
        selectedCollege: "", collegeName: "", location: "",
        website: "", emailDomain: "", verificationDocument: null,
      });
      setIsOther(false);
    } catch (err) {
      setError(err.message || err.response?.data?.message || "Error submitting request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#FFFFFF] p-4 sm:p-8 lg:p-12 font-['Nunito'] text-[#2D3436]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl bg-white p-8 sm:p-12 md:p-16 rounded-[2rem] shadow-[0_20px_50px_rgba(108,92,231,0.1)] border border-[#F5F6FA]"
      >
        <header className="text-center mb-10">
          <h2 className="text-4xl font-extrabold tracking-tight mb-3">
            Register <span className="text-[#6C5CE7]">College</span>
          </h2>
          <p className="text-[#2D3436] opacity-70 font-medium">Join our academic ecosystem today.</p>
        </header>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-600 font-bold rounded-r-lg">
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6 p-4 bg-[#F5F6FA] border-l-4 border-[#6C5CE7] text-[#6C5CE7] font-bold rounded-r-lg">
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold ml-1 opacity-80 text-[#2D3436]">Requester Name</label>
            <input name="requesterName" value={form.requesterName} onChange={handleChange} placeholder="John Doe" required className="input-field"/>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold ml-1 opacity-80 text-[#2D3436]">Email Address</label>
            <input name="requesterEmail" type="email" value={form.requesterEmail} onChange={handleChange} placeholder="john@university.edu" required className="input-field"/>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold ml-1 opacity-80 text-[#2D3436]">Phone Number</label>
            <input name="requesterPhone" value={form.requesterPhone} onChange={handleChange} placeholder="+91 98765 43210" required className="input-field"/>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold ml-1 opacity-80 text-[#2D3436]">Select Institution</label>
            <select
              name="selectedCollege"
              value={form.selectedCollege || (isOther ? "other" : "")}
              onChange={handleChange}
              className="input-field appearance-none cursor-pointer"
            >
              <option value="" disabled>Select College</option>
              {colleges.map((col) => (
                <option key={col._id} value={col._id}>{col.name}</option>
              ))}
              <option value="other">Other (Add New)</option>
            </select>
          </div>

          <AnimatePresence>
            {isOther && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="md:col-span-2 space-y-2">
                <label className="text-sm font-bold ml-1 text-[#6C5CE7]">New College Name</label>
                <input name="collegeName" value={form.collegeName} onChange={handleChange} placeholder="Enter Full College Name" required className="input-field border-[#6C5CE7] bg-white"/>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2">
            <label className="text-sm font-bold ml-1 opacity-80 text-[#2D3436]">Location</label>
            <input name="location" value={form.location} onChange={handleChange} placeholder="City, State" required className="input-field"/>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold ml-1 opacity-80 text-[#2D3436]">Website (Optional)</label>
            <input name="website" value={form.website} onChange={handleChange} placeholder="https://..." className="input-field"/>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold ml-1 opacity-80 text-[#2D3436]">Email Domain</label>
            <input name="emailDomain" value={form.emailDomain} onChange={handleChange} placeholder="@college.edu" className="input-field"/>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold ml-1 opacity-80 text-[#2D3436]">Verification Document</label>
            <div className="relative">
                <input type="file" name="verificationDocument" onChange={handleChange} required className="input-field file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#6C5CE7] file:text-white hover:file:bg-[#5a4bc4]"/>
            </div>
          </div>

          <div className="md:col-span-2 pt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className={`w-full py-4 bg-[#6C5CE7] text-white rounded-2xl font-black text-lg shadow-[0_10px_20px_rgba(108,92,231,0.3)] transition-all duration-300 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#5a4bc4]'}`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                   <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                   Processing...
                </span>
              ) : "Submit Registration Request"}
            </motion.button>
          </div>
        </form>
      </motion.div>

      <style jsx="true">{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        
        .input-field {
          width: 100%;
          padding: 14px 20px;
          border-radius: 16px;
          background: #F5F6FA;
          border: 2px solid transparent;
          font-weight: 600;
          color: #2D3436;
          outline: none;
          transition: all 0.3s ease;
        }

        .input-field:focus {
          border-color: #6C5CE7;
          background: #FFFFFF;
          box-shadow: 0 0 0 4px rgba(108, 92, 231, 0.1);
        }

        .input-field::placeholder {
          color: #A4A6B3;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}