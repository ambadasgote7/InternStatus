// File: src/components/NavBar.jsx
import { Link } from "react-router-dom";


const NavBar = () => {
return (
<nav className="shadow">
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div className="flex justify-between h-16 items-center">
<Link to="/" className="font-bold text-xl">
InternStatus
</Link>
<div className="flex items-center gap-4">
<Link to="/login" className="text-sm hover:underline">
Login
</Link>
<Link to="/signup" className="text-sm hover:underline">
Signup
</Link>
</div>
</div>
</div>
</nav>
);
};


export default NavBar;