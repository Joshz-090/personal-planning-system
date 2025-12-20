import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  FiLogOut,
  FiSettings,
  FiHome,
  FiCalendar,
  FiTarget,
  FiBarChart2,
} from "react-icons/fi";

const NavBar = () => {
  const { currentUser, logout, userProfile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) navigate("/login");
  };

  return (
    <nav className="
      fixed top-0 left-0 right-0 z-[30]
      bg-white/70 dark:bg-gray-900/60
      backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/40
      shadow-lg
    ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* BRAND LOGO */}
          <div className="flex items-center space-x-3">
            <Link
              to="/"
              className="flex items-center space-x-2 group transition"
            >
              <FiCalendar className="w-7 h-7 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Shcadule
              </span>
            </Link>
          </div>

          {/* NAV LINKS (DESKTOP ONLY – sidebar handles mobile) */}
          {currentUser && (
            <div className="hidden md:flex items-center space-x-2">

              <NavLink to="/dashboard" icon={FiHome} label="Dashboard" />
              <NavLink to="/daily" icon={FiCalendar} label="Daily" />
              <NavLink to="/weekly" icon={FiBarChart2} label="Weekly" />
              <NavLink to="/goals" icon={FiTarget} label="Goals" />

            </div>
          )}

          {/* USER SECTION */}
          {currentUser ? (
            <div className="flex items-center space-x-4">

              {/* USER NAME */}
              <div className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                {userProfile?.name || currentUser.email}
              </div>

              {/* SETTINGS */}
              <Link
                to="/settings"
                className="
                  p-2 rounded-lg transition-all 
                  hover:bg-gray-200/60 dark:hover:bg-gray-700/60
                "
              >
                <FiSettings className="w-5 h-5 text-gray-700 dark:text-gray-300 hover:scale-110 transition-transform" />
              </Link>

              {/* LOGOUT */}
              <button
                onClick={handleLogout}
                className="
                  flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                  text-gray-700 dark:text-gray-300 
                  hover:bg-gray-200/60 dark:hover:bg-gray-700/60 
                  transition-all
                "
              >
                <FiLogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            /* IF NOT LOGGED IN */
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="
                  px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 
                  hover:text-gray-900 dark:hover:text-white
                  transition
                "
              >
                Login
              </Link>

              <Link
                to="/register"
                className="
                  px-4 py-2 text-sm font-medium text-white 
                  bg-blue-600 rounded-lg hover:bg-blue-700
                  transition shadow-md
                "
              >
                Register
              </Link>
            </div>
          )}

        </div>
      </div>
    </nav>
  );
};

export default NavBar;



/* Component for clean professional link style */
const NavLink = ({ to, icon: Icon, label }) => (
  <Link
    to={to}
    className="
      flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
      text-gray-700 dark:text-gray-300 
      hover:bg-gray-200/60 dark:hover:bg-gray-700/60
      transition-all group
    "
  >
    <Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
    <span>{label}</span>
  </Link>
);
