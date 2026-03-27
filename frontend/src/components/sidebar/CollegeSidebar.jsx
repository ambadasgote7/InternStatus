import { NavLink } from "react-router-dom";
import API from "../../api/api";

export default function CollegeSidebar() {
  const linkClass = ({ isActive }) =>
    `group flex flex-col items-stretch px-4 py-3 rounded-[14px] transition-all duration-300 border mb-1.5 no-underline transform ${
      isActive
        ? "bg-[#6C5CE7] border-[#6C5CE7] text-[#FFFFFF] shadow-md shadow-[#6C5CE7]/20"
        : "bg-transparent border-transparent text-[#2D3436] hover:bg-[#F5F6FA] hover:text-[#6C5CE7] hover:translate-x-1"
    }`;

  return (
    <aside className="w-60 h-screen top-0 bg-[#FFFFFF] border-r border-[#F5F6FA] flex flex-col flex-none z-50 overflow-hidden font-['Nunito'] shadow-sm transition-all duration-300">
      <nav className="flex-1 overflow-y-auto no-scrollbar p-4 flex flex-col gap-1.5">
        <NavLink to="/college/dashboard" className={linkClass} end>
          <span className="text-[13px] font-bold">Dashboard</span>
        </NavLink>

        <NavLink to="/college/faculty" className={linkClass}>
          <span className="text-[13px] font-bold">Faculty</span>
        </NavLink>

        <NavLink to="/college/students" className={linkClass}>
          <span className="text-[13px] font-bold">Student</span>
        </NavLink>

        <NavLink to="/college/invite-faculty" className={linkClass}>
          <span className="text-[13px] font-bold">Add Faculty</span>
        </NavLink>

        <NavLink to="/college/invite-student" className={linkClass}>
          <span className="text-[13px] font-bold">Add Student</span>
        </NavLink>

        <NavLink to="/college/courses" className={linkClass}>
          <span className="text-[13px] font-bold">Courses</span>
        </NavLink>

        <NavLink to="college/credits" className={linkClass}>
          <span className="text-[13px] font-bold">Assign Credits</span>
        </NavLink>
      </nav>
    </aside>
  );
}
