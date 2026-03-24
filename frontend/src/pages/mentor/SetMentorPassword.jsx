import { useState } from "react";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";
import { BASE_URL } from "../../utils/constants";

const SetMentorPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const validate = () => {
    if (!password || !confirmPassword) {
      return "All security fields are required";
    }
    if (password.length < 6) {
      return "Password must be at least 6 characters";
    }
    if (password !== confirmPassword) {
      return "Passwords do not match";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${BASE_URL}/api/mentor/set-password`, {
        token,
        password,
      });

      setSuccess(res.data.message || "Password updated successfully");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to set password");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9f9f9] p-4 font-sans text-[#333]">
        <div className="w-full max-w-md bg-[#fff] border border-[#cc0000] p-8 md:p-12 rounded-[20px] text-center shadow-sm">
          <header className="mb-6">
            <h2 className="text-[23px] font-black tracking-tight m-0">
              Access Denied
            </h2>
            <p className="text-[11px] font-bold opacity-60 uppercase tracking-widest mt-1">
              Security Protocol
            </p>
          </header>
          <div className="text-[12px] font-bold text-[#cc0000] uppercase tracking-widest">
            Invalid or missing security token
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f9f9f9] p-4 font-sans text-[#333]">
      <div className="w-full max-w-md bg-[#fff] border border-[#e5e5e5] p-6 md:p-10 rounded-[20px] shadow-sm">
        <header className="text-center mb-8 border-b border-[#e5e5e5] pb-6">
          <h2 className="text-[24px] font-black m-0 tracking-tight">
            Secure Account
          </h2>
          <p className="text-[13px] font-bold opacity-60 m-0 mt-1 uppercase tracking-widest">
            Define Access Credentials
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

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold opacity-60 uppercase tracking-widest ml-1">
              New Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 text-[13px] bg-[#fff] border border-[#333] rounded-[14px] outline-none"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold opacity-60 uppercase tracking-widest ml-1">
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 text-[13px] bg-[#fff] border border-[#333] rounded-[14px] outline-none"
              required
            />
          </div>

          <div className="pt-4 border-t border-[#e5e5e5] mt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 text-[12px] font-black text-[#fff] bg-[#111] border-none rounded-[14px] cursor-pointer hover:opacity-80 transition-opacity disabled:opacity-30 uppercase tracking-widest"
            >
              {loading ? "Processing..." : "Initialize Access"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SetMentorPassword;
