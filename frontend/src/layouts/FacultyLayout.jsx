// File: src/layouts/FacultyLayout.jsx
import { Outlet } from "react-router-dom";
import FacultyNavBar from "../components/navbars/FacultyNavBar";


const FacultyLayout = () => (
<div className="min-h-screen flex flex-col">
<FacultyNavBar />
<main className="flex-1 p-4">
<Outlet />
</main>
</div>
);


export default FacultyLayout;