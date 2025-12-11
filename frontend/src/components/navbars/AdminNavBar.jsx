// File: src/components/navbars/AdminNavBar.jsx
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
      await axios.post(BASE_URL + "/api/auth/logout", {}, { withCredentials: true });
      dispatch(removeUser());
      navigate("/login");
    } catch (err) {
      console.error(err);
    }
  };


return (
<nav className="bg-gray-800 text-white">
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div className="flex justify-between h-16 items-center">
<div className="flex items-center gap-6">
<Link to="/admin/dashboard" className="font-semibold text-lg">
InternStatus (Admin)
</Link>
<Link to="/admin/dashboard" className="text-sm hover:underline">
Dashboard
</Link>
<Link to="/admin/users" className="text-sm hover:underline">
Users
</Link>
<Link to="/admin/audit" className="text-sm hover:underline">
Audit
</Link>
</div>


<div className="flex items-center gap-4">
<button
onClick={handleLogout}
className="px-3 py-1 border rounded-md text-sm bg-white text-black"
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