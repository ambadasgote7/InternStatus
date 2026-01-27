import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch } from "react-redux";
import { removeUser } from "../store/userSlice";
import { useNavigate } from "react-router-dom";

const AccessRevoked = () => {
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
    <h2 className="text-xl font-semibold mb-3 text-center text-red-600">
      Access Revoked
    </h2>

    <p className="text-center text-sm opacity-80 mb-4">
      Your role access has been revoked by the administrator.
      You currently do not have permission to access the dashboard or perform role-based actions.
    </p>

    <p className="text-center text-sm mb-6">
      If you believe this is a mistake or need access restored,
      please contact your institution or system administrator.
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

export default AccessRevoked