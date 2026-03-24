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
    <div className="min-h-screen w-full bg-[#f9f9f9] flex items-center justify-center px-4 font-sans text-[#333]">
      <div className="w-full max-w-md bg-[#fff] rounded-[20px] shadow-sm border border-[#e5e5e5] p-8 md:p-10 text-center">
        <header className="mb-8 border-b border-[#f9f9f9] pb-6">
          <div className="text-[11px] font-black text-[#cc0000] uppercase tracking-[0.2em] mb-2">
            Security Protocol
          </div>
          <h2 className="text-[26px] font-black text-[#111] m-0 tracking-tight leading-tight">
            Access Revoked
          </h2>
        </header>

        <div className="flex flex-col gap-4 mb-8">
          <p className="text-[14px] font-medium leading-relaxed opacity-70 m-0">
            Your organizational role access has been suspended by the
            administrator. You no longer have permission to access the
            management dashboard or execute role-based operations.
          </p>
          <p className="text-[12px] font-bold opacity-40 uppercase tracking-tight m-0">
            Contact your institutional administrator to request credential
            restoration.
          </p>
        </div>

        <button
          className="w-full py-4 rounded-[14px] bg-[#111] text-[#fff] font-black text-[12px] uppercase tracking-widest border-none cursor-pointer hover:opacity-80 transition-opacity"
          onClick={handleLogout}
        >
          Terminate Session
        </button>
      </div>
    </div>
  );
};

export default AccessRevoked;
