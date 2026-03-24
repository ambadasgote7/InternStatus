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
      <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center font-sans">
        <p className="text-[14px] font-bold text-[#333] animate-pulse uppercase tracking-widest">
          Syncing User Dossier
        </p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center p-4 font-sans">
        <div className="bg-[#fff] border border-[#cc0000] p-8 rounded-[20px] shadow-sm">
          <p className="text-[#cc0000] font-bold text-[14px] uppercase tracking-widest m-0">
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
    <div className="min-h-screen bg-[#f9f9f9] text-[#333] font-sans pb-10">
      <main className="max-w-7xl mx-auto w-full px-4 md:px-6 py-6 flex flex-col lg:flex-row gap-6">
        <aside className="w-full lg:w-[340px] flex-shrink-0 flex flex-col gap-6">
          <div className="bg-[#fff] border border-[#e5e5e5] p-6 rounded-[20px] shadow-sm text-center">
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-[#f9f9f9] border border-[#e5e5e5] rounded-full flex items-center justify-center text-[32px] font-black text-[#111]">
                {initials}
              </div>
            </div>
            <h2 className="text-[20px] font-black m-0 leading-tight mb-1">
              {profile.fullName}
            </h2>
            <p className="text-[12px] font-bold opacity-50 uppercase tracking-widest m-0 mb-6">
              {profile.courseName} / {profile.specialization}
            </p>
            <button
              onClick={() => {
                setIsEditing(!isEditing);
                setError("");
                setSuccess("");
              }}
              className="w-full py-3 rounded-[12px] font-black uppercase tracking-widest text-[11px] transition-all border-none bg-[#111] text-[#fff] cursor-pointer hover:opacity-80"
            >
              {isEditing ? "Exit Editor" : "Modify Credentials"}
            </button>
          </div>

          <div className="bg-[#fff] border border-[#e5e5e5] p-6 rounded-[20px] shadow-sm">
            <h3 className="text-[11px] font-black opacity-40 uppercase tracking-widest mb-5 border-b border-[#f9f9f9] pb-3">
              Institutional Affiliation
            </h3>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold opacity-40 uppercase tracking-tighter">
                  University
                </span>
                <span className="text-[13px] font-bold">
                  {profile.college?.name || "—"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold opacity-40 uppercase tracking-tighter">
                    PRN
                  </span>
                  <span className="text-[12px] font-mono font-bold text-[#111] mt-0.5">
                    {profile.prn || "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold opacity-40 uppercase tracking-tighter">
                    ABC ID
                  </span>
                  <span className="text-[12px] font-mono font-bold text-[#111] mt-0.5">
                    {profile.abcId || "—"}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold opacity-40 uppercase tracking-tighter">
                    Academic Year
                  </span>
                  <span className="text-[13px] font-bold">
                    {profile.Year || "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold opacity-40 uppercase tracking-tighter">
                    Enrollment
                  </span>
                  <span className="text-[13px] font-bold">
                    {profile.courseStartYear || "—"} -{" "}
                    {profile.courseEndYear || "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <section className="flex-1">
          <div className="bg-[#fff] border border-[#e5e5e5] p-6 md:p-8 rounded-[20px] shadow-sm">
            <header className="mb-8 border-b border-[#e5e5e5] pb-4">
              <h1 className="text-[23px] font-black m-0 tracking-tight">
                {isEditing ? "Update Profile" : "Profile Summary"}
              </h1>
              <p className="text-[13px] font-bold opacity-60 m-0 mt-1 uppercase tracking-widest">
                {isEditing
                  ? "Institutional Profile Modification"
                  : "Authorized User Data"}
              </p>
            </header>

            {error && (
              <div className="mb-6 px-4 py-3 text-[12px] font-bold text-[#cc0000] border border-[#cc0000] rounded-[14px] uppercase tracking-widest text-center">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-6 px-4 py-3 text-[12px] font-bold text-[#008000] border border-[#008000] rounded-[14px] uppercase tracking-widest text-center">
                {success}
              </div>
            )}

            {!isEditing ? (
              <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-2">
                  <span className="text-[11px] font-black opacity-40 uppercase tracking-widest">
                    Dossier Biography
                  </span>
                  <div className="p-5 bg-[#f9f9f9] border border-[#e5e5e5] rounded-[14px] text-[14px] font-medium leading-relaxed">
                    {profile.bio || "No professional biography provided."}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex flex-col gap-2">
                    <span className="text-[11px] font-black opacity-40 uppercase tracking-widest">
                      Contact Channel
                    </span>
                    <span className="text-[14px] font-bold">
                      {profile.phoneNo || "Not Specified"}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-[11px] font-black opacity-40 uppercase tracking-widest">
                      Core Competencies
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {profile.skills?.length > 0 ? (
                        profile.skills.map((s, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-[#f9f9f9] border border-[#e5e5e5] rounded-[8px] text-[12px] font-bold"
                          >
                            {s}
                          </span>
                        ))
                      ) : (
                        <span className="text-[12px] font-bold opacity-30 italic">
                          No skills documented
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-6 border-t border-[#f9f9f9]">
                  <span className="text-[11px] font-black opacity-40 uppercase tracking-widest">
                    Curriculum Vitae
                  </span>
                  {profile.resumeUrl ? (
                    <button
                      onClick={() => window.open(profile.resumeUrl, "_blank")}
                      className="w-max px-6 py-2.5 bg-[#f9f9f9] border border-[#333] text-[#333] text-[11px] font-black uppercase tracking-widest rounded-[10px] cursor-pointer hover:bg-[#333] hover:text-[#fff] transition-all"
                    >
                      View Submitted Document
                    </button>
                  ) : (
                    <span className="text-[12px] font-bold opacity-30 italic">
                      Document not uploaded
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold opacity-60 uppercase tracking-widest">
                    Full Name (Locked)
                  </label>
                  <input
                    value={profile.fullName || ""}
                    disabled
                    className="w-full px-4 py-3 text-[13px] bg-[#f9f9f9] border border-[#e5e5e5] rounded-[14px] opacity-60 cursor-not-allowed"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold opacity-60 uppercase tracking-widest">
                    Phone Number
                  </label>
                  <input
                    name="phoneNo"
                    value={profile.phoneNo || ""}
                    onChange={handleChange}
                    placeholder="+91"
                    className="w-full px-4 py-3 text-[13px] border border-[#333] rounded-[14px] outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold opacity-60 uppercase tracking-widest">
                    Biography
                  </label>
                  <textarea
                    name="bio"
                    rows={4}
                    value={profile.bio || ""}
                    onChange={handleChange}
                    placeholder="Professional summary..."
                    className="w-full px-4 py-3 text-[13px] border border-[#333] rounded-[14px] outline-none resize-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold opacity-60 uppercase tracking-widest">
                    Technical Skills (Comma Separated)
                  </label>
                  <input
                    value={skillsInput}
                    onChange={handleSkillsChange}
                    placeholder="e.g. React, Node.js, SQL"
                    className="w-full px-4 py-3 text-[13px] border border-[#333] rounded-[14px] outline-none"
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <label className="text-[11px] font-bold opacity-60 uppercase tracking-widest">
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
                    className={`w-full p-10 text-center border-2 border-dashed rounded-[20px] cursor-pointer transition-all ${
                      dragOver
                        ? "border-[#111] bg-[#f9f9f9]"
                        : "border-[#e5e5e5] hover:border-[#111]"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={handleResumeChange}
                    />
                    <p className="text-[12px] font-black uppercase tracking-widest m-0">
                      {resumeFile
                        ? resumeFile.name
                        : "Select or Drop PDF Document"}
                    </p>
                  </div>
                </div>

                <div className="pt-6 border-t border-[#f9f9f9] flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-3 text-[11px] font-bold text-[#333] bg-[#f9f9f9] border border-[#e5e5e5] rounded-[12px] hover:bg-[#e5e5e5] transition-colors cursor-pointer uppercase tracking-widest"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-8 py-3 bg-[#111] text-[#fff] text-[11px] font-black uppercase tracking-widest border-none rounded-[12px] cursor-pointer hover:opacity-80 transition-opacity disabled:opacity-30"
                  >
                    {saving ? "Processing..." : "Save Changes"}
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
