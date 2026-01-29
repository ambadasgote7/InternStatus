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
        { email, password }, // 🔒 NO role sent
        { withCredentials: true }
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
    <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
      <legend className="fieldset-legend">Signup</legend>

      {error && (
        <p className="text-red-500 text-sm mb-2 text-center">{error}</p>
      )}

      {/* ROLE SELECT */}
      <label className="label">Role</label>
      <div className={`dropdown w-full ${isRoleOpen ? "dropdown-open" : ""}`}>
        <button
          type="button"
          className="btn w-full justify-between"
          onClick={() => setIsRoleOpen((prev) => !prev)}
          disabled={submitting}
        >
          <span>{role || "Select Role"}</span>
          <span className="text-xs opacity-70">▼</span>
        </button>

        <ul className="dropdown-content menu bg-base-100 rounded-box w-full mt-1 shadow z-10">
          {["Student", "Faculty", "Company"].map((r) => (
            <li key={r}>
              <button
                type="button"
                onClick={() => {
                  setRole(r);
                  setIsRoleOpen(false);
                }}
              >
                {r}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* EMAIL */}
      <label className="label mt-2">Email</label>
      <input
        type="email"
        className="input w-full"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={submitting}
      />

      {/* PASSWORD */}
      <label className="label mt-2">Password</label>
      <input
        type="password"
        className="input w-full"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={submitting}
      />

      {/* SUBMIT */}
      <button
        className="btn btn-neutral mt-4 w-full"
        onClick={handleSignup}
        disabled={submitting}
      >
        {submitting ? "Signing up..." : "Signup"}
      </button>

      <Link to="/login">
        <p className="flex justify-center my-3 cursor-pointer">
          Already have an account? Login here
        </p>
      </Link>
    </fieldset>
  );
};

export default Signup;
