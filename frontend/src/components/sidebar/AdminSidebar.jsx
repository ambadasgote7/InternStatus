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
    `group flex flex-col items-stretch px-4 py-3 rounded-[14px] transition-all duration-300 border mb-1.5 no-underline transform ${
      isActive
        ? "bg-[#6C5CE7] border-[#6C5CE7] text-[#FFFFFF] shadow-md shadow-[#6C5CE7]/20"
        : "bg-transparent border-transparent text-[#2D3436] hover:bg-[#F5F6FA] hover:text-[#6C5CE7] hover:translate-x-1"
    }`;

  return (
    <aside className="w-60 h-screen top-0 bg-[#FFFFFF] border-r border-[#F5F6FA] flex flex-col flex-none z-50 overflow-hidden font-['Nunito'] shadow-sm transition-all duration-300">
      <nav className="flex-1 overflow-y-auto no-scrollbar p-4 flex flex-col gap-1.5">
        <NavLink to="/admin/dashboard" className={linkClass}>
          <span className="text-[13px] font-bold">Dashboard</span>
        </NavLink>

        <NavLink to="/admin/users" className={linkClass}>
          <span className="text-[13px] font-bold">User Matrix</span>
        </NavLink>

        <NavLink to="/admin/onboarding/pending" className={linkClass}>
          <div className="flex justify-between items-center">
            <span className="text-[13px] font-bold">Pending Requests</span>
            {counts.all > 0 && (
              <span className="bg-[#FFFFFF] text-[#6C5CE7] text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
                {counts.all}
              </span>
            )}
          </div>

          <div
            className={`overflow-hidden transition-all duration-500 ease-in-out ${counts.all > 0 ? "max-h-20 mt-3 opacity-100" : "max-h-0 opacity-0"}`}
          >
            <div className="flex flex-col gap-2 pl-3 border-l-2 border-[#FFFFFF] ml-1 opacity-90">
              <div className="flex justify-between items-center text-[11px] font-bold">
                Colleges
                <span className="font-black">{counts.college}</span>
              </div>
              <div className="flex justify-between items-center text-[11px] font-bold">
                Companies
                <span className="font-black">{counts.company}</span>
              </div>
            </div>
          </div>
        </NavLink>

        <NavLink to="/admin/onboarding/verified" className={linkClass}>
          <span className="text-[13px] font-bold">Verified Onboarding</span>
        </NavLink>

        <div className="h-px bg-[#F5F6FA] my-3 mx-2 transition-all duration-300" />

        <NavLink to="/admin/colleges" className={linkClass}>
          <span className="text-[13px] font-bold">Colleges</span>
        </NavLink>

        <NavLink to="/admin/companies" className={linkClass}>
          <span className="text-[13px] font-bold">Companies</span>
        </NavLink>
      </nav>

      <div className="p-4 pb-8 border-t border-[#F5F6FA] shrink-0 bg-[#FFFFFF]">
        <button className="w-full py-3 rounded-[14px] bg-[#F5F6FA] border border-transparent text-[12px] font-bold text-[#cc0000] cursor-pointer hover:bg-[#cc0000] hover:text-[#FFFFFF] transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5">
          System Logout
        </button>
      </div>
    </aside>
  );
}
