import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutUser } from "../../utils/logoutUser";
import Logo from "../../assets/OG_LOGO.png";

const MentorNavBar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsProfileOpen(false); // Close dropdown first

    // Call the logout utility
    try {
      await logoutUser(dispatch, navigate);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#FFFFFF] border-b border-[#F5F6FA] font-['Nunito'] shadow-sm box-border transition-all duration-300">
      <div className="w-full px-6 py-4 flex flex-col xl:flex-row xl:justify-between xl:items-center gap-5">
        <div className="flex flex-wrap items-center gap-2 md:gap-3 text-sm font-medium flex-1">
          <Link
            to="/mentor/dashboard"
            className="ml-4 text-[23px] font-black tracking-tighter text-[#6C5CE7] mr-2 xl:mr-6 whitespace-nowrap no-underline flex items-center transition-all duration-300 hover:opacity-80"
          >
            <img src={Logo} alt="InternStatus" className="h-10" />
            <span className="text-[14px] font-bold text-[#2D3436] opacity-50 ml-3 tracking-wide uppercase">
              Mentor
            </span>
          </Link>
        </div>

        <div className="flex items-center xl:justify-end relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-10 h-10 rounded-full bg-[#F5F6FA] border-2 border-transparent flex items-center justify-center text-[#2D3436] font-bold text-[14px] hover:bg-[#6C5CE7] hover:text-[#FFFFFF] hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-300 focus:outline-none cursor-pointer"
          >
            M
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-[#FFFFFF] border border-[#F5F6FA] rounded-[14px] shadow-lg z-50 overflow-hidden flex flex-col transform transition-all duration-300 origin-top-right">
              <Link
                to="/mentor/profile"
                onClick={() => setIsProfileOpen(false)}
                className="block w-full px-4 py-3 text-[13px] font-bold text-[#2D3436] hover:bg-[#F5F6FA] hover:text-[#6C5CE7] transition-colors duration-200 no-underline border-b border-[#F5F6FA]"
              >
                Profile
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="block w-full px-4 py-3 text-[13px] font-bold text-[#cc0000] hover:bg-[#F5F6FA] transition-colors duration-200 text-left border-none bg-transparent cursor-pointer outline-none"
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

export default MentorNavBar;
