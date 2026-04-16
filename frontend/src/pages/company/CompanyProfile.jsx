import React, { useEffect, useState } from "react";
import API from "../../api/api";

export default function CompanyProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [emailDomainError, setEmailDomainError] = useState("");

  const fetchProfile = async () => {
    try {
      const res = await API.get("/company/profile");
      setProfile(res.data.data);
    } catch {
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess("");
        setError("");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));

    if (name === "emailDomain") {
      if (value && !validateEmailDomain(value)) {
        setEmailDomainError("Invalid domain format (e.g., company.com)");
      } else {
        setEmailDomainError("");
      }
    }
  };

  const validateEmailDomain = (domain) => {
    if (!domain) return true;
    const emailDomainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailDomainRegex.test(domain);
  };

  const handleLocationChange = (index, field, value) => {
    const updated = [...(profile.locations || [])];
    updated[index][field] = value;
    setProfile((prev) => ({ ...prev, locations: updated }));
  };

  const addLocation = () => {
    const updated = [...(profile.locations || [])];
    updated.push({ city: "", state: "", country: "" });
    setProfile((prev) => ({ ...prev, locations: updated }));
  };

  const removeLocation = (index) => {
    const updated = [...(profile.locations || [])];
    updated.splice(index, 1);
    setProfile((prev) => ({ ...prev, locations: updated }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (profile.emailDomain && !validateEmailDomain(profile.emailDomain)) {
      setEmailDomainError("Invalid email domain format");
      return;
    }
    setSaving(true);
    setError("");
    setSuccess("");
    setEmailDomainError("");

    try {
      let res;
      if (logoFile) {
        const formData = new FormData();
        formData.append("name", profile.name || "");
        formData.append("website", profile.website || "");
        formData.append("industry", profile.industry || "");
        formData.append("companySize", profile.companySize || "");
        formData.append("description", profile.description || "");
        formData.append("emailDomain", profile.emailDomain || "");
        formData.append("locations", JSON.stringify(profile.locations || []));
        formData.append("logo", logoFile);

        res = await API.patch("/company/profile", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        const payload = {
          name: profile.name || "",
          website: profile.website || "",
          industry: profile.industry || "",
          companySize: profile.companySize || "",
          description: profile.description || "",
          emailDomain: profile.emailDomain || "",
          locations: profile.locations || [],
        };
        res = await API.patch("/company/profile", payload);
      }
      setProfile(res.data.data);
      setSuccess("Profile updated successfully!");
      setLogoFile(null);
    } catch {
      setError("Update failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !profile) {
    return (
      <div className="h-screen bg-[#F5F6FA] flex items-center justify-center font-['Nunito']">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#6C5CE7] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[16px] font-bold text-[#2D3436]">Loading Profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F6FA] text-[#2D3436] flex flex-col p-4 md:p-8 font-['Nunito'] overflow-x-hidden">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="text-center md:text-left">
          <h1 className="text-[32px] font-extrabold text-[#2D3436] m-0 tracking-tight">
            Company Settings
          </h1>
          <p className="text-[14px] font-semibold text-[#636E72] m-0 mt-1 uppercase tracking-widest">
            Manage your organization profile
          </p>
        </div>
        
        {/* Alerts */}
        <div className="flex flex-col gap-2 min-w-[240px]">
          {success && (
            <div className="px-4 py-3 bg-[#e3f9e5] border-l-4 border-[#00b894] rounded-r-lg shadow-md animate-in slide-in-from-right-full">
              <span className="text-[12px] font-extrabold text-[#00b894] uppercase tracking-wider">
                ✓ {success}
              </span>
            </div>
          )}
          {error && (
            <div className="px-4 py-3 bg-[#fff0f0] border-l-4 border-[#d63031] rounded-r-lg shadow-md animate-in slide-in-from-right-full">
              <span className="text-[12px] font-extrabold text-[#d63031] uppercase tracking-wider">
                ✕ {error}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Form Area */}
      <form onSubmit={handleSubmit} className="flex-1 max-w-5xl mx-auto w-full flex flex-col gap-8 pb-10">
        
        {/* CARD 1: Brand & Identity */}
        <div className="bg-[#FFFFFF] rounded-2xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(108,92,231,0.08)] transition-all duration-500 border border-transparent hover:border-[#6C5CE7]/10 animate-in fade-in slide-in-from-bottom-6 delay-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-6 bg-[#6C5CE7] rounded-full"></div>
            <h2 className="text-[16px] font-extrabold text-[#2D3436] uppercase tracking-wider">
              Brand & Identity
            </h2>
          </div>
          
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            {/* Logo Section */}
            <div className="flex flex-col items-center gap-4 group">
              <div className="relative w-32 h-32 bg-[#F5F6FA] rounded-2xl overflow-hidden flex items-center justify-center border-2 border-dashed border-[#6C5CE7]/30 group-hover:border-[#6C5CE7] transition-colors shadow-inner">
                {profile.logoUrl ? (
                  <img src={profile.logoUrl} alt="logo" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                ) : (
                  <div className="text-[48px] font-black text-[#6C5CE7]/20 group-hover:text-[#6C5CE7]/40 transition-colors">
                    {profile.name?.charAt(0) || "?"}
                  </div>
                )}
              </div>
              
              <label className="cursor-pointer group/btn w-full">
                <input type="file" className="hidden" accept="image/*" onChange={(e) => setLogoFile(e.target.files[0])} />
                <div className="px-4 py-2 bg-[#F5F6FA] text-[#6C5CE7] text-[11px] font-extrabold uppercase tracking-widest rounded-xl hover:bg-[#6C5CE7] hover:text-white transition-all duration-300 border border-[#6C5CE7]/20 text-center shadow-sm">
                  Upload Logo
                </div>
              </label>
              {logoFile && <p className="text-[10px] font-bold text-[#636E72] mt-[-8px] animate-pulse">{logoFile.name}</p>}
            </div>

            {/* Inputs Grid */}
            <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[12px] font-bold text-[#636E72] ml-1">Company Name</label>
                <input
                  name="name"
                  value={profile.name || ""}
                  onChange={handleChange}
                  className="w-full px-5 py-3.5 text-[15px] font-semibold text-[#2D3436] bg-[#F5F6FA] border-2 border-transparent rounded-xl focus:border-[#6C5CE7] focus:bg-white transition-all duration-300 outline-none"
                  placeholder="Acme Corp"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[12px] font-bold text-[#636E72] ml-1">Website URL</label>
                <input
                  name="website"
                  value={profile.website || ""}
                  onChange={handleChange}
                  className="w-full px-5 py-3.5 text-[15px] font-semibold text-[#2D3436] bg-[#F5F6FA] border-2 border-transparent rounded-xl focus:border-[#6C5CE7] focus:bg-white transition-all duration-300 outline-none"
                  placeholder="https://company.com"
                />
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: Business Details */}
        <div className="bg-[#FFFFFF] rounded-2xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(108,92,231,0.08)] transition-all duration-500 border border-transparent hover:border-[#6C5CE7]/10 animate-in fade-in slide-in-from-bottom-6 delay-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-6 bg-[#6C5CE7] rounded-full"></div>
            <h2 className="text-[16px] font-extrabold text-[#2D3436] uppercase tracking-wider">
              Business Intelligence
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[12px] font-bold text-[#636E72] ml-1">Industry Sector</label>
              <input
                name="industry"
                value={profile.industry || ""}
                onChange={handleChange}
                className="w-full px-5 py-3.5 text-[15px] font-semibold text-[#2D3436] bg-[#F5F6FA] border-2 border-transparent rounded-xl focus:border-[#6C5CE7] focus:bg-white transition-all outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[12px] font-bold text-[#636E72] ml-1">Company Size</label>
              <input
                name="companySize"
                value={profile.companySize || ""}
                onChange={handleChange}
                className="w-full px-5 py-3.5 text-[15px] font-semibold text-[#2D3436] bg-[#F5F6FA] border-2 border-transparent rounded-xl focus:border-[#6C5CE7] focus:bg-white transition-all outline-none"
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-[12px] font-bold text-[#636E72] ml-1">Verified Email Domain</label>
              <input
                name="emailDomain"
                value={profile.emailDomain || ""}
                onChange={handleChange}
                className={`w-full px-5 py-3.5 text-[15px] font-semibold text-[#2D3436] bg-[#F5F6FA] border-2 rounded-xl transition-all outline-none ${
                  emailDomainError ? "border-[#d63031]" : "border-transparent focus:border-[#6C5CE7] focus:bg-white"
                }`}
              />
              {emailDomainError && <p className="text-[11px] font-bold text-[#d63031] ml-1">{emailDomainError}</p>}
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-[12px] font-bold text-[#636E72] ml-1">About Company</label>
              <textarea
                name="description"
                rows={4}
                value={profile.description || ""}
                onChange={handleChange}
                className="w-full px-5 py-3.5 text-[15px] font-semibold text-[#2D3436] bg-[#F5F6FA] border-2 border-transparent rounded-xl focus:border-[#6C5CE7] focus:bg-white transition-all outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* CARD 3: Office Locations */}
        <div className="bg-[#FFFFFF] rounded-2xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-transparent hover:border-[#6C5CE7]/10 animate-in fade-in slide-in-from-bottom-6 delay-300">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-6 bg-[#6C5CE7] rounded-full"></div>
              <h2 className="text-[16px] font-extrabold text-[#2D3436] uppercase tracking-wider">
                Global Offices
              </h2>
            </div>
            <button
              type="button"
              onClick={addLocation}
              className="px-6 py-2.5 text-[12px] font-extrabold text-white bg-[#6C5CE7] rounded-xl hover:shadow-lg hover:shadow-[#6C5CE7]/30 transform active:scale-95 transition-all uppercase tracking-widest"
            >
              + Add New Location
            </button>
          </div>

          <div className="grid gap-4">
            {profile.locations && profile.locations.length > 0 ? (
              profile.locations.map((loc, index) => (
                <div key={index} className="group flex flex-col md:flex-row gap-4 p-5 bg-[#F5F6FA] rounded-2xl border-2 border-transparent hover:border-[#6C5CE7]/20 hover:bg-white transition-all duration-300">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-[#6C5CE7] uppercase ml-1">City</p>
                      <input
                        placeholder="e.g. Pune"
                        value={loc.city || ""}
                        onChange={(e) => handleLocationChange(index, "city", e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-[#dfe6e9] rounded-lg text-[14px] font-bold focus:border-[#6C5CE7] outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-[#6C5CE7] uppercase ml-1">State</p>
                      <input
                        placeholder="e.g. Maharashtra"
                        value={loc.state || ""}
                        onChange={(e) => handleLocationChange(index, "state", e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-[#dfe6e9] rounded-lg text-[14px] font-bold focus:border-[#6C5CE7] outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-[#6C5CE7] uppercase ml-1">Country</p>
                      <input
                        placeholder="e.g. India"
                        value={loc.country || ""}
                        onChange={(e) => handleLocationChange(index, "country", e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-[#dfe6e9] rounded-lg text-[14px] font-bold focus:border-[#6C5CE7] outline-none transition-all"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeLocation(index)}
                    className="self-center px-5 py-2.5 text-[12px] font-black text-[#d63031] hover:bg-[#fff0f0] rounded-xl transition-colors border border-transparent hover:border-[#d63031]/20"
                  >
                    Delete
                  </button>
                </div>
              ))
            ) : (
              <div className="py-12 flex flex-col items-center justify-center bg-[#F5F6FA] rounded-2xl border-2 border-dashed border-[#dfe6e9]">
                <p className="text-[14px] font-bold text-[#636E72]">No office locations listed yet.</p>
              </div>
            )}
          </div>
        </div>
      </form>

      {/* Persistent Action Bar */}
      <div className="sticky bottom-4 left-0 right-0 max-w-5xl mx-auto w-full px-4 md:px-0">
        <div className="bg-[#2D3436] rounded-2xl p-4 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-4 animate-in slide-in-from-bottom-8">
          <p className="text-[#F5F6FA]/60 text-[13px] font-bold hidden md:block">
            Don't forget to save your latest changes to stay updated.
          </p>
          <button
            onClick={handleSubmit}
            disabled={saving || !!emailDomainError}
            className="w-full md:w-auto px-10 py-3.5 bg-[#6C5CE7] text-white text-[13px] font-black uppercase tracking-widest rounded-xl hover:bg-[#5b4cc4] transform hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale shadow-[0_4px_15px_rgba(108,92,231,0.4)]"
          >
            {saving ? (
               <div className="flex items-center gap-2">
                 <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                 Updating...
               </div>
            ) : "Save All Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}