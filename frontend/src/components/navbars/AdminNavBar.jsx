import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutUser } from "../../utils/logoutUser";

const AdminNavBar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    logoutUser(dispatch, navigate);
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#fff] border-b border-[#e5e5e5]">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center gap-5">
        <h1 className="text-[23px] font-black tracking-tighter text-[#333] m-0 flex items-center">
          InternStatus
          <span className="text-[14px] font-bold text-[#333] opacity-50 ml-3 tracking-wide uppercase">
            Admin
          </span>
        </h1>

        <div className="relative flex items-center gap-3">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-10 h-10 rounded-full bg-[#f9f9f9] border border-[#e5e5e5] flex items-center justify-center text-[#333] font-bold text-[14px] hover:bg-[#e5e5e5] transition-colors focus:outline-none cursor-pointer"
          >
            A
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-[#fff] border border-[#e5e5e5] rounded-[14px] shadow-sm z-50 overflow-hidden flex flex-col">
              <Link
                to="/admin/profile"
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

export default AdminNavBar;
