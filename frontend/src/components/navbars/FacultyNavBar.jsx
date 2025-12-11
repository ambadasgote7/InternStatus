// File: src/components/navbars/FacultyNavBar.jsx
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { removeUser } from "../../store/userSlice";
import axios from "axios";
import { BASE_URL } from "../../utils/constants";


const FacultyNavBar = () => {
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
<nav className="shadow-sm">
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div className="flex justify-between h-16 items-center">
<div className="flex items-center gap-6">
<Link to="/faculty/dashboard" className="font-semibold text-lg">
InternStatus (Faculty)
</Link>
<Link to="/faculty/dashboard" className="text-sm hover:underline">
Dashboard
</Link>
<Link to="/faculty/students" className="text-sm hover:underline">
Students
</Link>
<Link to="/faculty/approvals" className="text-sm hover:underline">
Approvals
</Link>
</div>


<div className="flex items-center gap-4">
<button
onClick={handleLogout}
className="px-3 py-1 border rounded-md text-sm"
>
Logout
</button>
</div>
</div>
</div>
</nav>
);
};


export default FacultyNavBar;