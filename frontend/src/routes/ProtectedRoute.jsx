// src/routes/ProtectedRoute.jsx
import { useSelector, useDispatch } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

import { addUser } from "../store/userSlice";
import { BASE_URL } from "../utils/constants";

/**
 * Behavior:
 * - unauthenticated -> /login
 * - authenticated && !isRegistered -> forced to role-specific register page:
 *     - Student -> /student/profile
 *     - others  -> /<role>/register
 * - authenticated && isRegistered && !isVerified -> forced to /pending-verification (global)
 * - authenticated && isRegistered && isVerified -> allowed
 *
 * Keeps your /api/auth/me restore logic and the "checking" loading state.
 */
const ProtectedRoute = ({ children }) => {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const location = useLocation();

  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const restoreUser = async () => {
      if (user) {
        setChecking(false);
        return;
      }

      try {
        const res = await axios.get(BASE_URL + "/api/auth/me", {
          withCredentials: true,
        });
        const userData = res.data?.data;
        if (userData) {
          dispatch(addUser(userData));
        }
      } catch (err) {
        console.error("Error restoring user:", err?.response?.data || err.message);
      } finally {
        setChecking(false);
      }
    };

    restoreUser();
  }, [user, dispatch]);

  if (checking) {
    return (
      <div className="flex justify-center items-center p-8">
        <span>Loading...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const role = String(user.role || "").toLowerCase();
  const pathname = location.pathname;

  // STUDENT uses /student/profile as registration page
  const studentRegisterPath = "/student/profile";
  // default register path for other roles
  const defaultRegisterPath = `/${role}/register`;
  // choose register path based on role
  const registerPath = role === "student" ? studentRegisterPath : defaultRegisterPath;

  // 1) Not registered -> allow only registerPath
  if (!user.isRegistered) {
    if (pathname === registerPath) {
      return children ? children : <Outlet />;
    }
    return <Navigate to={registerPath} state={{ from: location }} replace />;
  }

  // 2) Registered but not verified -> allow only /pending-verification
  const pendingPath = "/pending-verification";
  if (user.isRegistered && !user.isVerified) {
    if (pathname === pendingPath) {
      return children ? children : <Outlet />;
    }
    return <Navigate to={pendingPath} state={{ from: location }} replace />;
  }

  // 3) Registered & verified => allow
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
