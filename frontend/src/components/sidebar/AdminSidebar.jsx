import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import API from "../../api/api";

export default function AdminSidebar() {
  const [counts, setCounts] = useState({
    all: 0,
    college: 0,
    company: 0,
  });

  const fetchCounts = async () => {
    try {
      const res = await API.get("/admin/onboarding/pending?type=all");
      const colleges = res.data?.data?.colleges || [];
      const companies = res.data?.data?.companies || [];

      setCounts({
        all: colleges.length + companies.length,
        college: colleges.length,
        company: companies.length,
      });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCounts();
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, []);

  const linkClass = ({ isActive }) =>
    `group flex flex-col items-stretch px-3 py-2.5 rounded-[14px] transition-all duration-300 border mb-1 no-underline ${
      isActive
        ? "bg-[#111] border-[#111] text-[#fff]"
        : "bg-transparent border-transparent text-[#333] hover:bg-[#f9f9f9] hover:border-[#e5e5e5]"
    }`;

  return (
    <aside className="w-60 h-screen top-0 bg-[#fff] border-r border-[#e5e5e5] flex flex-col flex-none z-50 overflow-hidden">
      <div className="h-16 flex items-center px-4 border-b border-[#e5e5e5] shrink-0">
        <div className="flex flex-col">
          <h2 className="text-[20px] font-black m-0 tracking-tighter text-[#333]">
            CORE ADMIN
          </h2>
          <span className="text-[10px] font-bold text-[#333] opacity-60 uppercase tracking-[0.2em] mt-0.5">
            Command Center
          </span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto no-scrollbar p-3 flex flex-col gap-1">
        <NavLink to="/admin" className={linkClass} end>
          <span className="text-[13px] font-bold">Dashboard</span>
        </NavLink>

        <NavLink to="/admin/users" className={linkClass}>
          <span className="text-[13px] font-bold">User Matrix</span>
        </NavLink>

        <NavLink to="/admin/onboarding/pending" className={linkClass}>
          <div className="flex justify-between items-center">
            <span className="text-[13px] font-bold">Pending Requests</span>
            {counts.all > 0 && (
              <span className="bg-[#111] text-[#fff] text-[10px] font-bold px-2 py-0.5 rounded-full">
                {counts.all}
              </span>
            )}
          </div>

          <div
            className={`overflow-hidden transition-all duration-500 ${counts.all > 0 ? "max-h-20 mt-2 opacity-100" : "max-h-0 opacity-0"}`}
          >
            <div className="flex flex-col gap-1.5 pl-2 border-l-2 border-[#e5e5e5] ml-1">
              <div className="flex justify-between items-center text-[11px] font-bold text-[#333] opacity-70">
                Colleges{" "}
                <span className="font-black opacity-100">{counts.college}</span>
              </div>
              <div className="flex justify-between items-center text-[11px] font-bold text-[#333] opacity-70">
                Companies{" "}
                <span className="font-black opacity-100">{counts.company}</span>
              </div>
            </div>
          </div>
        </NavLink>

        <NavLink to="/admin/onboarding/verified" className={linkClass}>
          <span className="text-[13px] font-bold">Verified Onboarding</span>
        </NavLink>

        <div className="h-px bg-[#e5e5e5] my-2 mx-2" />

        <NavLink to="/admin/colleges" className={linkClass}>
          <span className="text-[13px] font-bold">Colleges</span>
        </NavLink>

        <NavLink to="/admin/companies" className={linkClass}>
          <span className="text-[13px] font-bold">Companies</span>
        </NavLink>
      </nav>

      {/* Change this section at the bottom of your file */}
      <div className="p-3 pb-25 border-t border-[#e5e5e5] shrink-0 bg-[#fff]">
        <button className="w-full py-2.5 rounded-[14px] bg-[#f9f9f9] border border-[#e5e5e5] text-[12px] font-bold text-[#cc0000] cursor-pointer hover:bg-[#e5e5e5] transition-colors">
          System Logout
        </button>
      </div>
    </aside>
  );
}
