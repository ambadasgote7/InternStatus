import { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../utils/constants";

const PostInternships = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    applicationDeadline: "",
    mode: "remote",
    skillsRequired: "",
    maxApplicants: 1,
    positions: 1,
    stipendType: "not_disclosed",
    stipendAmount: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const deadline = new Date(formData.applicationDeadline);
    const now = new Date();

    if (!formData.title.trim()) return "Title required";
    if (!formData.description.trim()) return "Description required";

    if (end <= start) return "End date must be after start date";
    if (deadline >= start)
      return "Deadline must be before start date";
    if (deadline < now)
      return "Deadline cannot be in the past";

    if (formData.positions < 1)
      return "Positions must be at least 1";

    if (formData.maxApplicants < 1)
      return "Max applicants must be at least 1";

    const skills = formData.skillsRequired
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s !== "");

    if (skills.length === 0)
      return "At least one skill required";

    if (formData.stipendType === "paid") {
      if (!formData.stipendAmount || formData.stipendAmount < 0)
        return "Valid stipend amount required";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      const skillsArray = formData.skillsRequired
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s !== "");

      const response = await axios.post(
        `${BASE_URL}/api/internships`,
        {
          ...formData,
          skillsRequired: skillsArray,
          maxApplicants: Number(formData.maxApplicants),
          positions: Number(formData.positions),
          stipendAmount:
            formData.stipendType === "paid"
              ? Number(formData.stipendAmount)
              : null,
        },
        { withCredentials: true }
      );

      setSuccess(response.data.message);

      setFormData({
        title: "",
        description: "",
        startDate: "",
        endDate: "",
        applicationDeadline: "",
        mode: "remote",
        skillsRequired: "",
        maxApplicants: 1,
        positions: 1,
        stipendType: "not_disclosed",
        stipendAmount: "",
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to post internship"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-3xl bg-white shadow-xl rounded-2xl p-8">

        <h2 className="text-3xl font-bold mb-6 text-center">
          Post Internship
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          <input
            type="text"
            name="title"
            placeholder="Internship Title"
            value={formData.title}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2"
            required
          />

          <textarea
            name="description"
            placeholder="Description"
            rows="4"
            value={formData.description}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="border rounded-lg px-4 py-2"
              required
            />
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="border rounded-lg px-4 py-2"
              required
            />
          </div>

          <input
            type="date"
            name="applicationDeadline"
            value={formData.applicationDeadline}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2"
            required
          />

          <select
            name="mode"
            value={formData.mode}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2"
          >
            <option value="remote">Remote</option>
            <option value="onsite">Onsite</option>
            <option value="hybrid">Hybrid</option>
          </select>

          <input
            type="text"
            name="skillsRequired"
            placeholder="React, Node.js"
            value={formData.skillsRequired}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2"
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              name="positions"
              min="1"
              value={formData.positions}
              onChange={handleChange}
              className="border rounded-lg px-4 py-2"
              required
            />
            <input
              type="number"
              name="maxApplicants"
              min="1"
              value={formData.maxApplicants}
              onChange={handleChange}
              className="border rounded-lg px-4 py-2"
              required
            />
          </div>

          <select
            name="stipendType"
            value={formData.stipendType}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2"
          >
            <option value="not_disclosed">Not Disclosed</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
          </select>

          {formData.stipendType === "paid" && (
            <input
              type="number"
              name="stipendAmount"
              placeholder="Stipend Amount (₹ per month)"
              min="0"
              value={formData.stipendAmount}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2"
              required
            />
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
          >
            {loading ? "Posting..." : "Post Internship"}
          </button>

        </form>
      </div>
    </div>
  );
};

export default PostInternships;
