// src/pages/auth/Signup.jsx
import axios from "axios";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";

import { BASE_URL } from "../../utils/constants";
import { addUser } from "../../store/userSlice";
import roleConfig from "../../config/roleConfig";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [isRoleOpen, setIsRoleOpen] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSignup = async () => {
    if (!email || !password || !role) {
      alert("All fields are required.");
      return;
    }

    try {
      const res = await axios.post(
        BASE_URL + "/api/auth/signup",
        { email, password, role },
        { withCredentials: true }
      );

      const userData = res.data?.data;
      if (!userData) {
        console.error("No user data in response");
        return;
      }

      // store user in redux (userData contains role)
      dispatch(addUser(userData));

      // redirect based on role
      const redirectPath = roleConfig[userData.role] || "/";
      navigate(redirectPath);
    } catch (err) {
      console.error(err?.response?.data || "Something went wrong");
    }
  };

  const handleSelectRole = (r) => {
    setRole(r);
    setIsRoleOpen(false);
  };

  return (
    <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
      <legend className="fieldset-legend">Signup</legend>

      <label className="label">Role</label>
      <div className={`dropdown w-full ${isRoleOpen ? "dropdown-open" : ""}`}>
        <button
          type="button"
          className="btn w-full justify-between"
          onClick={() => setIsRoleOpen((prev) => !prev)}
        >
          <span>{role || "Select Role"}</span>
          <span className="text-xs opacity-70">▼</span>
        </button>

        <ul className="dropdown-content menu bg-base-100 rounded-box w-full mt-1 shadow z-10">
          <li>
            <button onClick={() => handleSelectRole("Student")}>Student</button>
          </li>
          <li>
            <button onClick={() => handleSelectRole("Faculty")}>Faculty</button>
          </li>
          <li>
            <button onClick={() => handleSelectRole("Company")}>Company</button>
          </li>
        </ul>
      </div>

      <label className="label mt-2">Email</label>
      <input
        type="email"
        className="input w-full"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <label className="label mt-2">Password</label>
      <input
        type="password"
        className="input w-full"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button className="btn btn-neutral mt-4 w-full" onClick={handleSignup}>
        Signup
      </button>

      <Link to={"/login"}>
        <p className="flex justify-center my-3 cursor-pointer">
          Already have an account? Login here
        </p>
      </Link>
    </fieldset>
  );
};

export default Signup;
