import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const ProtectedRoute = ({ role, children }) => {

  const auth = useSelector((state) => state.user);
  const location = useLocation();

  // 🔒 Not logged in
  if (!auth?.user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRole = auth.user.role;

  // 🔒 Role check
  if (role) {

    if (Array.isArray(role)) {
      if (!role.includes(userRole)) {
        return <Navigate to="/" replace />;
      }
    } else {
      if (userRole !== role) {
        return <Navigate to="/" replace />;
      }
    }
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;