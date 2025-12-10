// src/routes/RoleRoute.jsx
import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import roleConfig from "../config/roleConfig";

/**
 * Props:
 * - allowed: string or array of strings (role names, e.g. "Student" or ["Faculty","Admin"])
 *
 * Usage examples:
 * <Route path="/student" element={<RoleRoute allowed="Student"><StudentDashboard/></RoleRoute>} />
 * or for nested: <Route element={<RoleRoute allowed={["Faculty","Admin"]} />}><Route ... /></Route>
 */
const RoleRoute = ({ allowed, children }) => {
  const user = useSelector((state) => state.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const allowedRoles = Array.isArray(allowed) ? allowed : [allowed];
  const userRole = user.role;

  if (!allowedRoles.includes(userRole)) {
    // send them to their own dashboard if known, otherwise home
    const redirectTo = roleConfig[userRole] || "/";
    return <Navigate to={redirectTo} replace />;
  }

  return children ? children : null;
};

export default RoleRoute;
