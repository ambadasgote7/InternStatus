import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const linkClass = ({ isActive }) =>
    `group flex flex-col items-stretch px-5 py-4 rounded-[14px] transition-all duration-300 border mb-1 no-underline ${
      isActive
        ? "bg-[#111] border-[#111] text-[#fff]"
        : "bg-transparent border-transparent text-[#333] hover:bg-[#f9f9f9] hover:border-[#e5e5e5]"
    }`;

  return (
    <aside className="w-64 h-screen sticky top-0 bg-[#fff] border-r border-[#e5e5e5] flex flex-col flex-none z-50 overflow-hidden">
      <div className="h-24 flex items-center px-8 border-b border-[#e5e5e5] shrink-0">
        <div className="flex flex-col">
          <h2 className="text-[23px] font-black m-0 tracking-tighter text-[#333]">
            NAVIGATOR
          </h2>
          <span className="text-[11px] font-bold text-[#333] opacity-60 uppercase tracking-[0.4em] mt-1">
            Main Interface
          </span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto no-scrollbar p-6 flex flex-col gap-1">
        <NavLink to="/" className={linkClass} end>
          <span className="text-[14px] font-bold">Home Baseline</span>
        </NavLink>

        <NavLink to="/dashboard" className={linkClass}>
          <span className="text-[14px] font-bold">Data Dashboard</span>
        </NavLink>

        <NavLink to="/profile" className={linkClass}>
          <span className="text-[14px] font-bold">User Profile</span>
        </NavLink>

        <div className="h-px bg-[#e5e5e5] my-6 mx-2" />

        <div className="px-5 mb-4">
          <span className="text-[11px] font-bold text-[#333] opacity-50 uppercase tracking-widest">
            External Uplinks
          </span>
        </div>

        <a
          href="https://github.com"
          target="_blank"
          rel="noreferrer"
          className="px-5 py-3 text-[13px] font-bold text-[#333] opacity-70 uppercase tracking-widest no-underline hover:opacity-100 transition-opacity"
        >
          Source Repository
        </a>
      </nav>

      <div className="p-6 border-t border-[#e5e5e5] shrink-0 bg-[#fff]">
        <div className="flex items-center gap-3 px-2">
          <div className="w-2 h-2 rounded-full bg-[#111]" />
          <span className="text-[11px] font-black text-[#333] opacity-60 uppercase tracking-widest">
            System Online
          </span>
        </div>
      </div>
    </aside>
  );
}
