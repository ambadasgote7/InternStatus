import { Outlet } from "react-router-dom";
import AdminNavBar from "../components/navbars/AdminNavBar";


const AdminLayout = () => (
<div className="min-h-screen flex flex-col">
<AdminNavBar />
<main className="flex-1 p-4">
<Outlet />
</main>
</div>
);


export default AdminLayout;