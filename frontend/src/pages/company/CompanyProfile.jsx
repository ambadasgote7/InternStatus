import React, { useEffect, useState } from "react";
import API from "../../api/api";

export default function CompanyProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [logoFile, setLogoFile] = useState(null);

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
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
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
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      let res;

      if (logoFile) {
        const formData = new FormData();
        formData.append("name", profile.name || "");
        formData.append("website", profile.website || "");
        formData.append("industry", profile.industry || "");
        formData.append("companySize", profile.companySize || "");
        formData.append("description", profile.description || "");
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] flex flex-col font-sans">
        <AdminNavBar />
        <div className="flex-grow flex items-center justify-center">
          <p className="text-[14px] font-bold text-[#333] animate-pulse">
            Loading Profile...
          </p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] flex flex-col font-sans">
        <AdminNavBar />
        <div className="flex-grow flex items-center justify-center p-4">
          <div className="bg-[#fff] border-2 border-dashed border-[#e5e5e5] rounded-[20px] p-10 text-center">
            <p className="text-[13px] font-bold text-[#333] opacity-60 m-0">
              No profile found
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#333] flex flex-col font-sans pb-10">
      <AdminNavBar />

      <main className="max-w-6xl mx-auto w-full px-4 md:px-6 py-6 flex flex-col md:flex-row gap-6">
        <aside className="w-full md:w-[320px] flex-shrink-0 flex flex-col gap-6">
          <div className="bg-[#fff] border border-[#e5e5e5] rounded-[20px] p-6 shadow-sm flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-[#f9f9f9] border border-[#e5e5e5] rounded-[20px] overflow-hidden flex items-center justify-center mb-4">
              {profile.logoUrl ? (
                <img
                  src={profile.logoUrl}
                  alt="logo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-[32px] font-black text-[#333]">
                  {profile.name?.charAt(0)}
                </div>
              )}
            </div>
            <h2 className="text-[20px] font-black text-[#333] m-0 leading-tight mb-2">
              {profile.name}
            </h2>
            <span className="px-3 py-1 text-[10px] font-black text-[#fff] bg-[#111] rounded-[10px] uppercase tracking-widest">
              {profile.status}
            </span>
          </div>

          <div className="bg-[#fff] border border-[#e5e5e5] rounded-[20px] p-5 shadow-sm flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-bold text-[#333] opacity-50 uppercase tracking-widest">
                Email Domain
              </span>
              <span className="text-[13px] font-bold">
                {profile.emailDomain || "—"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-bold text-[#333] opacity-50 uppercase tracking-widest">
                Approved On
              </span>
              <span className="text-[13px] font-bold">
                {profile.approvedAt
                  ? new Date(profile.approvedAt).toLocaleDateString("en-IN")
                  : "—"}
              </span>
            </div>
          </div>
        </aside>

        <section className="flex-1 flex flex-col gap-6">
          <div className="bg-[#fff] border border-[#e5e5e5] rounded-[20px] p-6 md:p-8 shadow-sm">
            <header className="mb-8 border-b border-[#e5e5e5] pb-4">
              <h1 className="text-[23px] font-black text-[#333] m-0 tracking-tight leading-tight">
                Company Profile
              </h1>
              <p className="text-[13px] font-bold text-[#333] opacity-60 m-0 mt-1 uppercase tracking-widest">
                Identity and Infrastructure Settings
              </p>
            </header>

            <form onSubmit={handleSubmit} className="flex flex-col gap-8">
              {error && (
                <div className="px-4 py-3 text-[12px] font-bold text-[#cc0000] bg-[#fff] border border-[#cc0000] rounded-[14px] uppercase tracking-widest text-center">
                  {error}
                </div>
              )}
              {success && (
                <div className="px-4 py-3 text-[12px] font-bold text-[#008000] bg-[#fff] border border-[#008000] rounded-[14px] uppercase tracking-widest text-center">
                  {success}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                    Company Name
                  </label>
                  <input
                    name="name"
                    value={profile.name || ""}
                    onChange={handleChange}
                    placeholder="Acme Corp"
                    className="w-full px-4 py-3 text-[13px] text-[#333] bg-[#fff] border border-[#333] rounded-[14px] outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                    Website
                  </label>
                  <input
                    name="website"
                    value={profile.website || ""}
                    onChange={handleChange}
                    placeholder="https://acme.com"
                    className="w-full px-4 py-3 text-[13px] text-[#333] bg-[#fff] border border-[#333] rounded-[14px] outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                    Industry
                  </label>
                  <input
                    name="industry"
                    value={profile.industry || ""}
                    onChange={handleChange}
                    placeholder="Technology"
                    className="w-full px-4 py-3 text-[13px] text-[#333] bg-[#fff] border border-[#333] rounded-[14px] outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                    Company Size
                  </label>
                  <input
                    name="companySize"
                    value={profile.companySize || ""}
                    onChange={handleChange}
                    placeholder="50-200"
                    className="w-full px-4 py-3 text-[13px] text-[#333] bg-[#fff] border border-[#333] rounded-[14px] outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={3}
                  value={profile.description || ""}
                  onChange={handleChange}
                  placeholder="Overview..."
                  className="w-full px-4 py-3 text-[13px] text-[#333] bg-[#fff] border border-[#333] rounded-[14px] outline-none resize-y"
                />
              </div>

              <div className="flex flex-col gap-4 pt-6 border-t border-[#e5e5e5]">
                <div className="flex justify-between items-center">
                  <h3 className="text-[11px] font-bold text-[#333] opacity-50 m-0 uppercase tracking-widest">
                    Office Locations
                  </h3>
                  <button
                    type="button"
                    onClick={addLocation}
                    className="px-4 py-2 text-[11px] font-bold text-[#333] bg-[#f9f9f9] border border-[#e5e5e5] rounded-[12px] hover:border-[#333] transition-colors cursor-pointer uppercase tracking-widest"
                  >
                    Add Location
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  {profile.locations?.map((loc, index) => (
                    <div
                      key={index}
                      className="flex flex-col md:flex-row gap-3 bg-[#f9f9f9] p-4 rounded-[14px] border border-[#e5e5e5] relative group"
                    >
                      <div className="flex-1 flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-[#333] opacity-50 uppercase">
                          City
                        </span>
                        <input
                          placeholder="Pune"
                          value={loc.city || ""}
                          onChange={(e) =>
                            handleLocationChange(index, "city", e.target.value)
                          }
                          className="bg-transparent border-none text-[13px] font-bold text-[#333] outline-none p-0"
                        />
                      </div>
                      <div className="flex-1 flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-[#333] opacity-50 uppercase">
                          State
                        </span>
                        <input
                          placeholder="Maharashtra"
                          value={loc.state || ""}
                          onChange={(e) =>
                            handleLocationChange(index, "state", e.target.value)
                          }
                          className="bg-transparent border-none text-[13px] font-bold text-[#333] outline-none p-0"
                        />
                      </div>
                      <div className="flex-1 flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-[#333] opacity-50 uppercase">
                          Country
                        </span>
                        <input
                          placeholder="India"
                          value={loc.country || ""}
                          onChange={(e) =>
                            handleLocationChange(
                              index,
                              "country",
                              e.target.value,
                            )
                          }
                          className="bg-transparent border-none text-[13px] font-bold text-[#333] outline-none p-0"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeLocation(index)}
                        className="text-[10px] font-black text-[#cc0000] border-none bg-transparent cursor-pointer uppercase tracking-widest self-end md:self-center"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-6 border-t border-[#e5e5e5]">
                <label className="text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                  Update Logo
                </label>
                <div className="border-2 border-dashed border-[#e5e5e5] rounded-[20px] p-6 text-center cursor-pointer hover:border-[#333] transition-colors relative">
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    accept="image/*"
                    onChange={(e) => setLogoFile(e.target.files[0])}
                  />
                  <p className="text-[13px] font-bold text-[#333] m-0">
                    {logoFile
                      ? `Selected: ${logoFile.name}`
                      : "Click to upload company logo"}
                  </p>
                  <p className="text-[11px] font-bold text-[#333] opacity-40 uppercase mt-1">
                    PNG, JPG, SVG (Max 2MB)
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-[#e5e5e5] flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full md:w-auto px-10 py-3.5 text-[13px] font-bold text-[#fff] bg-[#111] border-none rounded-[14px] cursor-pointer hover:opacity-80 transition-opacity disabled:opacity-50 uppercase tracking-widest"
                >
                  {saving ? "Saving Changes..." : "Save Profile Changes"}
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
