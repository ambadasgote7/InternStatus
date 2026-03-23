import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../../utils/logoutUser";

const StudentNavBar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.user?.user) || {};

   const handleLogout = () => {
       logoutUser(dispatch, navigate);
     };
  

  const showRegister = !user.isRegistered;
  const showPending = user.isRegistered && !user.isVerified;
  const showCore = user.isRegistered && user.isVerified;

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#0B0F19]/80 backdrop-blur-2xl border-b border-white/10 font-sans box-border transition-all selection:bg-fuchsia-500/30 selection:text-fuchsia-200">
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col lg:flex-row lg:justify-between lg:items-center gap-5">
        <div className="flex flex-wrap items-center gap-2 md:gap-3 text-sm font-medium">
          <Link
            to="/student/dashboard"
            className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400 mr-6 whitespace-nowrap no-underline transition-transform hover:scale-105"
          >
            InternStatus
          </Link>

          {showCore && (
            <div className="flex flex-wrap items-center gap-2 border-l border-white/10 pl-6">
              <Link
                to="/student/dashboard"
                className="px-4 py-2.5 rounded-xl text-white/70 font-bold hover:text-fuchsia-300 hover:bg-white/5 transition-all duration-300 no-underline tracking-wide"
              >
                Dashboard
              </Link>

              <Link
                to="/student/browse-internships"
                className="px-4 py-2.5 rounded-xl text-white/70 font-bold hover:text-fuchsia-300 hover:bg-white/5 transition-all duration-300 no-underline tracking-wide"
              >
                Browse
              </Link>

              <Link
                to="/student/my-applications"
                className="px-4 py-2.5 rounded-xl text-white/70 font-bold hover:text-fuchsia-300 hover:bg-white/5 transition-all duration-300 no-underline tracking-wide"
              >
                Applications
              </Link>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 ml-auto lg:ml-6">
            {showPending && (
              <Link
                to="/pending-verification"
                className="px-4 py-2.5 rounded-xl text-violet-300 font-bold bg-violet-500/20 border border-violet-500/30 transition-all duration-300 no-underline tracking-wide hover:bg-violet-500/30"
              >
                Verification Pending
              </Link>
            )}

            {showRegister && (
              <Link
                to="/student/profile"
                className="px-5 py-2.5 rounded-xl text-white font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:shadow-[0_4px_20px_-4px_rgba(217,70,239,0.5)] transition-all duration-300 no-underline tracking-wide hover:-translate-y-0.5 border-none"
              >
                Complete Registration
              </Link>
            )}

            <Link
              to="/student/profile"
              className="px-4 py-2.5 rounded-xl text-white/70 font-bold hover:text-fuchsia-300 hover:bg-white/5 transition-all duration-300 no-underline tracking-wide"
            >
              Profile
            </Link>

            <Link
              to="/student/credits"
              className="px-4 py-2.5 rounded-xl text-white/70 font-bold hover:text-fuchsia-300 hover:bg-white/5 transition-all duration-300 no-underline tracking-wide"
            >
              Credits
            </Link>
          </div>
        </div>

        <div className="flex items-center lg:justify-end">
          <button
            onClick={handleLogout}
            className="w-full lg:w-auto px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/80 font-bold tracking-widest uppercase text-xs hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-all duration-300 cursor-pointer outline-none hover:-translate-y-0.5"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default StudentNavBar;