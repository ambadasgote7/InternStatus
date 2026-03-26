import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const ProtectedRoute = ({ role }) => {
  const { user, loading } = useSelector((state) => state.user);
  const location = useLocation();

  // ⏳ Wait until auth check completes
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  // 🔒 Not logged in
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRole = user.role;

  // 🔒 Role check
  if (role) {
    const allowedRoles = Array.isArray(role) ? role : [role];

    if (!allowedRoles.includes(userRole)) {
      // ✅ smarter redirect based on role
      const roleRedirectMap = {
        student: "/student/dashboard",
        faculty: "/faculty/dashboard",
        mentor: "/mentor/dashboard",
        company: "/company/dashboard",
        college: "/college/dashboard",
        admin: "/admin/dashboard",
      };

      return <Navigate to={roleRedirectMap[userRole] || "/"} replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;