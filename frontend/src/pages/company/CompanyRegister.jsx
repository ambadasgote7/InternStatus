import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../../utils/constants";

const CompanyRegister = () => {
  const user = useSelector((state) => state.user);
  const requesterEmail = user?.email || "";
  const navigate = useNavigate();

  const [form, setForm] = useState({
    requesterName: "",
    companyName: "",
    companyWebsite: "",
  });

  const [verificationFile, setVerificationFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!form.requesterName.trim()) {
      setMessage("Requester name is required");
      return;
    }
    if (!form.companyName.trim()) {
      setMessage("Company name is required");
      return;
    }
    if (!verificationFile) {
      setMessage("Verification document is required");
      return;
    }

    const formData = new FormData();
    formData.append("requesterName", form.requesterName.trim());
    formData.append("requesterEmail", requesterEmail);
    formData.append("companyName", form.companyName.trim());

    if (form.companyWebsite.trim()) {
      formData.append("companyWebsite", form.companyWebsite.trim());
    }

    formData.append("verificationDocument", verificationFile);

    try {
      setLoading(true);

      await axios.post(`${BASE_URL}/api/company/register`, formData, {
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8 text-black">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Company Portal Registration</h1>
          <p className="mt-2 text-gray-500">
            Provide your company details for verification
          </p>
        </div>

        {/* Feedback */}
        {message && (
          <div className="mb-4 rounded-lg bg-red-50 text-red-700 px-4 py-2 text-sm">
            {message}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-lg bg-green-50 text-green-700 px-4 py-2 text-sm">
            Submitted successfully. Redirecting…
          </div>
        )}

        {/* Form */}
        <form className="space-y-8" onSubmit={handleSubmit}>

          {/* Identity Details */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Identity Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="requesterName"
                value={form.requesterName}
                onChange={handleChange}
                placeholder="Requester Name"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="email"
                value={requesterEmail}
                disabled
                className="w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-2 text-gray-600"
              />
            </div>
          </div>

          {/* Company Details */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Company Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="companyName"
                value={form.companyName}
                onChange={handleChange}
                placeholder="Company Name"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="url"
                name="companyWebsite"
                value={form.companyWebsite}
                onChange={handleChange}
                placeholder="Official Website (optional)"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Verification Document */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Verification Document</h2>
            <p className="text-sm text-gray-500 mb-3">
              Upload GST / CIN / Company Registration proof
            </p>
            <input
              type="file"
              onChange={(e) => setVerificationFile(e.target.files[0])}
              className="w-full rounded-lg border border-dashed border-gray-300 px-4 py-3 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          {/* Submit */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 py-3 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-60"
            >
              {loading ? "Submitting..." : "Submit for Approval"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CompanyRegister;
