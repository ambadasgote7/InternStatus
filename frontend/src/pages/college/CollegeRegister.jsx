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

      setSuccess(
        "Request submitted successfully. Please wait for admin approval.",
      );
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
    <div className="min-h-screen flex items-center justify-center bg-[#f9f9f9] p-4 md:p-6 font-sans text-[#333]">
      <div className="w-full max-w-xl bg-[#fff] p-6 md:p-10 rounded-[20px] shadow-sm border border-[#e5e5e5] box-border">
        <header className="mb-8 border-b border-[#e5e5e5] pb-4">
          <h2 className="text-[24px] font-black m-0 tracking-tight text-[#333] text-center">
            College Registration
          </h2>
          <p className="text-[13px] font-bold text-[#333] opacity-60 m-0 mt-1 uppercase tracking-widest text-center">
            Request Institutional Access
          </p>
        </header>

        {error && (
          <div className="mb-5 px-4 py-3 text-[12px] font-bold text-[#cc0000] bg-[#fff] border border-[#cc0000] rounded-[14px] text-center uppercase tracking-widest">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-5 px-4 py-3 text-[12px] font-bold text-[#008000] bg-[#fff] border border-[#008000] rounded-[14px] text-center uppercase tracking-widest">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                Your Name
              </label>
              <input
                name="requesterName"
                placeholder="Full Name"
                value={form.requesterName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 text-[13px] text-[#333] bg-[#fff] border border-[#333] rounded-[14px] outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                Official Email
              </label>
              <input
                name="requesterEmail"
                type="email"
                placeholder="email@college.edu"
                value={form.requesterEmail}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 text-[13px] text-[#333] bg-[#fff] border border-[#333] rounded-[14px] outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
              Phone Number
            </label>
            <input
              name="requesterPhone"
              placeholder="+91 XXXXX XXXXX"
              value={form.requesterPhone}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 text-[13px] text-[#333] bg-[#fff] border border-[#333] rounded-[14px] outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
              Select Institution
            </label>
            <select
              name="selectedCollege"
              value={form.selectedCollege}
              onChange={handleChange}
              className="w-full px-4 py-3 text-[13px] text-[#333] bg-[#fff] border border-[#333] rounded-[14px] outline-none cursor-pointer appearance-none"
            >
              <option value="" disabled>
                Select College
              </option>
              {colleges.map((col) => (
                <option key={col._id} value={col._id}>
                  {col.name}
                </option>
              ))}
              <option value="other">Other (Not Listed)</option>
            </select>
          </div>

          {isOther && (
            <div className="flex flex-col gap-1.5 p-4 bg-[#f9f9f9] border border-dashed border-[#333] rounded-[14px]">
              <label className="text-[11px] font-bold text-[#333] uppercase tracking-widest">
                New Institution Name
              </label>
              <input
                name="collegeName"
                placeholder="Full Institution Name"
                value={form.collegeName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 text-[13px] text-[#333] bg-[#fff] border border-[#333] rounded-[14px] outline-none"
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
              Address
            </label>
            <input
              name="location"
              placeholder="City, State"
              value={form.location}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 text-[13px] text-[#333] bg-[#fff] border border-[#333] rounded-[14px] outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                Website
              </label>
              <input
                name="website"
                placeholder="https://college.edu"
                value={form.website}
                onChange={handleChange}
                className="w-full px-4 py-3 text-[13px] text-[#333] bg-[#fff] border border-[#333] rounded-[14px] outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
                Domain
              </label>
              <input
                name="emailDomain"
                placeholder="college.edu"
                value={form.emailDomain}
                onChange={handleChange}
                className="w-full px-4 py-3 text-[13px] text-[#333] bg-[#fff] border border-[#333] rounded-[14px] outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 p-5 bg-[#f9f9f9] border border-dashed border-[#e5e5e5] rounded-[14px] text-center">
            <label className="text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-widest">
              Verification Document
            </label>
            <input
              type="file"
              name="verificationDocument"
              onChange={handleChange}
              required
              className="block w-full text-[11px] text-[#333] font-bold file:mr-4 file:py-2 file:px-4 file:rounded-[10px] file:border-none file:text-[10px] file:font-black file:uppercase file:bg-[#111] file:text-[#fff] cursor-pointer"
            />
          </div>

          <div className="pt-6 border-t border-[#e5e5e5] mt-2">
            <button
              disabled={loading}
              className="w-full py-3.5 text-[12px] font-black text-[#fff] bg-[#111] border-none rounded-[14px] cursor-pointer transition-opacity hover:opacity-80 disabled:opacity-30 uppercase tracking-widest flex items-center justify-center gap-2 outline-none"
            >
              {loading ? "Processing..." : "Submit Registration"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
