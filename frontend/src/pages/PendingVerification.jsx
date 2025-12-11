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
      await axios.post(BASE_URL + "/api/auth/logout", {}, { withCredentials: true });
      dispatch(removeUser());
      navigate("/login");
    } catch (err) {
      console.error(err);
    }
  };
  

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-base-200 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-3 text-center">
        Verification Pending
      </h2>

      <p className="text-center text-sm opacity-80 mb-4">
        Your account has been submitted for verification.  
        Once verified, you will be able to access your dashboard and all features.
      </p>

      <p className="text-center text-sm mb-6">
        Please wait while your details are reviewed.
      </p>

      <button
        className="btn btn-neutral w-full"
        onClick={handleLogout}
      >
       Logout
      </button>
    </div>
  );
};

export default PendingVerification;
