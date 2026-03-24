// src/pages/PendingVerification.jsx
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch } from "react-redux";
import { removeUser } from "../store/userSlice";
import { useNavigate } from "react-router-dom";

const PendingVerification = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      await axios.post(
        BASE_URL + "/api/auth/logout",
        {},
        { withCredentials: true },
      );
      dispatch(removeUser());
      navigate("/login");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-white to-[#FFEDC7]/20 flex items-center justify-center px-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-md shadow-xl border border-[#FFEDC7] p-8 md:p-10 transition-all">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-[#FFEDC7]/40 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-[#EB4C4C]"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold tracking-tight text-[#1A1A1A]">
            Verification Pending
          </h2>
        </div>

        {/* Message */}
        <p className="text-center text-gray-600 text-sm mb-4 leading-relaxed">
          Your account has been submitted for verification. Once approved, you
          will be able to access your dashboard and all platform features.
        </p>

        <p className="text-center text-gray-500 text-sm mb-8">
          Please wait while our team reviews your details.
        </p>

        {/* Logout Button */}
        <button
          className="w-full px-6 py-4 rounded-md bg-[#EB4C4C] text-white font-bold text-base tracking-wide hover:bg-[#FF7070] shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default PendingVerification;
