import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { removeUser } from "../../store/userSlice";
import axios from "axios";
import { BASE_URL } from "../../utils/constants";

const CompanyNavBar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.user) || {};

  const handleLogout = async () => {
    try {
      await axios.post(BASE_URL + "/api/auth/logout", {}, { withCredentials: true });
      dispatch(removeUser());
      navigate("/login");
    } catch (err) {
      console.error(err);
    }
  };

  const showRegister = !user.isRegistered;
  const showPending = user.isRegistered && !user.isVerified;
  const showCore = user.isRegistered && user.isVerified;

  return (
    <nav className="shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-6">
            <Link to="/company/dashboard" className="font-semibold text-lg">
              InternStatus (Company)
            </Link>

            {showCore && (
              <>
                <Link to="/company/dashboard" className="text-sm hover:underline">
                  Dashboard
                </Link>
                <Link to="/company/postings" className="text-sm hover:underline">
                  Postings
                </Link>
                <Link to="/company/interns" className="text-sm hover:underline">
                  Interns
                </Link>
              </>
            )}

            {showPending && (
              <Link to="/pending-verification" className="text-sm hover:underline">
                Verification Pending
              </Link>
            )}

            {showRegister && (
              <Link
                to="/company/register"
                className="text-sm font-medium text-yellow-600 hover:underline"
              >
                Complete Registration
              </Link>
            )}
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

export default CompanyNavBar;
