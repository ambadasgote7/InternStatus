// File: src/layouts/CompanyLayout.jsx
import { Outlet } from "react-router-dom";
import CompanyNavBar from "../components/navbars/CompanyNavBar";


const CompanyLayout = () => (
<div className="min-h-screen flex flex-col">
<CompanyNavBar />
<main className="flex-1 p-4">
<Outlet />
</main>
</div>
);


export default CompanyLayout;