import { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";

import { BASE_URL } from "../../utils/constants";
import { addUser } from "../../store/userSlice";

const ROLE_ENDPOINT_MAP = {
  Student: "/signup/student",
  Faculty: "/signup/faculty",
  Company: "/signup/company",
};

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const redirectAfterSignup = (role) => {
    if (role === "Student") return "/student/profile";
    if (role === "Faculty") return "/faculty/register";
    if (role === "Company") return "/company/register";
    return "/login";
  };

  const handleSignup = async () => {
    setError("");

    if (!email || !password || !role) {
      setError("All fields are required.");
      return;
    }

    const endpoint = ROLE_ENDPOINT_MAP[role];
    if (!endpoint) {
      setError("Invalid role selected.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await axios.post(
        `${BASE_URL}/api/auth${endpoint}`,
        { email, password },
        { withCredentials: true },
      );

      const userData = res.data?.data;
      if (!userData) {
        setError("Invalid response from server.");
        setSubmitting(false);
        return;
      }

      dispatch(addUser(userData));
      navigate(redirectAfterSignup(userData.role));
    } catch (err) {
      const msg =
        err?.response?.data?.message || "Signup failed. Please try again.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-[360px] bg-[#fff] p-8 rounded-[20px] border border-[#e5e5e5] shadow-sm flex flex-col gap-3">
        <h2 className="text-[23px] font-black text-[#333] text-center m-0 mb-4">
          Create Account
        </h2>

        {error && (
          <div className="px-4 py-3 text-[13px] font-bold text-[#cc0000] bg-[#fff] border border-[#cc0000] rounded-[14px]">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div className="relative flex flex-col gap-1.5">
            <label className="text-[13px] font-bold text-[#333]">
              Account Type
            </label>

            <button
              type="button"
              onClick={() => setIsRoleOpen((prev) => !prev)}
              disabled={submitting}
              className="w-full px-4 py-3 text-[13px] bg-[#fff] border border-[#333] rounded-[14px] outline-none flex justify-between items-center text-left"
            >
              <span className="text-[#333]">{role || "Select Role"}</span>
            </button>

            {isRoleOpen && (
              <div className="absolute top-full left-0 mt-2 w-full bg-[#fff] border border-[#333] rounded-[14px] z-50 overflow-hidden">
                {["Student", "Faculty", "Company"].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setRole(r);
                      setIsRoleOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 text-[13px] font-medium text-[#333] hover:bg-[#f9f9f9] border-none cursor-pointer"
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-bold text-[#333]">
              Email Address
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              className="w-full px-4 py-3 text-[13px] text-[#333] bg-[#fff] border border-[#333] rounded-[14px] outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-bold text-[#333]">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
                className="w-full pl-4 pr-16 py-3 text-[13px] text-[#333] bg-[#fff] border border-[#333] rounded-[14px] outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px] font-bold text-[#333] bg-transparent border-none cursor-pointer outline-none p-0 hover:opacity-80"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            onClick={handleSignup}
            disabled={submitting}
            className="w-full mt-3 py-3 text-[14px] font-bold text-[#fff] bg-[#111] border-none rounded-[14px] cursor-pointer hover:opacity-80 flex justify-center items-center"
          >
            {submitting ? "Creating..." : "Sign Up"}
          </button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-[13px] text-[#333] m-0">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-[#111] hover:opacity-80 no-underline font-bold"
            >
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
