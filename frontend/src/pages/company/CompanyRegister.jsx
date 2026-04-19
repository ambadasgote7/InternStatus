import React, { useEffect, useState } from "react";
import API from "../../api/api";

export default function CompanyRegister() {
  const [companies, setCompanies] = useState([]);

  const [form, setForm] = useState({
    requesterName: "",
    requesterEmail: "",
    requesterPhone: "", // Added phone number field
    selectedCompany: "",
    companyName: "",
    city: "",
    state: "",
    country: "",
    website: "",
    emailDomain: "",
    industry: "",
    companySize: "",
    verificationDocument: null,
  });

  const [loading, setLoading] = useState(false);
  const [isOther, setIsOther] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await API.get("/company/list");
        setCompanies(res.data.data || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCompanies();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "verificationDocument") {
      setForm((prev) => ({
        ...prev,
        verificationDocument: files[0],
      }));
      return;
    }

    if (name === "selectedCompany") {
      if (value === "other") {
        setIsOther(true);
        setForm((prev) => ({
          ...prev,
          selectedCompany: "",
          companyName: "",
        }));
      } else {
        setIsOther(false);
        setForm((prev) => ({
          ...prev,
          selectedCompany: value,
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

      // Basic Details
      formData.append("requesterName", form.requesterName);
      formData.append("requesterEmail", form.requesterEmail);
      formData.append("requesterPhone", form.requesterPhone); // Appending phone number

      // Company Logic
      if (form.selectedCompany) {
        formData.append("selectedCompany", form.selectedCompany);
      }
      if (isOther) {
        formData.append("companyName", form.companyName);
      }

      // Metadata
      formData.append("website", form.website);
      formData.append("emailDomain", form.emailDomain);
      formData.append("industry", form.industry);
      formData.append("companySize", form.companySize);

      const locations = [
        {
          city: form.city,
          state: form.state,
          country: form.country,
        },
      ];
      formData.append("locations", JSON.stringify(locations));

      if (form.verificationDocument) {
        formData.append("verificationDocument", form.verificationDocument);
      }

      await API.post("/onboarding/company", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess("Company request submitted. Please wait for admin approval.");
      
      // Reset Form
      setForm({
        requesterName: "",
        requesterEmail: "",
        requesterPhone: "",
        selectedCompany: "",
        companyName: "",
        city: "",
        state: "",
        country: "",
        website: "",
        emailDomain: "",
        industry: "",
        companySize: "",
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
    <div className="min-h-screen flex items-center justify-center bg-[#FFFFFF] p-4 sm:p-6 md:p-10 font-['Nunito'] text-[#2D3436] selection:bg-[#6C5CE7]/20">
      
      {/* Top Accent Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-[#6C5CE7]"></div>
      
      <div className="w-full max-w-3xl bg-white p-6 sm:p-10 md:p-14 rounded-[32px] shadow-[0_20px_50px_rgba(108,92,231,0.1)] border border-[#F5F6FA] animate-in fade-in slide-in-from-bottom-6 duration-700">
        
        <header className="mb-10 text-left">
          <h2 className="text-3xl md:text-4xl font-black text-[#2D3436] tracking-tight mb-3">
            Company <span className="text-[#6C5CE7]">Register</span>
          </h2>
          <p className="text-[#2D3436]/50 font-bold text-xs uppercase tracking-[0.2em]">
            Company Registration Portal
          </p>
        </header>

        {error && (
          <div className="mb-8 px-5 py-4 text-sm font-bold text-red-600 bg-red-50 border border-red-100 rounded-2xl animate-shake">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-8 px-5 py-4 text-sm font-bold text-[#6C5CE7] bg-[#6C5CE7]/5 border border-[#6C5CE7]/20 rounded-2xl animate-in fade-in duration-500">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section 1: Requester Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2 group">
              <label className="text-[11px] font-black text-[#2D3436]/40 uppercase tracking-widest ml-1 group-focus-within:text-[#6C5CE7] transition-colors">
                Your Full Name
              </label>
              <input
                name="requesterName"
                placeholder="Ex: Jane Cooper"
                value={form.requesterName}
                onChange={handleChange}
                required
                className="w-full px-5 py-4 text-[14px] font-bold text-[#2D3436] bg-[#F5F6FA] border-2 border-transparent rounded-2xl outline-none focus:border-[#6C5CE7] focus:bg-white transition-all duration-300"
              />
            </div>

            <div className="flex flex-col gap-2 group">
              <label className="text-[11px] font-black text-[#2D3436]/40 uppercase tracking-widest ml-1 group-focus-within:text-[#6C5CE7] transition-colors">
                Official Email
              </label>
              <input
                name="requesterEmail"
                type="email"
                placeholder="jane@company.com"
                value={form.requesterEmail}
                onChange={handleChange}
                required
                className="w-full px-5 py-4 text-[14px] font-bold text-[#2D3436] bg-[#F5F6FA] border-2 border-transparent rounded-2xl outline-none focus:border-[#6C5CE7] focus:bg-white transition-all duration-300"
              />
            </div>
          </div>

          {/* New Row: Phone Number (Full Width or Grid) */}
          <div className="flex flex-col gap-2 group">
            <label className="text-[11px] font-black text-[#2D3436]/40 uppercase tracking-widest ml-1 group-focus-within:text-[#6C5CE7] transition-colors">
              Phone Number
            </label>
            <input
              name="requesterPhone"
              type="tel"
              placeholder="Ex: +91 9876543210"
              value={form.requesterPhone}
              onChange={handleChange}
              required
              className="w-full px-5 py-4 text-[14px] font-bold text-[#2D3436] bg-[#F5F6FA] border-2 border-transparent rounded-2xl outline-none focus:border-[#6C5CE7] focus:bg-white transition-all duration-300"
            />
          </div>

          {/* Section 2: Company Selection */}
          <div className="flex flex-col gap-2 group">
            <label className="text-[11px] font-black text-[#2D3436]/40 uppercase tracking-widest ml-1 group-focus-within:text-[#6C5CE7] transition-colors">
              Select Company
            </label>
            <div className="relative">
              <select
                name="selectedCompany"
                value={form.selectedCompany}
                onChange={handleChange}
                className="w-full px-5 py-4 text-[14px] font-bold text-[#2D3436] bg-[#F5F6FA] border-2 border-transparent rounded-2xl outline-none focus:border-[#6C5CE7] focus:bg-white transition-all duration-300 appearance-none cursor-pointer"
              >
                <option value="" disabled>Choose an existing company</option>
                {companies.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
                <option value="other">New Company (Add manually)</option>
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-[#6C5CE7] font-bold">
                ↓
              </div>
            </div>
          </div>

          {isOther && (
            <div className="flex flex-col gap-2 p-6 bg-[#6C5CE7]/5 rounded-[24px] border-2 border-dashed border-[#6C5CE7]/20 animate-in slide-in-from-top-4 duration-500">
              <label className="text-[11px] font-black text-[#6C5CE7] uppercase tracking-widest">
                New Company Name
              </label>
              <input
                name="companyName"
                placeholder="Full Registered Name"
                value={form.companyName}
                onChange={handleChange}
                required
                className="w-full px-5 py-4 text-[14px] font-bold text-[#2D3436] bg-white border-2 border-transparent rounded-xl outline-none focus:border-[#6C5CE7] transition-all"
              />
            </div>
          )}

          {/* Section 3: Address Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="flex flex-col gap-2 group">
              <label className="text-[11px] font-black text-[#2D3436]/40 uppercase tracking-widest ml-1 group-focus-within:text-[#6C5CE7] transition-colors">
                City
              </label>
              <input
                name="city"
                placeholder="Pune"
                value={form.city}
                onChange={handleChange}
                required
                className="w-full px-5 py-4 text-[14px] font-bold text-[#2D3436] bg-[#F5F6FA] border-2 border-transparent rounded-2xl outline-none focus:border-[#6C5CE7] focus:bg-white transition-all duration-300"
              />
            </div>
            <div className="flex flex-col gap-2 group">
              <label className="text-[11px] font-black text-[#2D3436]/40 uppercase tracking-widest ml-1 group-focus-within:text-[#6C5CE7] transition-colors">
                State
              </label>
              <input
                name="state"
                placeholder="Maharashtra"
                value={form.state}
                onChange={handleChange}
                required
                className="w-full px-5 py-4 text-[14px] font-bold text-[#2D3436] bg-[#F5F6FA] border-2 border-transparent rounded-2xl outline-none focus:border-[#6C5CE7] focus:bg-white transition-all duration-300"
              />
            </div>
            <div className="flex flex-col gap-2 group">
              <label className="text-[11px] font-black text-[#2D3436]/40 uppercase tracking-widest ml-1 group-focus-within:text-[#6C5CE7] transition-colors">
                Country
              </label>
              <input
                name="country"
                placeholder="India"
                value={form.country}
                onChange={handleChange}
                required
                className="w-full px-5 py-4 text-[14px] font-bold text-[#2D3436] bg-[#F5F6FA] border-2 border-transparent rounded-2xl outline-none focus:border-[#6C5CE7] focus:bg-white transition-all duration-300"
              />
            </div>
          </div>

          {/* Section 4: Online Presence */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-2 group">
              <label className="text-[11px] font-black text-[#2D3436]/40 uppercase tracking-widest ml-1 group-focus-within:text-[#6C5CE7] transition-colors">
                Website
              </label>
              <input
                name="website"
                placeholder="https://company.com"
                value={form.website}
                onChange={handleChange}
                className="w-full px-5 py-4 text-[14px] font-bold text-[#2D3436] bg-[#F5F6FA] border-2 border-transparent rounded-2xl outline-none focus:border-[#6C5CE7] focus:bg-white transition-all duration-300"
              />
            </div>
            <div className="flex flex-col gap-2 group">
              <label className="text-[11px] font-black text-[#2D3436]/40 uppercase tracking-widest ml-1 group-focus-within:text-[#6C5CE7] transition-colors">
                Email Domain
              </label>
              <input
                name="emailDomain"
                placeholder="company.com"
                value={form.emailDomain}
                onChange={handleChange}
                className="w-full px-5 py-4 text-[14px] font-bold text-[#2D3436] bg-[#F5F6FA] border-2 border-transparent rounded-2xl outline-none focus:border-[#6C5CE7] focus:bg-white transition-all duration-300"
              />
            </div>
          </div>

          {/* Section 5: Industry Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-2 group">
              <label className="text-[11px] font-black text-[#2D3436]/40 uppercase tracking-widest ml-1 group-focus-within:text-[#6C5CE7] transition-colors">
                Industry
              </label>
              <input
                name="industry"
                placeholder="Software / Fintech"
                value={form.industry}
                onChange={handleChange}
                className="w-full px-5 py-4 text-[14px] font-bold text-[#2D3436] bg-[#F5F6FA] border-2 border-transparent rounded-2xl outline-none focus:border-[#6C5CE7] focus:bg-white transition-all duration-300"
              />
            </div>
            <div className="flex flex-col gap-2 group">
              <label className="text-[11px] font-black text-[#2D3436]/40 uppercase tracking-widest ml-1 group-focus-within:text-[#6C5CE7] transition-colors">
                Size
              </label>
              <input
                name="companySize"
                placeholder="e.g. 50-200"
                value={form.companySize}
                onChange={handleChange}
                className="w-full px-5 py-4 text-[14px] font-bold text-[#2D3436] bg-[#F5F6FA] border-2 border-transparent rounded-2xl outline-none focus:border-[#6C5CE7] focus:bg-white transition-all duration-300"
              />
            </div>
          </div>

          {/* Section 6: Upload Area */}
          <div className="flex flex-col gap-3 p-8 bg-[#F5F6FA] rounded-[24px] border-2 border-dashed border-[#6C5CE7]/10 hover:border-[#6C5CE7]/40 transition-all duration-300 group cursor-pointer text-center relative overflow-hidden">
            <label className="text-[11px] font-black text-[#2D3436]/40 uppercase tracking-widest group-hover:text-[#6C5CE7] transition-colors">
              Registration Document (PDF/Image)
            </label>
            <input
              type="file"
              name="verificationDocument"
              onChange={handleChange}
              required
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="flex flex-col items-center gap-2">
              <span className="text-2xl">📄</span>
              <p className="text-[13px] font-black text-[#2D3436]/60">
                {form.verificationDocument ? form.verificationDocument.name : "Drag & drop or browse files"}
              </p>
            </div>
          </div>

          {/* Section 7: Action Button */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 text-sm font-black text-white bg-[#6C5CE7] rounded-2xl shadow-[0_12px_24px_-8px_rgba(108,92,231,0.5)] hover:shadow-[0_18px_32px_-8px_rgba(108,92,231,0.6)] hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:translate-y-0 transition-all duration-300 uppercase tracking-[0.2em] flex items-center justify-center gap-4"
            >
              {loading && (
                <span className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></span>
              )}
              {loading ? "Processing..." : "Submit Registration"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}