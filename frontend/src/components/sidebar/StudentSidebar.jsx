import React, { useEffect, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import API from "../../api/api";

export default function StudentSidebar() {
  const user = useSelector((s) => s.user?.user) || {};

  const showRegister = !user.isRegistered;
  const showPending = user.isRegistered && !user.isVerified;
  const showCore = user.isRegistered && user.isVerified;

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
            Student Menu
          </h2>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto no-scrollbar p-3 flex flex-col gap-1">
        {showCore && (
          <>
            <NavLink to="/student/dashboard" className={linkClass} end>
              <span className="text-sm font-bold">Dashboard</span>
            </NavLink>
            <NavLink to="/student/profile" className={linkClass} end>
              <span className="text-sm font-bold">My Profile</span>
            </NavLink>
            <NavLink to="/student/browse-internships" className={linkClass} end>
              <span className="text-sm font-bold">Browse Internships</span>
            </NavLink>
            <NavLink to="/student/my-applications" className={linkClass} end>
              <span className="text-sm font-bold">My Applications</span>
            </NavLink>
          </>
        )}

        <NavLink to="/student/credits" className={linkClass} end>
          <span className="text-sm font-bold">Credits</span>
        </NavLink>

        {showPending && (
          <div className="mt-4">
            <Link
              to="/pending-verification"
              className="block text-center px-4 py-2.5 rounded-xl text-gray-300 font-bold bg-gray-800 border border-gray-700 transition-colors no-underline tracking-wide hover:bg-gray-700 text-sm"
            >
              Verification Pending
            </Link>
          </div>
        )}

        {showRegister && (
          <div className="mt-4">
            <Link
              to="/student/profile"
              className="block text-center px-5 py-2.5 rounded-xl text-white font-bold bg-blue-600 hover:bg-blue-700 transition-colors no-underline tracking-wide border-none text-sm"
            >
              Complete Registration
            </Link>
          </div>
        )}
      </nav>
    </aside>
  );
}
