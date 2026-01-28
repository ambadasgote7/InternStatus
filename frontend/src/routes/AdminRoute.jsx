import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";

const AdminRoute = ({ children }) => {
  const [allowed, setAllowed] = useState(null);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/admin/check`, {
        withCredentials: true,
      })
      .then(() => setAllowed(true))
      .catch(() => setAllowed(false));
  }, []);

  if (allowed === null) {
    return <div className="p-6 text-center">Checking admin access...</div>;
  }

  if (!allowed) {
    return <Navigate to="/admin/login" replace />;
  }

  return children ? children : <Outlet />;
};

export default AdminRoute;
