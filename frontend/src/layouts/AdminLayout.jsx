import { Outlet } from "react-router-dom";
import AdminNavBar from "../components/navbars/AdminNavBar";
import AdminSidebar from "../components/sidebar/AdminSidebar";

const AdminLayout = () => (
  // Changed min-h-screen to h-screen and added overflow-hidden to lock the body
  <div className="h-screen flex flex-col bg-[#0B0F19] text-white overflow-hidden">
    <AdminNavBar />
    
    <div className="flex flex-1 overflow-hidden">
      <AdminSidebar />
      
      {/* Added custom-scrollbar for a cleaner look while it handles the internal scrolling */}
      <main className="flex-1 bg-[#0B0F19] overflow-y-auto custom-scrollbar">
        <Outlet />
      </main>
    </div>
  </div>
);

export default AdminLayout;