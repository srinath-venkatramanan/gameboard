import { NavLink } from "react-router-dom";

function Navbar() {
  const linkClass =
    "px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-200";
  const activeClass = "bg-gray-300 font-bold";

  return (
    <nav className="bg-gray-100 shadow-md px-4 py-3 flex space-x-4">
      <NavLink
        to="/home"
        className={({ isActive }) => (isActive ? `${linkClass} ${activeClass}` : linkClass)}
      >
        Home
      </NavLink>
      <NavLink
        to="/dashboard"
        className={({ isActive }) => (isActive ? `${linkClass} ${activeClass}` : linkClass)}
      >
        Dashboard
      </NavLink>
      <NavLink
        to="/seven-cards"
        className={({ isActive }) => (isActive ? `${linkClass} ${activeClass}` : linkClass)}
      >
        Seven Cards
      </NavLink>
      <NavLink
        to="/judgement"
        className={({ isActive }) => (isActive ? `${linkClass} ${activeClass}` : linkClass)}
      >
        Judgement
      </NavLink>
    </nav>
  );
}

export default Navbar;
