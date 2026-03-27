import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import API from "../../api/api";
import { logoutUser } from "../../utils/logoutUser";
import Logo from "../../assets/OG_LOGO.png";

const CollegeNavBar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.user?.user) || {};
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    logoutUser(dispatch, navigate);
  };

  const showRegister = !user.isRegistered;
  const showPending = user.isRegistered && !user.isVerified;
  const showCore = user.isRegistered && user.isVerified;

  const navLinkClass =
    "px-3 py-2.5 rounded-[14px] text-[13px] font-bold text-[#2D3436] hover:bg-[#F5F6FA] hover:text-[#6C5CE7] transition-all duration-300 no-underline tracking-wide";

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#FFFFFF] border-b border-[#F5F6FA] font-['Nunito'] shadow-sm box-border transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col xl:flex-row xl:justify-between xl:items-center gap-5">
        <div className="flex flex-wrap items-center gap-2 md:gap-3 text-sm font-medium flex-1">
          <Link
            to="/faculty/dashboard"
            className="ml-4 text-[23px] font-black tracking-tighter text-[#6C5CE7] mr-2 xl:mr-6 whitespace-nowrap no-underline flex items-center transition-all duration-300 hover:opacity-80"
          >
            <img src={Logo} alt="InternStatus" className="h-10" />
            <span className="text-[14px] font-bold text-[#2D3436] opacity-50 ml-3 tracking-wide uppercase">
              College
            </span>
          </Link>

          <div className="flex flex-wrap items-center gap-3 ml-auto xl:ml-6">
            {showPending && (
              <Link
                to="/pending-verification"
                className="px-4 py-2.5 rounded-[14px] text-[#2D3436] font-bold bg-[#F5F6FA] border border-[#2D3436] hover:bg-[#2D3436] hover:text-[#FFFFFF] hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-300 no-underline tracking-wide text-[13px]"
              >
                Verification Pending
              </Link>
            )}

            {showRegister && (
              <Link
                to="/faculty/register"
                className="px-5 py-2.5 rounded-[14px] text-[#FFFFFF] font-bold bg-[#6C5CE7] hover:opacity-90 hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-300 no-underline tracking-wide border-none text-[13px]"
              >
                Complete Registration
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center xl:justify-end relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-10 h-10 rounded-full bg-[#F5F6FA] border-2 border-transparent flex items-center justify-center text-[#2D3436] font-bold text-[14px] hover:bg-[#6C5CE7] hover:text-[#FFFFFF] hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-300 focus:outline-none cursor-pointer"
          >
            C
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-[#FFFFFF] border border-[#F5F6FA] rounded-[14px] shadow-lg z-50 overflow-hidden flex flex-col transform transition-all duration-300 origin-top-right">
              <Link
                to="/college/profile"
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

export default CollegeNavBar;
