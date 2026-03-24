import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/api";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await API.post("/auth/forgot-password", { email });

      alert("OTP sent to your email");

      navigate("/reset-password", {
        state: { email },
      });
    } catch (err) {
      alert(err.response?.data?.message || "Error sending OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[360px] bg-[#fff] p-8 rounded-[20px] border border-[#e5e5e5] shadow-sm flex flex-col gap-3"
      >
        <h2 className="text-[23px] font-black text-[#333] text-center m-0 mb-4">
          Forgot Password
        </h2>

        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-bold text-[#333]">
            Email Address
          </label>
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full px-4 py-3 text-[13px] text-[#333] bg-[#fff] border border-[#333] rounded-[14px] outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full mt-3 py-3 text-[14px] font-bold text-[#fff] bg-[#111] border-none rounded-[14px] cursor-pointer hover:opacity-80 flex justify-center items-center"
          disabled={loading}
        >
          {loading ? "Sending OTP..." : "Send OTP"}
        </button>
      </form>
    </div>
  );
}
