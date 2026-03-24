import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import API from "../api/api";

export default function SetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const [roleData, setRoleData] = useState(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [profileData, setProfileData] = useState({});
  const [files, setFiles] = useState({});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ================= FETCH ROLE INFO ================= */

  useEffect(() => {
    if (!token) return;

    const fetchSetup = async () => {
      try {
        const res = await API.get(`/users/setup-data?token=${token}`);
        setRoleData(res.data);
      } catch (err) {
        setRoleData({ role: "basic" });
      }
    };

    fetchSetup();
  }, [token]);

  /* ================= HANDLERS ================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFile = (e) => {
    const { name, files: fileList } = e.target;

    if (!fileList?.[0]) return;

    setFiles((prev) => ({
      ...prev,
      [name]: fileList[0],
    }));
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!token) {
      setError("Invalid setup link");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      /* ===== BASIC FLOW ===== */

      if (roleData?.role === "basic") {
        await API.post("/users/setup-account", {
          token,
          password,
        });
      } else {
        const formData = new FormData();

        formData.append("token", token);
        formData.append("password", password);

        formData.append("profileData", JSON.stringify(profileData));

        if (files.resume) formData.append("resume", files.resume);

        if (files.collegeIdCard)
          formData.append("collegeIdCard", files.collegeIdCard);

        await API.post("/users/setup-account", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      alert("Account setup successful. Please login.");
      navigate("/login");
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message || "Setup failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!roleData) {
    return <div style={{ padding: 40 }}>Loading...</div>;
  }

  /* ================= UI ================= */

  return (
    <div style={{ padding: 40, maxWidth: 500, margin: "auto" }}>
      ```
      <h2>
        {roleData.role === "basic"
          ? "Set Initial Password"
          : "Complete Your Account"}
      </h2>
      {roleData.email && <p>Email: {roleData.email}</p>}
      {roleData.role && roleData.role !== "basic" && (
        <p>Role: {roleData.role}</p>
      )}
      {error && <div style={{ color: "red", marginBottom: 10 }}>{error}</div>}
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {/* PASSWORD */}

        <input
          type="password"
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        {/* ================= STUDENT ================= */}

        {roleData.role === "student" && (
          <>
            <input
              name="prn"
              placeholder="PRN"
              onChange={handleChange}
              required
            />

            <input
              name="abcId"
              placeholder="ABC ID"
              onChange={handleChange}
              required
            />

            <input name="phoneNo" placeholder="Phone" onChange={handleChange} />

            <input name="bio" placeholder="Bio" onChange={handleChange} />

            <label>Resume</label>
            <input
              type="file"
              name="resume"
              accept=".pdf,.doc,.docx"
              onChange={handleFile}
            />

            <label>College ID Card</label>
            <input
              type="file"
              name="collegeIdCard"
              accept="image/*,.pdf"
              onChange={handleFile}
            />
          </>
        )}

        {/* ================= FACULTY ================= */}

        {roleData.role === "faculty" && (
          <>
            <input name="phoneNo" placeholder="Phone" onChange={handleChange} />

            <input
              name="designation"
              placeholder="Designation"
              onChange={handleChange}
            />
          </>
        )}

        <button disabled={loading}>
          {loading ? "Setting..." : "Set Password"}
        </button>
      </form>
    </div>
  );
}
