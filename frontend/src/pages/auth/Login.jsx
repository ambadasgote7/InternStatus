// src/pages/auth/Login.jsx
import { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../utils/constants";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addUser } from "../../store/userSlice";
import roleConfig from "../../config/roleConfig";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = async () => {
    try {
      const res = await axios.post(
        BASE_URL + "/api/auth/login",
        { email, password },
        { withCredentials: true }
      );

      const userData = res.data?.data; // this includes role from backend
      if (!userData) {
        console.error("No user data in response");
        return;
      }

      // Save user in Redux
      dispatch(addUser(userData));

      // Decide where to go based on role
      const role = userData.role;
      const redirectPath = roleConfig[role] || "/login"; // fallback

      navigate(redirectPath);
    } catch (err) {
      console.error(err?.response?.data || "Something went wrong");
    }
  };

  return (
    <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
      <legend className="fieldset-legend">Login</legend>

      <label className="label">Email</label>
      <input
        type="email"
        className="input"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <label className="label">Password</label>
      <input
        type="password"
        className="input"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button className="btn btn-neutral mt-4" onClick={handleLogin}>
        Login
      </button>

      <Link to={"/signup"}>
        <p className="flex justify-center my-3 cursor-pointer">
          Don&apos;t have an account? Signup here
        </p>
      </Link>
    </fieldset>
  );
};

export default Login;
