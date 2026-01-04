import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { removeUser } from "../../store/userSlice";
import axios from "axios";
import { BASE_URL } from "../../utils/constants";
import { clearStudentProfile } from "../../store/studentProfileSlice";

const AdminNavBar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post(BASE_URL + "/api/auth/logout", {}, { withCredentials: true });
      dispatch(removeUser());
      dispatch(clearStudentProfile());
      navigate("/login");
    } catch (err) {
      console.error(err);
    }
  };


  // Admins are typically auto-verified; show full links
  const showCore = true;

  return (
    <nav className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-6">
            <Link to="/admin/dashboard" className="font-semibold text-lg">
              InternStatus (Admin)
            </Link>

            {showCore && (
              <>
                <Link to="/admin/dashboard" className="text-sm hover:underline">
                  Dashboard
                </Link>
                <Link to="/admin/users" className="text-sm hover:underline">
                  Users
                </Link>
                <Link to="/admin/audit" className="text-sm hover:underline">
                  Audit
                </Link>
              </>
            )}

            <Link to="/admin/profile" className="text-sm hover:underline">
              Profile
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="px-3 py-1 rounded-md text-sm bg-white text-black"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavBar;
