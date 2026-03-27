import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import Logo from "../assets/OG_LOGO.png";

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
    <nav className="fixed top-0 z-50 w-full bg-[#FFFFFF] border-b border-[#F5F6FA] shrink-0 shadow-sm font-['Nunito'] transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link
          to="/"
          className="ml-4 text-[24px] font-black tracking-tighter text-[#6C5CE7] no-underline flex items-center gap-2 uppercase transition-opacity duration-300 hover:opacity-80"
        >
          <img src={Logo} alt="InternStatus" className="h-10" />
        </Link>

        {/* Navigation Actions */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Register Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="bg-[#F5F6FA] text-[#2D3436] border border-transparent font-black py-2.5 px-5 rounded-[14px] hover:bg-[#FFFFFF] hover:border-[#6C5CE7] hover:text-[#6C5CE7] transition-all duration-300 no-underline text-[12px] uppercase tracking-[0.1em] cursor-pointer outline-none flex items-center gap-2 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
            >
              Register
              <svg
                className={`w-3.5 h-3.5 transition-transform duration-300 ${isDropdownOpen ? "rotate-180 text-[#6C5CE7]" : ""}`}
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
            <div
              className={`absolute right-0 mt-3 w-56 bg-[#FFFFFF] border border-[#F5F6FA] rounded-[16px] shadow-lg flex flex-col z-50 overflow-hidden transform origin-top-right transition-all duration-300 ease-out ${
                isDropdownOpen
                  ? "opacity-100 scale-100 visible"
                  : "opacity-0 scale-95 invisible"
              }`}
            >
              {/* Links to your Register Routes */}
              <Link
                to="/college/register"
                onClick={() => setIsDropdownOpen(false)}
                className="px-5 py-4 text-[11px] font-black text-[#2D3436] hover:bg-[#F5F6FA] hover:text-[#6C5CE7] transition-colors duration-200 no-underline border-b border-[#F5F6FA] uppercase tracking-widest block"
              >
                Register College
              </Link>

              <Link
                to="/company/register"
                onClick={() => setIsDropdownOpen(false)}
                className="px-5 py-4 text-[11px] font-black text-[#2D3436] hover:bg-[#F5F6FA] hover:text-[#6C5CE7] transition-colors duration-200 no-underline uppercase tracking-widest block"
              >
                Register Company
              </Link>
            </div>
          </div>

          {/* Login Button */}
          <Link
            to="/login"
            className="bg-[#6C5CE7] text-[#FFFFFF] border border-[#6C5CE7] font-black py-2.5 px-8 rounded-[14px] hover:bg-[#FFFFFF] hover:text-[#6C5CE7] hover:border-[#6C5CE7] transition-all duration-300 no-underline text-[12px] uppercase tracking-[0.1em] shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
