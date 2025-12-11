// File: src/layouts/StudentLayout.jsx
import { Outlet } from "react-router-dom";
import StudentNavBar from "../components/navbars/StudentNavBar";


const StudentLayout = () => {
return (
<div className="min-h-screen flex flex-col">
<StudentNavBar />
<main className="flex-1 p-4">
<Outlet />
</main>
</div>
);
};


export default StudentLayout;