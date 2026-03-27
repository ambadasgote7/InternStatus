import React from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

export default function MentorSidebar() {
  const user = useSelector((s) => s.user?.user) || {};

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
            <NavLink to="/mentor/dashboard" className={linkClass} end>
              <span className="text-[13px] font-bold">Dashboard</span>
            </NavLink>

            <NavLink to="/mentor/interns" className={linkClass} end>
              <span className="text-[13px] font-bold">Interns</span>
            </NavLink>
          </>
        )}
      </nav>
    </aside>
  );
}
