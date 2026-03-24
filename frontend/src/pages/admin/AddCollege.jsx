import axios from "axios";
import AdminNavBar from "../../components/navbars/AdminNavBar";
import { BASE_URL } from "../../utils/constants";
import { useState } from "react";

const AddCollege = () => {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleAddCollege = async () => {
    if (!name.trim() || !location.trim()) {
      alert("College name and location are required");
      return;
    }

    try {
      setSubmitting(true);
      await axios.post(
        `${BASE_URL}/api/college/add-college`,
        { name, location },
        { withCredentials: true },
      );
      alert("College added successfully");
      setName("");
      setLocation("");
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f9f9f9] flex flex-col text-[#333]">
      <AdminNavBar />

      <main className="flex-grow flex flex-col items-center justify-center p-4">
        <div className="text-center mb-6">
          <h1 className="text-[23px] font-black text-[#333] m-0 mb-1 leading-tight">
            Add College
          </h1>
          <p className="text-[13px] text-[#333] opacity-70 m-0">
            Register a new institution into InternStatus
          </p>
        </div>

        <div className="w-full max-w-[360px] bg-[#fff] border border-[#e5e5e5] rounded-[20px] p-6 shadow-sm flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-bold text-[#333]">
              College Name
            </label>
            <input
              type="text"
              value={name}
              placeholder="e.g. Institute of Technology"
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 text-[13px] text-[#333] bg-[#fff] border border-[#333] rounded-[14px] outline-none"
              disabled={submitting}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-bold text-[#333]">
              Location
            </label>
            <input
              type="text"
              value={location}
              placeholder="e.g. Mumbai, Maharashtra"
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-3 text-[13px] text-[#333] bg-[#fff] border border-[#333] rounded-[14px] outline-none"
              disabled={submitting}
            />
          </div>

          <button
            onClick={handleAddCollege}
            disabled={submitting}
            className="w-full mt-2 py-3 text-[14px] font-bold text-[#fff] bg-[#111] border-none rounded-[14px] cursor-pointer hover:opacity-80 flex justify-center items-center disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit College"}
          </button>
        </div>
      </main>
    </div>
  );
};

export default AddCollege;
