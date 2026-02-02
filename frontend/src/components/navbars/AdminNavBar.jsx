import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { removeUser } from "../../store/userSlice";
import axios from "axios";
import { BASE_URL } from "../../utils/constants";

const AdminNavBar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post(BASE_URL + "/api/admin/logout", {}, { withCredentials: true });
      dispatch(removeUser());
      navigate("/admin/login");
    } catch (err) {
      console.error(err);
    }
  };


  // Admins are typically auto-verified; show full links
  const showCore = true;

  return (
    <nav className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">InternStatus • Admin</h1>

      {showCore && <div className="space-x-4 text-sm">
        <Link to="/admin/dashboard" className="hover:text-gray-300">
          Dashboard
        </Link>

        <Link to="/admin/users" className="hover:text-gray-300">
          Users
        </Link>

        <Link to="/admin/faculty-requests" className="hover:text-gray-300">
          Faculty Requests
        </Link>

        <Link to="/admin/verified-faculty-requests" className="hover:text-gray-300">
          Verified Faculty
        </Link>

        <Link to="/admin/company-requests" className="hover:text-gray-300">
          Company Requests
        </Link>

        <Link to="/admin/verified-company-requests" className="hover:text-gray-300">
          Verified Companies
        </Link>

        <Link to="/admin/add-college" className="hover:text-gray-300">
        Add College
        </Link>

        <Link to="/admin/colleges-list" className="hover:text-gray-300">
        Colleges List
        </Link>

       <button
              onClick={handleLogout}
              className="px-3 py-1 border rounded-md text-sm cursor-pointer"
            >
              Logout
            </button>
      </div>}
    </nav>
  );
};

export default AdminNavBar;
