import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import API from "../../api/api";
import { logoutUser } from "../../utils/logoutUser";

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
    "px-3 py-2.5 rounded-[14px] text-[13px] font-bold text-[#333] hover:bg-[#f9f9f9] transition-colors no-underline tracking-wide";

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#fff] border-b border-[#e5e5e5] box-border transition-all">
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col xl:flex-row xl:justify-between xl:items-center gap-5">
        <div className="flex flex-wrap items-center gap-2 md:gap-3 text-sm font-medium flex-1">
          <Link
            to="/faculty/dashboard"
            className="text-[23px] font-black tracking-tighter text-[#333] mr-2 xl:mr-6 whitespace-nowrap no-underline flex items-center"
          >
            InternStatus
            <span className="text-[14px] font-bold text-[#333] opacity-50 ml-3 tracking-wide uppercase">
              College
            </span>
          </Link>

          {showCore && (
            <div className="flex flex-wrap items-center gap-1 xl:border-l border-[#e5e5e5] xl:pl-6">
              <Link to="/faculty/dashboard" className={navLinkClass}>
                Dashboard
              </Link>
              <Link to="/college/faculty" className={navLinkClass}>
                Faculty List
              </Link>
              <Link to="/college/students" className={navLinkClass}>
                Student List
              </Link>
              <Link to="/college/invite-faculty" className={navLinkClass}>
                Add Faculty
              </Link>
              <Link to="/college/invite-student" className={navLinkClass}>
                Add Student
              </Link>
              <Link to="/college/courses" className={navLinkClass}>
                Courses
              </Link>
              <Link to="/credits" className={navLinkClass}>
                Assign Credits
              </Link>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 ml-auto xl:ml-6">
            {showPending && (
              <Link
                to="/pending-verification"
                className="px-4 py-2.5 rounded-[14px] text-[#333] font-bold bg-[#f9f9f9] border border-[#333] transition-colors no-underline tracking-wide hover:bg-[#e5e5e5] text-[13px]"
              >
                Verification Pending
              </Link>
            )}

            {showRegister && (
              <Link
                to="/faculty/register"
                className="px-5 py-2.5 rounded-[14px] text-[#fff] font-bold bg-[#111] hover:opacity-80 transition-opacity no-underline tracking-wide border-none text-[13px]"
              >
                Complete Registration
              </Link>
            )}
          </div>
        </div>

        {/* Profile Dropdown */}
        <div className="flex items-center xl:justify-end relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-10 h-10 rounded-full bg-[#f9f9f9] border border-[#e5e5e5] flex items-center justify-center text-[#333] font-bold text-[14px] hover:bg-[#e5e5e5] transition-colors focus:outline-none cursor-pointer"
          >
            C
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-[#fff] border border-[#e5e5e5] rounded-[14px] shadow-sm z-50 overflow-hidden flex flex-col">
              <Link
                to="/college/profile"
                onClick={() => setIsProfileOpen(false)}
                className="px-4 py-3 text-[13px] font-bold text-[#333] hover:bg-[#f9f9f9] no-underline border-b border-[#e5e5e5]"
              >
                Profile
              </Link>
              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  handleLogout();
                }}
                className="px-4 py-3 text-[13px] font-bold text-[#cc0000] hover:bg-[#f9f9f9] text-left border-none bg-transparent cursor-pointer"
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
