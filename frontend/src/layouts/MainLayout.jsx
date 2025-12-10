// src/layouts/MainLayout.jsx
import { Outlet } from "react-router-dom";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />

      <main className="flex-1 p-4">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default MainLayout;
