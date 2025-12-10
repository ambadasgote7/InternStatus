// src/routes/ProtectedRoute.jsx
import { useSelector, useDispatch } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

import { addUser } from "../store/userSlice";
import { BASE_URL } from "../utils/constants";

const ProtectedRoute = ({ children }) => {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const [checking, setChecking] = useState(true); // are we restoring user on refresh?

  useEffect(() => {
    const restoreUser = async () => {
      // if Redux already has user (normal navigation, not refresh) → skip API
      if (user) {
        setChecking(false);
        return;
      }

      try {
        const res = await axios.get(BASE_URL + "/api/auth/me", {
          withCredentials: true, // send cookie
        });

        const userData = res.data?.data;
        if (userData) {
          dispatch(addUser(userData)); // repopulate Redux from backend
        }
      } catch (err) {
       console.error("Error restoring user:", err?.response?.data || err.message);
      } finally {
        setChecking(false);
      }
    };

    restoreUser();
  }, [user, dispatch]);

  // While we're checking /api/auth/me, don't redirect yet
  if (checking) {
    return (
      <div className="flex justify-center items-center p-8">
        <span>Loading...</span>
      </div>
    );
  }

  // After check: if still no user → real unauthenticated user
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated → render children or nested routes
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
