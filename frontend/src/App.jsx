// src/App.jsx
import { BrowserRouter, Route, Routes } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";

import StudentDashboard from "./pages/students/StudentDashboard";
import FacultyDashboard from "./pages/faculty/FacultyDashboard";
import CompanyDashboard from "./pages/company/CompanyDashboard";

import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRoute from "./routes/RoleRoute";

import { Provider } from "react-redux";
import appStore from "./store/appStore";

function App() {
  return (
    <Provider store={appStore}>
      <BrowserRouter>
        <Routes>

          {/* PUBLIC ROUTES */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* AUTHENTICATED + ROLE-BASED ROUTES */}
          <Route element={<MainLayout />}>

            {/* Student */}
            <Route
              path="/student"
              element={
                <ProtectedRoute>
                  <RoleRoute allowed="Student">
                    <StudentDashboard />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />

            {/* Faculty */}
            <Route
              path="/faculty"
              element={
                <ProtectedRoute>
                  <RoleRoute allowed="Faculty">
                    <FacultyDashboard />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />

            {/* Company */}
            <Route
              path="/company"
              element={
                <ProtectedRoute>
                  <RoleRoute allowed="Company">
                    <CompanyDashboard />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />

          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
