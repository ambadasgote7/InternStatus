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

      dispatch(addUser(userData));

      if (userData.roleStatus === "revoked") {
        navigate("/access-revoked");
        return;
      }

      const role = userData.role;
      const isVerified = !!userData.isVerified;
      const isRegistered = !!userData.isRegistered;

      if (!isRegistered) {
        navigate(redirectToRegisterForRole(role));
        return;
      }

      if (!isVerified) {
        navigate("/pending-verification");
        return;
      }

      const redirectPath = roleConfig[role] || "/";
      navigate(redirectPath);
    } catch (err) {
      const msg =
        err?.response?.data?.message || "Login failed. Check credentials.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
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
