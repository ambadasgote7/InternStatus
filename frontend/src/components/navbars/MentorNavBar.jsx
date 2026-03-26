import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutUser } from "../../utils/logoutUser";

const MentorNavBar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    logoutUser(dispatch, navigate);
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-black border-b border-gray-800 box-border transition-all">
      <div className="w-full px-6 py-4 flex flex-col xl:flex-row xl:justify-between xl:items-center gap-5">
        <div className="flex flex-wrap items-center gap-2 md:gap-3 text-sm font-medium flex-1">
          <Link
            to="/mentor/dashboard"
            className="text-[23px] font-black tracking-tighter text-blue-500 mr-2 xl:mr-6 whitespace-nowrap no-underline flex items-center"
          >
            InternStatus
            <span className="text-[14px] font-bold text-gray-400 opacity-80 ml-3 tracking-wide uppercase">
              Mentor
            </span>
          </Link>
        </div>

        <div className="flex items-center xl:justify-end relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-10 h-10 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center text-white font-bold text-[14px] hover:bg-gray-800 transition-colors focus:outline-none cursor-pointer"
          >
            M
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-gray-900 border border-gray-800 rounded-xl shadow-sm z-50 overflow-hidden flex flex-col">
              <Link
                to="/mentor/profile"
                onClick={() => setIsProfileOpen(false)}
                className="px-4 py-3 text-[13px] font-bold text-white hover:bg-gray-800 no-underline border-b border-gray-800"
              >
                Profile
              </Link>
              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  handleLogout();
                }}
                className="px-4 py-3 text-[13px] font-bold text-red-500 hover:bg-gray-800 text-left border-none bg-transparent cursor-pointer"
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