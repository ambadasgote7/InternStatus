import { useSelector, useDispatch } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

import { addUser } from "../store/userSlice";
import { setStudentProfile } from "../store/studentProfileSlice";
import { BASE_URL } from "../utils/constants";

const ProtectedRoute = ({ children }) => {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const location = useLocation();

  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        /* ========== AUTH RESTORE (ALWAYS) ========== */
        const res = await axios.get(`${BASE_URL}/api/auth/me`, {
          withCredentials: true,
        });

        const userData = res.data?.data;
        if (!userData) {
          setChecking(false);
          return;
        }

        dispatch(addUser(userData));

        /* ========== STUDENT PROFILE PRELOAD ========== */
        if (String(userData.role).toLowerCase() === "student") {
          try {
            const profileRes = await axios.get(
              `${BASE_URL}/api/student/profile`,
              { withCredentials: true }
            );

            if (profileRes.data?.data) {
              dispatch(setStudentProfile(profileRes.data.data));
            }
          } catch (err) {
            // 404 = profile not created yet (valid state)
            if (err.response?.status !== 404) {
              console.error("Profile preload failed:", err);
            }
          }
        }
      } catch (err) {
        console.error(
          "Error restoring session:",
          err?.response?.data || err.message
        );
      } finally {
        setChecking(false);
      }
    };

    restoreSession();
  }, [dispatch]);

  /* ========== LOADING ========== */
  if (checking) {
    return (
      <div className="flex justify-center items-center p-8">
        <span>Loading...</span>
      </div>
    );
  }

  /* ========== NOT AUTHENTICATED ========== */
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const role = String(user.role || "").toLowerCase();
  const pathname = location.pathname;

  const studentRegisterPath = "/student/profile";
  const defaultRegisterPath = `/${role}/register`;
  const registerPath =
    role === "student" ? studentRegisterPath : defaultRegisterPath;

  /* ========== NOT REGISTERED ========== */
  if (!user.isRegistered) {
    if (pathname === registerPath) {
      return children ? children : <Outlet />;
    }
    return <Navigate to={registerPath} state={{ from: location }} replace />;
  }

  /* ========== REGISTERED BUT NOT VERIFIED ========== */
  const pendingPath = "/pending-verification";
  if (!user.isVerified) {
    if (pathname === pendingPath) {
      return children ? children : <Outlet />;
    }
    return <Navigate to={pendingPath} state={{ from: location }} replace />;
  }

  /* ========== REGISTERED & VERIFIED ========== */
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
