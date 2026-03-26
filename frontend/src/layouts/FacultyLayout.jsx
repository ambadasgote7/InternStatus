import { Outlet } from "react-router-dom";
import FacultyNavBar from "../components/navbars/FacultyNavBar";
import FacultySidebar from "../components/sidebar/FacultySidebar";

const FacultyLayout = () => {
  return (
    <div className="h-screen flex flex-col bg-black text-white overflow-hidden">
      <div className="flex-none">
        <FacultyNavBar />
      </div>
      <div className="flex flex-1 overflow-hidden">
        <FacultySidebar />
        <main className="flex-1 bg-black overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default FacultyLayout;
