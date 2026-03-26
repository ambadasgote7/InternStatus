import { Outlet } from "react-router-dom";
import StudentNavBar from "../components/navbars/StudentNavBar";
import StudentSidebar from "../components/sidebar/StudentSidebar";

const StudentLayout = () => {
  return (
    <div className="h-screen flex flex-col bg-black text-white overflow-hidden">
      <div className="flex-none">
        <StudentNavBar />
      </div>
      <div className="flex flex-1 overflow-hidden">
        <StudentSidebar />
        <main className="flex-1 bg-black overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
