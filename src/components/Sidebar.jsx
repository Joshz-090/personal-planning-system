import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FiHome, FiClock, FiBarChart2, FiGrid,
  FiTarget, FiTrendingUp, FiSettings, FiMenu, FiX
} from "react-icons/fi";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false); 
  const location = useLocation();

  const menuItems = [
    { path: "/dashboard", icon: FiHome, label: "Dashboard" },
    { path: "/daily", icon: FiClock, label: "Daily Planner" },
    { path: "/weekly", icon: FiBarChart2, label: "Weekly Planner" },
    { path: "/weekly-board", icon: FiGrid, label: "Time & Plan Board" },
    { path: "/goals", icon: FiTarget, label: "Goals" },
    { path: "/analytics", icon: FiTrendingUp, label: "Analytics" },
    { path: "/settings", icon: FiSettings, label: "Settings" },
  ];

  const isActive = (path) =>
    location.pathname === path ||
    location.pathname.startsWith(path + "/");

  return (
    <>
      {/* MENU BUTTON — only shows when sidebar is closed */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-4 z-[60] 
          bg-white/80 dark:bg-gray-900/80 backdrop-blur-md 
          p-3 rounded-xl shadow-xl hover:scale-105 transition-transform"
        >
          <FiMenu className="w-6 h-6 text-gray-700 dark:text-gray-200" />
        </button>
      )}

      {/* OVERLAY */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-fadeIn"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 z-50 
        bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl 
        shadow-xl border-r border-gray-200/50 dark:border-gray-700/40
        transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        flex flex-col`}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200/50 dark:border-gray-700/40">
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            Menu
          </h1>
          
          {/* CLOSE BUTTON — only shows when sidebar is open */}
          {isOpen && (
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-200/60 dark:hover:bg-gray-700/60 transition"
            >
              <FiX className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>
          )}
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`group flex items-center gap-4 p-3 rounded-xl transition-all
                ${active
                  ? "bg-blue-600 text-white shadow-md scale-[1.01]"
                  : "hover:bg-gray-200/60 dark:hover:bg-gray-700/60 text-gray-800 dark:text-gray-300"
                }`}
              >
                <Icon
                  className={`w-6 h-6 transition-transform duration-200 
                  group-hover:scale-110 ${
                    active ? "text-white" : "text-gray-600 dark:text-gray-300"
                  }`}
                />

                <span className="font-medium">{item.label}</span>

                {/* right hover shimmer */}
                <div className="
                  ml-auto opacity-0 group-hover:opacity-100 transition
                  text-gray-500 text-xs
                ">
                  →
                </div>
              </Link>
            );
          })}
        </nav>

        {/* FOOTER / Profile */}
        <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
              J
            </div>
            <div>
              <p className="text-gray-900 dark:text-gray-100 font-medium">Josh</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">User</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
