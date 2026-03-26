import React from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

export default function MentorSidebar() {
  const user = useSelector((s) => s.user?.user) || {};

  const showCore = user.isRegistered && user.isVerified;

  const linkClass = ({ isActive }) =>
    `group flex flex-col items-stretch px-3 py-2.5 rounded-xl transition-all duration-300 border mb-1 no-underline ${
      isActive
        ? "bg-blue-600 border-blue-600 text-white"
        : "bg-transparent border-transparent text-gray-400 hover:bg-gray-800 hover:border-gray-700 hover:text-white"
    }`;

  return (
    <aside className="w-60 h-full bg-gray-900 border-r border-gray-800 flex flex-col flex-none z-10 overflow-hidden">
      <div className="h-16 flex items-center px-4 border-b border-gray-800 shrink-0">
        <div className="flex flex-col">
          <h2 className="text-xl font-black m-0 tracking-tighter text-white">
            Mentor Menu
          </h2>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto no-scrollbar p-3 flex flex-col gap-1">
        {showCore && (
          <>
            <NavLink to="/mentor/dashboard" className={linkClass} end>
              <span className="text-sm font-bold">Dashboard</span>
            </NavLink>
            <NavLink to="/mentor/profile" className={linkClass} end>
              <span className="text-sm font-bold">My Profile</span>
            </NavLink>
            <NavLink to="/mentor/interns" className={linkClass} end>
              <span className="text-sm font-bold">Interns</span>
            </NavLink>
          </>
        )}
      </nav>
    </aside>
  );
}
