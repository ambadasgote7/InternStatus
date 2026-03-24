import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import appStore from "./store/appStore";

/* API */
import API from "./api/api";

/* Redux actions */
import { addUser, removeUser } from "./store/userSlice";

/* Layout */
import MainLayout from "./layouts/MainLayout";

/* Public Pages */
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import CompanyRegister from "./pages/company/CompanyRegister";
import CollegeRegister from "./pages/college/CollegeRegister";

/* Dashboards */
import StudentDashboard from "./pages/students/StudentDashboard";
import FacultyDashboard from "./pages/faculty/FacultyDashboard";
import MentorDashboard from "./pages/mentor/MentorDashboard";

/* Admin */
import AdminLogin from "./pages/admin/AdminLogin";
import AdminColleges from "./pages/admin/colleges/AdminColleges";
import AdminCollegeForm from "./pages/admin/colleges/AdminCollegeForm";
import AdminCollegeDetails from "./pages/admin/colleges/AdminCollegeDetails";

import SetPassword from "./pages/SetPassword";

import ProtectedRoute from "./routes/ProtectedRoute";

import CollegeDashboard from "./pages/college/CollegeDashboard";
import CompanyDashboard from "./pages/company/CompanyDashboard";

import InviteStudent from "./pages/faculty/InviteStudent";
import InviteFaculty from "./pages/college/InviteFaculty";
import Courses from "./pages/college/Courses";
import InviteMentor from "./pages/company/InviteMentor";
import StudentProfile from "./pages/students/StudentProfile";
import CollegeProfile from "./pages/college/CollegeProfile";
import FacultyProfile from "./pages/faculty/FacultyProfile";
import MentorProfile from "./pages/mentor/MentorProfile";
import CompanyProfile from "./pages/company/CompanyProfile";
import CollegeFacultyList from "./pages/college/CollegeFacultyList";
import CompanyMentorList from "./pages/company/CompanyMentorList";
import CollegeStudents from "./pages/college/CollegeStudents";
import FacultyStudents from "./pages/faculty/FacultyStudents";
import PostInternship from "./pages/company/PostInternship";
import BrowseInternships from "./pages/students/BrowseInternships";
import InternshipDetails from "./pages/students/InternshipDetails";
import MyApplications from "./pages/students/MyApplications";
import InternshipApplicants from "./pages/company/InternshipApplicants";
import CompanyInternships from "./pages/company/CompanyInternships";
import EditInternship from "./pages/company/EditInternship";
import CompanyInterns from "./pages/company/CompanyInterns";
import InternDetails from "./pages/company/InternDetails";
import AdminLayout from "./layouts/AdminLayout";
import PendingRequests from "./pages/admin/onboarding/PendingRequests";
import VerifiedOnboardings from "./pages/admin/onboarding/VerifiedOnboardings";
import OnboardingDetails from "./pages/admin/onboarding/OnboardingDetails";
import AdminCompanies from "./pages/admin/companies/AdminCompanies";
import AdminCompanyForm from "./pages/admin/companies/AdminCompanyForm";
import AdminCompanyDetails from "./pages/admin/companies/AdminCompanyDetails";
import AdminUsers from "./pages/admin/users/AdminUsers";
import AdminUserDetails from "./pages/admin/users/AdminUserDetails";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import MentorInterns from "./pages/mentor/MentorInterns";
import TrackInternship from "./pages/students/TrackInternship";
import MentorInternTrack from "./pages/mentor/MentorInternTrack";
import CreateTask from "./pages/mentor/CreateTask";
import StudentTasks from "./pages/students/StudentTaskDetails";
import TaskDetails from "./pages/mentor/TaskDetails";
import StudentDetails from "./pages/college/StudentDetails";
import InternProgress from "./pages/company/InternProgress";
import AcademicInternshipTrack from "./pages/college/AcademicInternshipTrack";
import StudentInternships from "./pages/college/StudentInternship";
import StudentCredits from "./pages/students/StudentCredits";
import CreditManagement from "./pages/college/CreditManagement";

function AppContent() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const path = window.location.pathname;

        // 🔥 SKIP AUTH CHECK FOR PUBLIC TOKEN PAGES
        const isPublic =
          path.startsWith("/setup-account") ||
          path.startsWith("/reset-password");

        if (isPublic) {
          setLoading(false);
          return;
        }

        const res = await API.get("/users/profile");

        dispatch(
          addUser({
            user: res.data.user,
            profile: res.data.profile,
            token: null,
          }),
        );
      } catch (err) {
        dispatch(removeUser());
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [dispatch]);

  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem("token");

      if (!token) {
        dispatch(removeUser());
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [dispatch]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="font-nunito">
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            
            <Route path="/login" element={<Login />} />
            <Route path="/college/register" element={<CollegeRegister />} />
            <Route path="/company/register" element={<CompanyRegister />} />
            <Route path="/setup-account" element={<SetPassword />} />
          </Route>

          <Route element={<ProtectedRoute role="college" />}>
            <Route path="/college/dashboard" element={<CollegeDashboard />} />
            <Route path="/college/invite-student" element={<InviteStudent />} />
            <Route path="/college/invite-faculty" element={<InviteFaculty />} />
            <Route path="/college/courses" element={<Courses />} />
            <Route path="/college/profile" element={<CollegeProfile />} />
            <Route path="/college/faculty" element={<CollegeFacultyList />} />
            <Route path="/college/students" element={<CollegeStudents />} />
            <Route
              path="/college/students/:studentId"
              element={<StudentDetails />}
            />
          </Route>

          <Route element={<ProtectedRoute role="faculty" />}>
            <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
            <Route path="/faculty/profile" element={<FacultyProfile />} />
            <Route path="/faculty/invite-student" element={<InviteStudent />} />
            <Route path="/faculty/students" element={<FacultyStudents />} />
            <Route
              path="/faculty/students/:studentId"
              element={<StudentDetails />}
            />
          </Route>

          <Route element={<ProtectedRoute role={["faculty", "college"]} />}>
            <Route
              path="/academic-internship-track/:applicationId"
              element={<AcademicInternshipTrack />}
            />
            <Route
              path="/student/internships"
              element={<StudentInternships />}
            />
            <Route path="/credits" element={<CreditManagement />} />
          </Route>

          <Route element={<ProtectedRoute role="mentor" />}>
            <Route path="/mentor/dashboard" element={<MentorDashboard />} />
            <Route path="/mentor/profile" element={<MentorProfile />} />
            <Route path="/mentor/interns" element={<MentorInterns />} />
            <Route
              path="/mentor/intern/:applicationId/track"
              element={<MentorInternTrack />}
            />
            <Route path="/mentor/tasks/:taskId" element={<TaskDetails />} />
            <Route
              path="/mentor/intern/:applicationId/create-task"
              element={<CreateTask />}
            />
          </Route>

          <Route element={<ProtectedRoute role="company" />}>
            <Route path="/company/dashboard" element={<CompanyDashboard />} />
            <Route path="/company/invite-mentor" element={<InviteMentor />} />
            <Route path="/company/profile" element={<CompanyProfile />} />
            <Route path="/company/mentors" element={<CompanyMentorList />} />
            <Route
              path="/company/post-internship"
              element={<PostInternship />}
            />
            <Route
              path="/company/company-internships"
              element={<CompanyInternships />}
            />
            <Route
              path="/company/internship/:id/applicants"
              element={<InternshipApplicants />}
            />
            <Route
              path="/company/internship/:id/edit"
              element={<EditInternship />}
            />
            <Route path="/company/interns" element={<CompanyInterns />} />
            <Route path="/company/intern/:id" element={<InternDetails />} />
            <Route
              path="/company/interns/:id/progress"
              element={<InternProgress />}
            />
          </Route>

          <Route element={<ProtectedRoute role="student" />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/profile" element={<StudentProfile />} />
            <Route
              path="/student/browse-internships"
              element={<BrowseInternships />}
            />
            <Route
              path="/student/internships/:id"
              element={<InternshipDetails />}
            />
            <Route
              path="/student/my-applications"
              element={<MyApplications />}
            />
            <Route path="/student/credits" element={<StudentCredits />} />

            <Route
              path="/student/intern/:applicationId/track"
              element={<TrackInternship />}
            />

            <Route path="/student/task/:taskId" element={<StudentTasks />} />
          </Route>

          <Route element={<ProtectedRoute role="admin" />}>
            <Route path="/admin" element={<AdminLayout />}>
              {/* Dashboard */}
              <Route index element={<div>ADMIN OK</div>} />

              {/* Onboarding */}
              <Route path="onboarding/pending" element={<PendingRequests />} />
              <Route
                path="onboarding/verified"
                element={<VerifiedOnboardings />}
              />
              <Route
                path="onboarding/:type/:id"
                element={<OnboardingDetails />}
              />
              <Route path="colleges" element={<AdminColleges />} />
              <Route path="colleges/new" element={<AdminCollegeForm />} />
              <Route path="colleges/edit/:id" element={<AdminCollegeForm />} />
              <Route path="colleges/:id" element={<AdminCollegeDetails />} />

              <Route path="companies" element={<AdminCompanies />} />
              <Route path="companies/new" element={<AdminCompanyForm />} />
              <Route path="companies/edit/:id" element={<AdminCompanyForm />} />
              <Route path="companies/:id" element={<AdminCompanyDetails />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="users/:id" element={<AdminUserDetails />} />
            </Route>
          </Route>

          <Route path="/admin/login" element={<AdminLogin />} />

          <Route path="/" element={<Home />} />

          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

function App() {
  return (
    <Provider store={appStore}>
      <AppContent />
    </Provider>
  );
}

export default App;
