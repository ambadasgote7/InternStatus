import { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../utils/constants";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("Admin@123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      await axios.post(
        `${BASE_URL}/api/admin/login`,
        { email, password },
        { withCredentials: true }
      );

      // ✅ no role checks, no redux
      navigate("/admin/dashboard");
    } catch (err) {
      setError(
        err?.response?.data?.message || "Admin login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="bg-base-100 p-6 rounded-xl shadow w-full max-w-sm">
        <h2 className="text-xl font-bold text-center mb-4">
          Admin Login
        </h2>

        {error && (
          <p className="text-red-500 text-sm mb-3 text-center">
            {error}
          </p>
        )}

        <label className="label">Admin Email</label>
        <input
          type="email"
          className="input input-bordered w-full mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />

        <label className="label">Password</label>
        <input
          type="password"
          className="input input-bordered w-full mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />

        <button
          className="btn btn-neutral w-full"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>
    </div>
  );
};

export default AdminLogin;
