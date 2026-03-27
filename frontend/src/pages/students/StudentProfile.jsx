import React, { useEffect, useState, useRef } from "react";
import API from "../../api/api";

export default function StudentProfile() {
  const [profile, setProfile] = useState(null);
  const [skillsInput, setSkillsInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await API.get("/users/student/profile");
      let data = res.data.data;
      if (typeof data.skills === "string") {
        try {
          data.skills = JSON.parse(data.skills);
        } catch {
          data.skills = [];
        }
      }
      setProfile(data);
      setSkillsInput((data.skills || []).join(", "));
    } catch {
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSkillsChange = (e) => {
    setSkillsInput(e.target.value);
  };

  const handleResumeChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setResumeFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) setResumeFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      if (profile.phoneNo && !/^\+?[0-9]{10,15}$/.test(profile.phoneNo)) {
        setError("Invalid phone number format");
        setSaving(false);
        return;
      }
      const parsedSkills = skillsInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const formData = new FormData();
      formData.append("phoneNo", profile.phoneNo || "");
      formData.append("bio", profile.bio || "");
      formData.append("skills", JSON.stringify(parsedSkills));
      if (resumeFile) {
        formData.append("resume", resumeFile);
      }
      const res = await API.patch("/users/student/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      let updatedData = res.data.data;
      if (typeof updatedData.skills === "string") {
        try {
          updatedData.skills = JSON.parse(updatedData.skills);
        } catch {
          updatedData.skills = [];
        }
      }
      setProfile(updatedData);
      setSkillsInput((updatedData.skills || []).join(", "));
      setResumeFile(null);
      setSuccess("Profile updated successfully");
      setIsEditing(false);
    } catch {
      setError("Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] flex items-center justify-center font-['Nunito'] transition-all duration-300">
        <div className="flex flex-col items-center gap-4 animate-in fade-in duration-700">
          <div className="w-12 h-12 border-4 border-[#F5F6FA] border-t-[#6C5CE7] rounded-full animate-spin"></div>
          <p className="text-[12px] font-black text-[#6C5CE7] animate-pulse uppercase tracking-[0.2em] m-0">
            Syncing User Dossier
          </p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] flex items-center justify-center p-4 font-['Nunito'] transition-all duration-300">
        <div className="bg-[#FFFFFF] border-2 border-dashed border-rose-200 p-12 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center animate-in zoom-in duration-500">
          <p className="text-rose-600 font-black text-[14px] uppercase tracking-widest m-0">
            Account Record Not Found
          </p>
        </div>
      </div>
    );
  }

  const initials = (profile.fullName || "S")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#2D3436] font-['Nunito'] pb-12 transition-colors duration-500 selection:bg-[#6C5CE7]/20 selection:text-[#6C5CE7]">
      <main className="max-w-7xl mx-auto w-full px-4 md:px-8 py-8 md:py-12 flex flex-col lg:flex-row gap-8 lg:gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* ASIDE: Identity Card */}
        <aside className="w-full lg:w-[380px] flex-shrink-0 flex flex-col gap-8">
          <div className="bg-[#FFFFFF] border border-[#F5F6FA] p-8 md:p-10 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(108,92,231,0.08)] text-center flex flex-col items-center transition-all duration-500 group transform hover:-translate-y-1">
            <div className="flex justify-center mb-8 relative">
              <div className="absolute inset-0 bg-[#6C5CE7]/10 rounded-full blur-xl group-hover:bg-[#6C5CE7]/20 transition-colors duration-500"></div>
              <div className="w-32 h-32 bg-[#F5F6FA] border border-transparent rounded-[24px] flex items-center justify-center text-[40px] font-black text-[#6C5CE7] shadow-sm relative z-10 transition-transform duration-500 group-hover:rotate-3 group-hover:shadow-md">
                {initials}
              </div>
            </div>
            <h2 className="text-[26px] font-black m-0 leading-tight mb-2 group-hover:text-[#6C5CE7] transition-colors duration-300">
              {profile.fullName}
            </h2>
            <p className="text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-[0.15em] m-0 mb-8 bg-[#F5F6FA] px-4 py-2 rounded-xl border border-transparent group-hover:border-[#6C5CE7]/10 transition-colors">
              {profile.courseName} / {profile.specialization}
            </p>
            <button
              onClick={() => {
                setIsEditing(!isEditing);
                setError("");
                setSuccess("");
              }}
              className={`w-full py-4 rounded-[16px] font-black uppercase tracking-[0.15em] text-[12px] transition-all duration-300 cursor-pointer outline-none shadow-md transform hover:-translate-y-0.5 active:scale-95
                ${
                  isEditing
                    ? "bg-[#F5F6FA] text-[#2D3436] hover:bg-[#FFFFFF] hover:border-[#6C5CE7] hover:text-[#6C5CE7] border border-transparent"
                    : "bg-[#6C5CE7] text-[#FFFFFF] border-none hover:bg-opacity-90 hover:shadow-[0_10px_25px_-5px_rgba(108,92,231,0.4)]"
                }`}
            >
              {isEditing ? "Exit Editor" : "Modify Credentials"}
            </button>
          </div>

          <div className="bg-[#FFFFFF] border border-[#F5F6FA] p-8 md:p-10 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] transition-all duration-500">
            <h3 className="text-[12px] font-black text-[#6C5CE7] uppercase tracking-[0.2em] mb-6 border-b border-[#F5F6FA] pb-4 flex items-center">
              Institutional Affiliation
            </h3>
            <div className="flex flex-col gap-5">
              <div className="flex flex-col bg-[#F5F6FA] p-4 rounded-[16px] border border-transparent hover:border-[#6C5CE7]/10 transition-colors duration-300">
                <span className="text-[10px] font-black text-[#2D3436] opacity-40 uppercase tracking-[0.15em] mb-1 px-1">
                  University
                </span>
                <span className="text-[15px] font-black text-[#2D3436] px-1">
                  {profile.college?.name || "—"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div className="flex flex-col bg-[#F5F6FA] p-4 rounded-[16px] border border-transparent hover:border-[#6C5CE7]/10 transition-colors duration-300">
                  <span className="text-[10px] font-black text-[#2D3436] opacity-40 uppercase tracking-[0.15em] mb-1 px-1">
                    PRN
                  </span>
                  <span className="text-[13px] font-mono font-bold text-[#2D3436] opacity-80 px-1 break-all">
                    {profile.prn || "—"}
                  </span>
                </div>
                <div className="flex flex-col bg-[#F5F6FA] p-4 rounded-[16px] border border-transparent hover:border-[#6C5CE7]/10 transition-colors duration-300">
                  <span className="text-[10px] font-black text-[#2D3436] opacity-40 uppercase tracking-[0.15em] mb-1 px-1">
                    ABC ID
                  </span>
                  <span className="text-[13px] font-mono font-bold text-[#2D3436] opacity-80 px-1 break-all">
                    {profile.abcId || "—"}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div className="flex flex-col bg-[#F5F6FA] p-4 rounded-[16px] border border-transparent hover:border-[#6C5CE7]/10 transition-colors duration-300">
                  <span className="text-[10px] font-black text-[#2D3436] opacity-40 uppercase tracking-[0.15em] mb-1 px-1">
                    Academic Year
                  </span>
                  <span className="text-[15px] font-black text-[#2D3436] px-1">
                    {profile.Year || "—"}
                  </span>
                </div>
                <div className="flex flex-col bg-[#F5F6FA] p-4 rounded-[16px] border border-transparent hover:border-[#6C5CE7]/10 transition-colors duration-300">
                  <span className="text-[10px] font-black text-[#2D3436] opacity-40 uppercase tracking-[0.15em] mb-1 px-1">
                    Enrollment
                  </span>
                  <span className="text-[14px] font-bold text-[#2D3436] px-1">
                    {profile.courseStartYear || "—"} -{" "}
                    {profile.courseEndYear || "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN: Details / Editor */}
        <section className="flex-1">
          <div className="bg-[#FFFFFF] border border-[#F5F6FA] p-8 md:p-12 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] transition-all duration-500">
            <header className="mb-10 border-b border-[#F5F6FA] pb-6">
              <h1 className="text-[28px] md:text-4xl font-black text-[#6C5CE7] m-0 tracking-tighter leading-tight uppercase">
                {isEditing ? "Update Profile" : "Profile Summary"}
              </h1>
              <p className="text-[13px] font-black text-[#2D3436] opacity-40 m-0 mt-2 uppercase tracking-[0.2em]">
                {isEditing
                  ? "Institutional Profile Modification"
                  : "Authorized User Data"}
              </p>
            </header>

            {/* Alerts */}
            {error && (
              <div className="mb-8 px-6 py-4 text-[12px] font-black text-rose-600 bg-rose-50 border border-rose-200 rounded-[16px] uppercase tracking-widest text-center shadow-sm animate-in fade-in zoom-in duration-300">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-8 px-6 py-4 text-[12px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-[16px] uppercase tracking-widest text-center shadow-sm animate-in fade-in zoom-in duration-300">
                {success}
              </div>
            )}

            {/* View Mode */}
            {!isEditing ? (
              <div className="flex flex-col gap-10 animate-in fade-in duration-500">
                <div className="flex flex-col gap-3">
                  <span className="text-[12px] font-black text-[#6C5CE7] uppercase tracking-[0.2em] border-l-4 border-[#6C5CE7] pl-4 flex items-center h-5">
                    Dossier Biography
                  </span>
                  <div className="p-6 md:p-8 bg-[#F5F6FA] border border-transparent rounded-[20px] text-[15px] font-bold leading-relaxed text-[#2D3436] opacity-80 hover:border-[#6C5CE7]/10 transition-colors duration-300">
                    {profile.bio || "No professional biography provided."}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex flex-col gap-3">
                    <span className="text-[12px] font-black text-[#6C5CE7] uppercase tracking-[0.2em] border-l-4 border-[#6C5CE7] pl-4 flex items-center h-5">
                      Contact Channel
                    </span>
                    <span className="text-[16px] font-black text-[#2D3436] bg-[#F5F6FA] p-5 rounded-[16px] border border-transparent hover:border-[#6C5CE7]/10 transition-colors">
                      {profile.phoneNo || "Not Specified"}
                    </span>
                  </div>
                  <div className="flex flex-col gap-3">
                    <span className="text-[12px] font-black text-[#6C5CE7] uppercase tracking-[0.2em] border-l-4 border-[#6C5CE7] pl-4 flex items-center h-5">
                      Core Competencies
                    </span>
                    <div className="flex flex-wrap gap-2.5 p-5 bg-[#F5F6FA] rounded-[16px] border border-transparent hover:border-[#6C5CE7]/10 transition-colors min-h-[64px]">
                      {profile.skills?.length > 0 ? (
                        profile.skills.map((s, i) => (
                          <span
                            key={i}
                            className="px-4 py-2 bg-[#FFFFFF] text-[#2D3436] opacity-80 border border-transparent rounded-[12px] text-[11px] font-black shadow-sm uppercase tracking-wider hover:text-[#6C5CE7] transition-colors cursor-default"
                          >
                            {s}
                          </span>
                        ))
                      ) : (
                        <span className="text-[13px] font-bold text-[#2D3436] opacity-30 italic flex items-center">
                          No skills documented
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-5 pt-8 border-t border-[#F5F6FA]">
                  <span className="text-[12px] font-black text-[#6C5CE7] uppercase tracking-[0.2em] border-l-4 border-[#6C5CE7] pl-4 flex items-center h-5">
                    Curriculum Vitae
                  </span>
                  {profile.resumeUrl ? (
                    <button
                      onClick={() => window.open(profile.resumeUrl, "_blank")}
                      className="w-full md:w-max px-8 py-4 bg-[#FFFFFF] border-2 border-transparent text-[#2D3436] text-[12px] font-black uppercase tracking-[0.2em] rounded-[16px] cursor-pointer hover:bg-[#6C5CE7] hover:text-[#FFFFFF] hover:shadow-lg hover:shadow-[#6C5CE7]/20 transition-all duration-300 shadow-sm outline-none active:scale-95 transform hover:-translate-y-0.5"
                    >
                      View Submitted Document
                    </button>
                  ) : (
                    <div className="p-6 bg-[#F5F6FA] rounded-[16px] border border-dashed border-[#2D3436]/20 inline-block w-max">
                      <span className="text-[12px] font-black text-[#2D3436] opacity-30 italic uppercase tracking-widest">
                        Document not uploaded
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Edit Mode */
              <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-8 animate-in fade-in duration-500"
              >
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-[0.15em] px-1">
                    Full Name (Locked)
                  </label>
                  <input
                    value={profile.fullName || ""}
                    disabled
                    className="w-full px-5 py-4 text-[14px] font-bold text-[#2D3436] bg-[#F5F6FA] border border-transparent rounded-[16px] opacity-60 cursor-not-allowed italic"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-[0.15em] px-1">
                    Phone Number
                  </label>
                  <input
                    name="phoneNo"
                    value={profile.phoneNo || ""}
                    onChange={handleChange}
                    placeholder="+91"
                    className="w-full px-5 py-4 text-[14px] font-bold text-[#2D3436] bg-[#F5F6FA] border border-transparent rounded-[16px] outline-none transition-all duration-300 focus:bg-[#FFFFFF] focus:border-[#6C5CE7] focus:ring-4 focus:ring-[#6C5CE7]/10 placeholder-[#2D3436] placeholder-opacity-30 shadow-sm"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-[0.15em] px-1">
                    Biography
                  </label>
                  <textarea
                    name="bio"
                    rows={5}
                    value={profile.bio || ""}
                    onChange={handleChange}
                    placeholder="Professional summary..."
                    className="w-full px-5 py-4 text-[14px] font-bold text-[#2D3436] bg-[#F5F6FA] border border-transparent rounded-[16px] outline-none resize-none transition-all duration-300 focus:bg-[#FFFFFF] focus:border-[#6C5CE7] focus:ring-4 focus:ring-[#6C5CE7]/10 placeholder-[#2D3436] placeholder-opacity-30 shadow-sm"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-[0.15em] px-1">
                    Technical Skills (Comma Separated)
                  </label>
                  <input
                    value={skillsInput}
                    onChange={handleSkillsChange}
                    placeholder="e.g. React, Node.js, SQL"
                    className="w-full px-5 py-4 text-[14px] font-bold text-[#2D3436] bg-[#F5F6FA] border border-transparent rounded-[16px] outline-none transition-all duration-300 focus:bg-[#FFFFFF] focus:border-[#6C5CE7] focus:ring-4 focus:ring-[#6C5CE7]/10 placeholder-[#2D3436] placeholder-opacity-30 shadow-sm"
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <label className="text-[11px] font-black text-[#2D3436] opacity-50 uppercase tracking-[0.15em] px-1">
                    Resume Update
                  </label>
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full p-12 text-center border-2 border-dashed rounded-[24px] cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-4 ${
                      dragOver
                        ? "border-[#6C5CE7] bg-[#6C5CE7]/5 shadow-inner"
                        : "border-[#6C5CE7]/20 bg-[#F5F6FA] hover:border-[#6C5CE7]/50 hover:bg-[#FFFFFF] shadow-sm"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={handleResumeChange}
                    />
                    <span
                      className={`px-6 py-3 rounded-[12px] text-[10px] font-black uppercase tracking-widest transition-colors ${resumeFile ? "bg-[#6C5CE7] text-[#FFFFFF] shadow-md" : "bg-[#FFFFFF] text-[#2D3436] opacity-60 border border-[#F5F6FA]"}`}
                    >
                      {resumeFile ? "Document Selected" : "Browse Files"}
                    </span>
                    <p
                      className={`text-[13px] font-black uppercase tracking-widest m-0 ${resumeFile ? "text-[#6C5CE7]" : "text-[#2D3436] opacity-40"}`}
                    >
                      {resumeFile ? resumeFile.name : "Drag & Drop PDF Here"}
                    </p>
                  </div>
                </div>

                <div className="pt-8 border-t border-[#F5F6FA] flex flex-col sm:flex-row justify-end gap-4 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-8 py-4 text-[11px] font-black text-[#2D3436] bg-[#FFFFFF] border border-[#F5F6FA] rounded-[16px] hover:border-[#6C5CE7] hover:text-[#6C5CE7] hover:shadow-sm transition-all duration-300 cursor-pointer uppercase tracking-[0.15em] outline-none transform active:scale-95 w-full sm:w-auto"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-10 py-4 bg-[#6C5CE7] text-[#FFFFFF] text-[12px] font-black uppercase tracking-[0.2em] border-none rounded-[16px] cursor-pointer hover:bg-opacity-90 hover:shadow-[0_10px_25px_-5px_rgba(108,92,231,0.4)] transition-all duration-300 disabled:opacity-50 disabled:transform-none outline-none shadow-md transform hover:-translate-y-1 active:scale-95 flex items-center justify-center min-w-[200px] w-full sm:w-auto"
                  >
                    {saving ? (
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 border-2 border-[#FFFFFF]/30 border-t-[#FFFFFF] rounded-full animate-spin"></div>
                        Processing...
                      </div>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
