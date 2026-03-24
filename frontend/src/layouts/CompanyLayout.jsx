// Fixed for both Company and Faculty
import { Outlet } from "react-router-dom";
import CompanyNavBar from "../components/navbars/CompanyNavBar";

const CompanyLayout = () => (
  <div className="min-h-screen flex flex-col bg-[#0B0F19] text-white">
    <CompanyNavBar />
    <main className="flex-1 bg-[#0B0F19]">
      <Outlet />
    </main>
  </div>
);

export default CompanyLayout;
