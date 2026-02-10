// src/App.jsx
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import StudentLayout from "./layouts/StudentLayout";
import FacultyLayout from "./layouts/FacultyLayout";
import CompanyLayout from "./layouts/CompanyLayout";

import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import PendingVerification from "./pages/PendingVerification";

import StudentDashboard from "./pages/students/StudentDashboard";
import StudentProfile from "./pages/students/StudentProfile";

import FacultyDashboard from "./pages/faculty/FacultyDashboard";
import FacultyRegister from "./pages/faculty/FacultyRegister";

import CompanyDashboard from "./pages/company/CompanyDashboard";
import CompanyRegister from "./pages/company/CompanyRegister";

import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRoute from "./routes/RoleRoute";

import { Provider } from "react-redux";
import appStore from "./store/appStore";
import AccessRevoke from "./pages/AccessRevoked";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminRoute from "./routes/AdminRoute";
import FacultyRequests from "./pages/admin/FacultyRequests";
import VerifiedFacultyRequests from "./pages/admin/VerifiedFacultyRequests";
import CompanyRequests from "./pages/admin/CompanyRequests";
import VerifiedCompanyRequests from "./pages/admin/VerifiedCompanyRequests";
import SetPassword from "./pages/SetPassword";
import Users from "./pages/admin/Users";
import StudentNavBar from "./components/navbars/StudentNavBar";
import StudentRequests from "./pages/faculty/StudentRequests";
import VerifiedStudentRequests from "./pages/faculty/VerifiedStudentRequests";
import AddCollege from "./pages/admin/AddCollege";
import Colleges from "./pages/admin/Colleges";
import PostInternships from "./pages/company/PostInternships";

function App() {
  return (
    <Provider store={appStore}>
      <BrowserRouter>
        <Routes>

          {/* -------------------- PUBLIC ROUTES (no auth required) -------------------- */}
          <Route element={<MainLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Add more public pages here (accessible without login) */}
            {/* <Route path="/about" element={<About />} /> */}
            {/* <Route path="/contact" element={<Contact />} /> */}
          </Route>

          {/* -------------------- STUDENT ROUTES (protected + role-guarded) -------------------- */}
          <Route
            path="/student"
            element={
              <ProtectedRoute>
                <RoleRoute allowed="Student">
                  <StudentLayout />
                </RoleRoute>
              </ProtectedRoute>
            }
          >
            {/* index -> /student */}
            <Route index element={<StudentDashboard />} />
            <Route path="dashboard" element={<StudentDashboard />} />

            {/* student profile -> /student/profile */}
            <Route path="profile" element={<StudentProfile />} />

            {/* -------------------- FUTURE STUDENT ROUTES --------------------
               Add new student pages as nested routes here so they inherit:
                 - /student base path
                 - ProtectedRoute + RoleRoute guard
                 - StudentLayout (student navbar/footer)
               Examples:
                 <Route path="internships" element={<StudentInternships />} />
                 <Route path="internships/:id" element={<StudentInternshipDetails />} />
                 <Route path="applications" element={<StudentApplications />} />
            ------------------------------------------------------------------ */}
          </Route>

          {/* -------------------- FACULTY ROUTES (protected + role-guarded) -------------------- */}
          <Route
            path="/faculty"
            element={
              <ProtectedRoute>
                <RoleRoute allowed="Faculty">
                  <FacultyLayout />
                </RoleRoute>
              </ProtectedRoute>
            }
          >
            <Route index element={<FacultyDashboard />} />
            <Route path="dashboard" element={<FacultyDashboard />} />

            {/* faculty register -> /faculty/register (nested like student profile) */}
            <Route path="register" element={<FacultyRegister />} />
            <Route path="student-requests" element={<StudentRequests />} />
            <Route path="verified-student-requests" element={<VerifiedStudentRequests />} />

            {/* -------------------- FUTURE FACULTY ROUTES --------------------
               Add faculty-specific pages here:
                 <Route path="students" element={<FacultyStudents />} />
                 <Route path="approvals" element={<FacultyApprovals />} />
                 <Route path="reports" element={<FacultyReports />} />
            ------------------------------------------------------------------ */}
          </Route>

          {/* -------------------- COMPANY ROUTES (protected + role-guarded) -------------------- */}
          <Route
            path="/company"
            element={
              <ProtectedRoute>
                <RoleRoute allowed="Company">
                  <CompanyLayout />
                </RoleRoute>
              </ProtectedRoute>
            }
          >
            <Route index element={<CompanyDashboard />} />
            <Route path="dashboard" element={<CompanyDashboard />} />

            {/* company register -> /company/register (nested like student profile) */}
            <Route path="register" element={<CompanyRegister />} />
            <Route path="internships" element={<PostInternships />} />

            {/* -------------------- FUTURE COMPANY ROUTES --------------------
               Add company-specific pages here:
                 <Route path="postings" element={<CompanyPostings />} />
                 <Route path="postings/new" element={<CreatePosting />} />
                 <Route path="interns" element={<CompanyInterns />} />
            ------------------------------------------------------------------ */}
          </Route>

          {/* -------------------- ADMIN ROUTES (isolated) -------------------- */}
          <Route path="/admin/login" element={<AdminLogin />} />

          <Route
            path="/admin"
            element={<AdminRoute />}
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="faculty-requests" element={<FacultyRequests />} />
            <Route path="verified-faculty-requests" element={<VerifiedFacultyRequests />} />
            <Route path="company-requests" element={<CompanyRequests />} />
            <Route path="verified-company-requests" element={<VerifiedCompanyRequests />} />
            <Route path="add-college" element={<AddCollege />} />
            <Route path="colleges-list" element={<Colleges />} />
          </Route>


          


          {/* -------------------- FALLBACK / 404 -------------------- */}
          {/* If you want a dedicated 404 page, create one and replace the Navigate below */}
          <Route path="*" element={<Navigate to="/login" replace />} />
          <Route
            path="/pending-verification"
            element={<PendingVerification />}
          />
          <Route
            path="/access-revoked"
            element={<AccessRevoke />}
          />
          <Route 
            path="/set-password" 
            element={<SetPassword />} 
          />

        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
