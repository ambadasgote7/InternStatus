import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutUser } from "../../utils/logoutUser";
import Logo from "../../assets/OG_LOGO.png";

const AdminNavBar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    logoutUser(dispatch, navigate);
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#FFFFFF] border-b border-[#F5F6FA] font-['Nunito'] shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center gap-5">
        <h1 className="ml-4 text-[23px] font-black tracking-tighter text-[#6C5CE7] m-0 flex items-center transition-all duration-300">
          <img src={Logo} alt="InternStatus" className="h-10" />
          <span className="text-[14px] font-bold text-[#2D3436] opacity-50 ml-3 tracking-wide uppercase">
            Admin
          </span>
        </h1>

        <div className="relative flex items-center gap-3">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-10 h-10 rounded-full bg-[#F5F6FA] border-2 border-transparent flex items-center justify-center text-[#2D3436] font-bold text-[14px] hover:bg-[#6C5CE7] hover:text-[#FFFFFF] hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-300 focus:outline-none cursor-pointer"
          >
            A
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-[#FFFFFF] border border-[#F5F6FA] rounded-[14px] shadow-lg z-50 overflow-hidden flex flex-col transform transition-all duration-300 origin-top-right">
              <Link
                to="/admin/profile"
                onClick={() => setIsProfileOpen(false)}
                className="px-4 py-3 text-[13px] font-bold text-[#2D3436] hover:bg-[#F5F6FA] hover:text-[#6C5CE7] transition-colors duration-200 no-underline border-b border-[#F5F6FA]"
              >
                Profile
              </Link>
              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  handleLogout();
                }}
                className="px-4 py-3 text-[13px] font-bold text-[#cc0000] hover:bg-[#F5F6FA] transition-colors duration-200 text-left border-none bg-transparent cursor-pointer"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default AdminNavBar;
