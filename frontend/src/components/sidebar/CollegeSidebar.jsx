import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import API from "../../api/api";

export default function CollegeSidebar() {
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
            College
          </h2>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto no-scrollbar p-3 flex flex-col gap-1">
        <NavLink to="/college/dashboard" className={linkClass} end>
          <span className="text-[13px] font-bold">Dashboard</span>
        </NavLink>

         <NavLink to="/college/profile" className={linkClass} end>
          <span className="text-[13px] font-bold">Profile</span>
        </NavLink>

        <NavLink to="/college/faculty" className={linkClass}>
          <span className="text-[13px] font-bold">Faculty</span>
        </NavLink>

        <NavLink to="/college/students" className={linkClass}>
          <span className="text-[13px] font-bold">Student</span>
        </NavLink>

        <NavLink to="/college/courses" className={linkClass}>
          <span className="text-[13px] font-bold">Courses</span>
        </NavLink>

        <NavLink to="/credits" className={linkClass}>
          <span className="text-[13px] font-bold">Assign Credits</span>
        </NavLink>        
      </nav>

    </aside>
  );
}
