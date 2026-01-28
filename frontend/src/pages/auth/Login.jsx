// src/pages/auth/Login.jsx
import { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../utils/constants";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addUser } from "../../store/userSlice";
import roleConfig from "../../config/roleConfig";

const Login = () => {
  const [email, setEmail] = useState("ambadas@gmail.com");
  const [password, setPassword] = useState("Ambadas@123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const redirectToRegisterForRole = (role) => {
    if (role === "Student") return "/student/profile";
    if (role === "Faculty") return "/faculty/register";
    if (role === "Company") return "/company/register";
    return "/login";
  };

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(
        `${BASE_URL}/api/auth/login`,
        { email, password },
        { withCredentials: true }
      );

      const userData = res.data?.data;
      if (!userData) {
        setError("Invalid server response. Try again.");
        setLoading(false);
        return;
      }

      // Save user to Redux immediately
      dispatch(addUser(userData));

      const roleStatus = userData.roleStatus;

      // 🚫 ROLE REVOKED → STOP EVERYTHING ELSE
      if (roleStatus === "revoked") {
        navigate("/access-revoked");
        setLoading(false);
        return;
      }


      const role = userData.role;
      const isVerified = !!userData.isVerified;

      // backend may provide explicit isRegistered flag (preferred)
      let isRegistered =
        typeof userData.isRegistered !== "undefined"
          ? !!userData.isRegistered
          : null; // null means unknown / fallback needed

      // If backend explicitly says not registered -> go to role-specific register/profile
      if (isRegistered === false) {
        navigate(redirectToRegisterForRole(role));
        setLoading(false);
        return;
      }

      // If backend didn't provide isRegistered, do lightweight checks per role
      if (isRegistered === null) {
        try {
          if (role === "Student") {
            // check if student profile exists
            const p = await axios.get(`${BASE_URL}/api/student/profile`, {
              withCredentials: true,
            });
            const profile = p.data?.data;
            if (!profile) {
              navigate("/student/profile");
              setLoading(false);
              return;
            } else {
              isRegistered = true;
            }
          } else if (role === "Faculty") {
            const p = await axios.get(`${BASE_URL}/api/faculty/register`, {
              withCredentials: true,
            });
            const reg = p.data?.data;
            if (!reg) {
              navigate("/faculty/register");
              setLoading(false);
              return;
            } else {
              isRegistered = true;
            }
          } else if (role === "Company") {
            const p = await axios.get(`${BASE_URL}/api/company/register`, {
              withCredentials: true,
            });
            const creg = p.data?.data;
            if (!creg) {
              navigate("/company/register");
              setLoading(false);
              return;
            } else {
              isRegistered = true;
            }
          } else {
            // unknown role — default to role dashboard
            isRegistered = true;
          }
        } catch (fallbackErr) {
          // If the profile endpoints return 404/empty or error, redirect to register
          // This covers the "not registered" case when backend didn't return the flag
          console.warn("Fallback registration check failed:", fallbackErr?.response?.data || fallbackErr);
          navigate(redirectToRegisterForRole(role));
          setLoading(false);
          return;
        }
      }

      // At this point we have isRegistered === true (or we already navigated)
      if (!isVerified) {
        // registered but not verified -> pending verification page
        navigate("/pending-verification");
        setLoading(false);
        return;
      }

      // Both registered and verified -> go to role dashboard
      const redirectPath = roleConfig[role] || "/";
      navigate(redirectPath);
    } catch (err) {
      console.error(err?.response?.data || err);
      const msg = err?.response?.data?.message || "Login failed. Check credentials.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="min-h-screen relative flex items-center justify-center bg-base-200">

    {/* Admin Login — top right */}
    <p
      className="absolute top-4 right-6 text-xs text-gray-500 cursor-pointer hover:underline"
      onClick={() => navigate("/admin/login")}
    >
      Admin Login
    </p>

    {/* Login Card */}
    <fieldset className="fieldset bg-base-100 border-base-300 rounded-box w-xs border p-4 shadow">
      <legend className="fieldset-legend">Login</legend>

      {error && (
        <p className="text-red-500 text-sm mb-2 text-center">
          {error}
        </p>
      )}

      <label className="label">Email</label>
      <input
        type="email"
        className="input input-bordered"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
      />

      <label className="label">Password</label>
      <input
        type="password"
        className="input input-bordered"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading}
      />

      <button
        className="btn btn-neutral mt-4 w-full"
        onClick={handleLogin}
        disabled={loading}
      >
        {loading ? "Logging in..." : "Login"}
      </button>

      <Link to="/signup">
        <p className="flex justify-center my-3 cursor-pointer text-sm">
          Don&apos;t have an account? Signup here
        </p>
      </Link>
    </fieldset>
  </div>
);
};

export default Login;
