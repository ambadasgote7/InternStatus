import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import API from "../../api/api";
import { addUser } from "../../store/userSlice";

export default function AdminLogin() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await API.post("/auth/login", form);

      const user = res.data?.data;

      if (!user) {
        alert("Invalid login response");
        return;
      }

      // 🚨 enforce admin only
      if (String(user.role).toLowerCase() !== "admin") {
        alert("Access denied: not an admin");
        return;
      }

      // ✅ fetch profile AFTER login
      const profileRes = await API.get("/users/profile");

      dispatch(
        addUser({
          user,
          profile: profileRes.data?.profile,
          token: null,
        })
      );

      navigate("/admin/dashboard");

    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-black text-white">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-80">
        <input
          type="email"
          placeholder="Admin Email"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
          required
          className="p-3 rounded bg-gray-800"
        />

        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
          required
          className="p-3 rounded bg-gray-800"
        />

        <button
          disabled={loading}
          className="p-3 bg-purple-600 rounded"
        >
          {loading ? "Loading..." : "Login as Admin"}
        </button>
      </form>
    </div>
  );
}