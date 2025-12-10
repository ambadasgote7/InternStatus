// src/components/NavBar.jsx
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

const NavBar = () => {
  const user = useSelector((state) => state.user);

  return (
    <nav className="w-full p-4 bg-base-300 flex justify-between items-center">
      <Link to="/" className="font-bold text-lg">InternStatus</Link>

      <div className="flex gap-4">
        {!user && (
          <>
            <Link to="/login" className="btn btn-sm">Login</Link>
            <Link to="/signup" className="btn btn-sm">Signup</Link>
          </>
        )}

        {user && <span className="opacity-60">Role: {user.role}</span>}
      </div>
    </nav>
  );
};

export default NavBar;
