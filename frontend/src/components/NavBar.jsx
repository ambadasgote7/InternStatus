import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

const NavBar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="fixed top-0 z-50 w-full bg-[#fff] border-b border-[#e5e5e5] shrink-0 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link
          to="/"
          className="text-[24px] font-black tracking-tighter text-[#111] no-underline flex items-center gap-2 uppercase"
        >
          InternStatus
        </Link>

        {/* Navigation Actions */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Register Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="bg-[#f9f9f9] text-[#111] border border-[#e5e5e5] font-black py-2.5 px-5 rounded-[14px] hover:bg-[#e5e5e5] hover:border-[#ccc] transition-all no-underline text-[12px] uppercase tracking-[0.1em] cursor-pointer outline-none flex items-center gap-2"
            >
              Register
              <svg
                className={`w-3.5 h-3.5 transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-[#fff] border border-[#e5e5e5] rounded-[16px] shadow-lg flex flex-col z-50 overflow-hidden transform origin-top-right transition-all">
                {/* Links to your Register Routes */}
                <Link
                  to="/college/register"
                  onClick={() => setIsDropdownOpen(false)}
                  className="px-5 py-4 text-[11px] font-black text-[#555] hover:bg-[#f9f9f9] hover:text-[#111] transition-colors no-underline border-b border-[#e5e5e5] uppercase tracking-widest block"
                >
                  Register College
                </Link>

                <Link
                  to="/company/register"
                  onClick={() => setIsDropdownOpen(false)}
                  className="px-5 py-4 text-[11px] font-black text-[#555] hover:bg-[#f9f9f9] hover:text-[#111] transition-colors no-underline uppercase tracking-widest block"
                >
                  Register Company
                </Link>
              </div>
            )}
          </div>

          {/* Login Button */}
          <Link
            to="/login"
            className="bg-[#111] text-[#fff] border border-[#111] font-black py-2.5 px-8 rounded-[14px] hover:bg-[#333] hover:border-[#333] transition-all no-underline text-[12px] uppercase tracking-[0.1em]"
          >
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
