import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";

import API from "../../api/api";
import { addUser } from "../../store/userSlice";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [form, setForm] = useState({
    email: "",
    password: "Ambadas@123",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const redirectByRole = (role) => {
    const r = String(role || "").toLowerCase();

    if (r === "student") return "/student/dashboard";
    if (r === "faculty") return "/faculty/dashboard";
    if (r === "company") return "/company/dashboard";
    if (r === "mentor") return "/mentor/dashboard";
    if (r === "college") return "/college/dashboard";
    
    return null; // 🚨 important
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await API.post("/auth/login", form);

      const user =
        res.data?.user || res.data?.data?.user || res.data?.data;

      if (!user) {
        alert("Invalid login response");
        return;
      }

      const role = String(user.role || "").toLowerCase();

      // 🚨 HARD BLOCK ADMIN
      if (role === "admin") {
        alert("Admins must login from admin portal");
        return;
      }

      const redirectPath = redirectByRole(role);

      if (!redirectPath) {
        alert("Unauthorized role");
        return;
      }

      const profileRes = await API.get("/users/profile");

      dispatch(
        addUser({
          user,
          profile: profileRes.data?.profile,
          token: null,
        })
      );

      navigate(redirectPath, { replace: true });

    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center p-4 font-['Nunito']">
      <div className="w-full max-w-[360px] bg-[#fff] p-8 rounded-[20px] border border-[#e5e5e5] shadow-sm flex flex-col gap-3">
        <h2 className="text-[23px] font-black text-[#333] text-center m-0 mb-4">
          Welcome Back
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-bold text-[#333]">
              Email Address
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              required
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
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                required
                className="w-full pl-4 pr-16 py-3 text-[13px] text-[#333] bg-[#fff] border border-[#333] rounded-[14px] outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px] font-bold text-[#333]"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full mt-3 py-3 text-[14px] font-bold text-[#fff] bg-[#111] rounded-[14px]"
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        <div className="mt-2 text-center">
          <p className="text-[13px] text-[#333] m-0">
            Forgot your password?{" "}
            <Link to="/forgot-password" className="font-bold">
              Reset it
            </Link>
          </p>
        </div>

        <div className="mt-2 text-center">
          <p className="text-[13px] text-[#333] m-0">
            Don't have an account?{" "}
            <Link to="/signup" className="font-bold">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}