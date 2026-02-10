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
    mode: "Online",
    skillsRequired: "",
    maxApplicants: 1,
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

    if (end <= start) return "End date must be after start date";
    if (deadline < now) return "Application deadline cannot be in the past";
    if (deadline >= start) return "Application deadline must be before start date";
    if (Number(formData.maxApplicants) < 1)
      return "Max applicants must be at least 1";

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

      const response = await axios.post(`${BASE_URL}/api/internships`, {
        title: formData.title.trim(),
        description: formData.description.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate,
        applicationDeadline: formData.applicationDeadline,
        mode: formData.mode,
        skillsRequired: formData.skillsRequired
          .split(",")
          .map((skill) => skill.trim())
          .filter((skill) => skill !== ""),
        maxApplicants: Number(formData.maxApplicants),
      }, 
      { withCredentials: true }
    );

      setSuccess(response.data.message || "Internship posted successfully");

      setFormData({
        title: "",
        description: "",
        startDate: "",
        endDate: "",
        applicationDeadline: "",
        mode: "Online",
        skillsRequired: "",
        maxApplicants: 1,
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to post internship");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-3xl bg-white shadow-2xl rounded-2xl p-10 border border-gray-100">
        <div className="mb-8 text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-2">
            Post New Internship
          </h2>
          <p className="text-gray-500">Fill in the details to create an internship opportunity</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg flex items-start">
            <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-r-lg flex items-start">
            <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Internship Title
            </label>
            <input
              type="text"
              name="title"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition duration-200"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Frontend Developer Intern"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              rows="5"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition duration-200 resize-none"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the internship role, responsibilities, and requirements..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition duration-200"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition duration-200"
                value={formData.endDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Application Deadline
            </label>
            <input
              type="date"
              name="applicationDeadline"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition duration-200"
              value={formData.applicationDeadline}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Work Mode
            </label>
            <select
              name="mode"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition duration-200 bg-white"
              value={formData.mode}
              onChange={handleChange}
            >
              <option value="remote">🌐 Remote</option>
              <option value="onsite">🏢 Onsite</option>
              <option value="hybrid">🔄 Hybrid</option>
            </select>

          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Skills Required
            </label>
            <input
              type="text"
              name="skillsRequired"
              placeholder="React, Node.js, MongoDB, Git"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition duration-200"
              value={formData.skillsRequired}
              onChange={handleChange}
              required
            />
            <p className="text-xs text-gray-500 mt-1">Separate skills with commas</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Maximum Applicants
            </label>
            <input
              type="number"
              name="maxApplicants"
              min="1"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition duration-200"
              value={formData.maxApplicants}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-[1.02] transition duration-200 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Posting...
              </span>
            ) : (
              "Post Internship"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostInternships;