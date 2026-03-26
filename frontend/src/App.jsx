import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import appStore from "./store/appStore";

/* API */
import API from "./api/api";

/* Redux */
import { addUser, removeUser } from "./store/userSlice";

/* Layouts */
import MainLayout from "./layouts/MainLayout";
import CollegeLayout from "./layouts/CollegeLayout";
import AdminLayout from "./layouts/AdminLayout";
import FacultyLayout from "./layouts/FacultyLayout";
import StudentLayout from "./layouts/StudentLayout";
import MentorLayout from "./layouts/MentorLayout";
import CompanyLayout from "./layouts/CompanyLayout";

/* Public */
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import AdminLogin from "./pages/admin/AdminLogin";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import SetPassword from "./pages/SetPassword";

/* Student */
import StudentDashboard from "./pages/students/StudentDashboard";
import StudentProfile from "./pages/students/StudentProfile";
import BrowseInternships from "./pages/students/BrowseInternships";
import InternshipDetails from "./pages/students/InternshipDetails";
import MyApplications from "./pages/students/MyApplications";
import TrackInternship from "./pages/students/TrackInternship";
import StudentTasks from "./pages/students/StudentTaskDetails";
import StudentCredits from "./pages/students/StudentCredits";

/* Faculty */
import FacultyDashboard from "./pages/faculty/FacultyDashboard";
import FacultyProfile from "./pages/faculty/FacultyProfile";
import FacultyStudents from "./pages/faculty/FacultyStudents";
import InviteStudent from "./pages/faculty/InviteStudent";

/* Mentor */
import MentorDashboard from "./pages/mentor/MentorDashboard";
import MentorProfile from "./pages/mentor/MentorProfile";
import MentorInterns from "./pages/mentor/MentorInterns";
import MentorInternTrack from "./pages/mentor/MentorInternTrack";
import TaskDetails from "./pages/mentor/TaskDetails";
import CreateTask from "./pages/mentor/CreateTask";

/* Company */
import CompanyDashboard from "./pages/company/CompanyDashboard";
import CompanyProfile from "./pages/company/CompanyProfile";
import CompanyMentorList from "./pages/company/CompanyMentorList";
import InviteMentor from "./pages/company/InviteMentor";
import PostInternship from "./pages/company/PostInternship";
import CompanyInternships from "./pages/company/CompanyInternships";
import InternshipApplicants from "./pages/company/InternshipApplicants";
import EditInternship from "./pages/company/EditInternship";
import CompanyInterns from "./pages/company/CompanyInterns";
import InternDetails from "./pages/company/InternDetails";
import InternProgress from "./pages/company/InternProgress";

/* College */
import CollegeDashboard from "./pages/college/CollegeDashboard";
import CollegeProfile from "./pages/college/CollegeProfile";
import CollegeFacultyList from "./pages/college/CollegeFacultyList";
import CollegeStudents from "./pages/college/CollegeStudents";
import StudentDetails from "./pages/college/StudentDetails";
import InviteFaculty from "./pages/college/InviteFaculty";
import Courses from "./pages/college/Courses";
import AcademicInternshipTrack from "./pages/college/AcademicInternshipTrack";
import StudentInternships from "./pages/college/StudentInternship";
import CreditManagement from "./pages/college/CreditManagement";

/* Admin */
import AdminDashboard from "./pages/admin/AdminDashboard";
import PendingRequests from "./pages/admin/onboarding/PendingRequests";
import VerifiedOnboardings from "./pages/admin/onboarding/VerifiedOnboardings";
import OnboardingDetails from "./pages/admin/onboarding/OnboardingDetails";
import AdminColleges from "./pages/admin/colleges/AdminColleges";
import AdminCollegeForm from "./pages/admin/colleges/AdminCollegeForm";
import AdminCollegeDetails from "./pages/admin/colleges/AdminCollegeDetails";
import AdminCompanies from "./pages/admin/companies/AdminCompanies";
import AdminCompanyForm from "./pages/admin/companies/AdminCompanyForm";
import AdminCompanyDetails from "./pages/admin/companies/AdminCompanyDetails";
import AdminUsers from "./pages/admin/users/AdminUsers";
import AdminUserDetails from "./pages/admin/users/AdminUserDetails";

/* Protected */
import ProtectedRoute from "./routes/ProtectedRoute";

function AppContent() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // ✅ COOKIE-BASED AUTH → always call
        const res = await API.get("/users/profile");

        dispatch(
          addUser({
            user: res.data.user,
            profile: res.data.profile,
          })
        );
      } catch (err) {
        if (err.response?.status === 401) {
          dispatch(removeUser());
        }
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [dispatch]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC */}
        <Route element={<MainLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/setup-account" element={<SetPassword />} />
        </Route>

        {/* STUDENT */}
        <Route element={<ProtectedRoute role="student" />}>
          <Route element={<StudentLayout />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/profile" element={<StudentProfile />} />
            <Route path="/student/browse-internships" element={<BrowseInternships />} />
            <Route path="/student/internships/:id" element={<InternshipDetails />} />
            <Route path="/student/my-applications" element={<MyApplications />} />
            <Route path="/student/intern/:applicationId/track" element={<TrackInternship />} />
            <Route path="/student/task/:taskId" element={<StudentTasks />} />
            <Route path="/student/credits" element={<StudentCredits />} />
          </Route>
        </Route>

        {/* FACULTY */}
        <Route element={<ProtectedRoute role="faculty" />}>
          <Route element={<FacultyLayout />}>
            <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
            <Route path="/faculty/profile" element={<FacultyProfile />} />
            <Route path="/faculty/students" element={<FacultyStudents />} />
            <Route path="/faculty/invite-student" element={<InviteStudent />} />
            <Route path="/credits" element={<CreditManagement />} />
          </Route>
        </Route>

        {/* MENTOR */}
        <Route element={<ProtectedRoute role="mentor" />}>
          <Route element={<MentorLayout />}>
            <Route path="/mentor/dashboard" element={<MentorDashboard />} />
            <Route path="/mentor/profile" element={<MentorProfile />} />
            <Route path="/mentor/interns" element={<MentorInterns />} />
            <Route path="/mentor/intern/:applicationId/track" element={<MentorInternTrack />} />
            <Route path="/mentor/tasks/:taskId" element={<TaskDetails />} />
            <Route path="/mentor/intern/:applicationId/create-task" element={<CreateTask />} />
          </Route>
        </Route>

        {/* COMPANY */}
        <Route element={<ProtectedRoute role="company" />}>
          <Route element={<CompanyLayout />}>
            <Route path="/company/dashboard" element={<CompanyDashboard />} />
            <Route path="/company/profile" element={<CompanyProfile />} />
            <Route path="/company/mentors" element={<CompanyMentorList />} />
            <Route path="/company/invite-mentor" element={<InviteMentor />} />
            <Route path="/company/post-internship" element={<PostInternship />} />
            <Route path="/company/company-internships" element={<CompanyInternships />} />
            <Route path="/company/internship/:id/applicants" element={<InternshipApplicants />} />
            <Route path="/company/internship/:id/edit" element={<EditInternship />} />
            <Route path="/company/interns" element={<CompanyInterns />} />
            <Route path="/company/intern/:id" element={<InternDetails />} />
            <Route path="/company/interns/:id/progress" element={<InternProgress />} />
          </Route>
        </Route>

        {/* COLLEGE */}
        <Route element={<ProtectedRoute role="college" />}>
          <Route element={<CollegeLayout />}>
            <Route path="/college/dashboard" element={<CollegeDashboard />} />
            <Route path="/college/profile" element={<CollegeProfile />} />
            <Route path="/college/faculty" element={<CollegeFacultyList />} />
            <Route path="/college/students" element={<CollegeStudents />} />
            <Route path="/college/students/:studentId" element={<StudentDetails />} />
            <Route path="/college/invite-faculty" element={<InviteFaculty />} />
            <Route path="/college/courses" element={<Courses />} />
            <Route path="/academic-internship-track/:applicationId" element={<AcademicInternshipTrack />} />
            <Route path="/student/internships" element={<StudentInternships />} />
            <Route path="/credits" element={<CreditManagement />} />
          </Route>
        </Route>

        {/* ADMIN */}
        <Route element={<ProtectedRoute role="admin" />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="onboarding/pending" element={<PendingRequests />} />
            <Route path="onboarding/verified" element={<VerifiedOnboardings />} />
            <Route path="onboarding/:type/:id" element={<OnboardingDetails />} />
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

        <Route path="/" element={<Home />} />

      </Routes>
    </BrowserRouter>
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