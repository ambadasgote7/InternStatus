import React from "react";
import { NavLink, Link } from "react-router-dom";
import { useSelector } from "react-redux";

export default function CompanySidebar() {
  const user = useSelector((s) => s.user?.user) || {};

  const showRegister = !user.isRegistered;
  const showPending = user.isRegistered && !user.isVerified;
  const showCore = user.isRegistered && user.isVerified;

  const linkClass = ({ isActive }) =>
    `group flex flex-col items-stretch px-4 py-3 rounded-[14px] transition-all duration-300 border mb-1.5 no-underline transform ${
      isActive
        ? "bg-[#6C5CE7] border-[#6C5CE7] text-[#FFFFFF] shadow-md shadow-[#6C5CE7]/20"
        : "bg-transparent border-transparent text-[#2D3436] hover:bg-[#F5F6FA] hover:text-[#6C5CE7] hover:translate-x-1"
    }`;

  return (
    <aside className="w-60 h-full bg-[#FFFFFF] border-r border-[#F5F6FA] flex flex-col flex-none z-10 overflow-hidden font-['Nunito'] shadow-sm transition-all duration-300">
      <nav className="flex-1 overflow-y-auto no-scrollbar p-4 flex flex-col gap-1.5">
        {showCore && (
          <>
            <NavLink to="/company/dashboard" className={linkClass} end>
              <span className="text-[13px] font-bold">Dashboard</span>
            </NavLink>

            <NavLink to="/company/invite-mentor" className={linkClass} end>
              <span className="text-[13px] font-bold">Add Mentor</span>
            </NavLink>
            <NavLink to="/company/mentors" className={linkClass} end>
              <span className="text-[13px] font-bold">Mentor List</span>
            </NavLink>
            <NavLink to="/company/post-internship" className={linkClass} end>
              <span className="text-[13px] font-bold">Post Internships</span>
            </NavLink>
            <NavLink
              to="/company/company-internships"
              className={linkClass}
              end
            >
              <span className="text-[13px] font-bold">View Postings</span>
            </NavLink>
            <NavLink to="/company/interns" className={linkClass} end>
              <span className="text-[13px] font-bold">Interns List</span>
            </NavLink>
          </>
        )}

        {showPending && (
          <div className="mt-4">
            <Link
              to="/pending-verification"
              className="block text-center px-4 py-3 rounded-[14px] text-[#2D3436] font-bold bg-[#F5F6FA] border border-[#2D3436] transition-all duration-300 no-underline tracking-wide hover:bg-[#2D3436] hover:text-[#FFFFFF] transform hover:-translate-y-0.5 shadow-sm hover:shadow-md text-[13px]"
            >
              Verification Pending
            </Link>
          </div>
        )}

        {showRegister && (
          <div className="mt-4">
            <Link
              to="/company/register"
              className="block text-center px-5 py-3 rounded-[14px] text-[#FFFFFF] font-bold bg-[#6C5CE7] hover:opacity-90 transition-all duration-300 no-underline tracking-wide border-none text-[13px] transform hover:-translate-y-0.5 shadow-md"
            >
              Complete Registration
            </Link>
          </div>
        )}
      </nav>
    </aside>
  );
}
