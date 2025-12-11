// src/routes/RoleRoute.jsx
import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import roleConfig from "../config/roleConfig";

/**
 * Props:
 * - allowed: string or array of strings (role names)
 *
 * Usage:
 * - for single-route wrapper: <RoleRoute allowed="Student"><StudentPage/></RoleRoute>
 * - for nested usage: <Route element={<RoleRoute allowed="Student" />}><Route ... /></Route>
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

  // support both direct children and nested <Outlet/>
  return children ? children : <Outlet />;
};

export default RoleRoute;
