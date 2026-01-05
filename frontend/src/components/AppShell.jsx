import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  FiHome, FiClock, FiBarChart2, FiGrid,
  FiTarget, FiTrendingUp, FiSettings, FiMenu, FiX,
  FiLogOut, FiBell, FiUser, FiZap, FiShield, FiFileText, FiStar
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const AppShell = () => {
  const { currentUser, userProfile, logout } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const isAdmin = userProfile?.role === 'admin';

  // Calculate subscription expiry
  useEffect(() => {
    if (userProfile?.expiryDate) {
      const expiry = new Date(userProfile.expiryDate);
      const now = new Date();
      const diffTime = expiry - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDaysRemaining(diffDays);
    } else {
      setDaysRemaining(null);
    }
  }, [userProfile?.expiryDate]);

  const menuItems = [
    { path: "/dashboard", icon: FiHome, label: "Dashboard" },
    { path: "/daily", icon: FiClock, label: "Daily Planner" },
    { path: "/weekly-board", icon: FiGrid, label: "Time Board" },
    { path: "/goals", icon: FiTarget, label: "Goals" },
    { path: "/analytics", icon: FiTrendingUp, label: "Analytics" },
    { path: "/blog", icon: FiFileText, label: "Blog & Tips" },
  ];

  const adminItems = [
    { path: "/admin/users", icon: FiUser, label: "User Control" },
    { path: "/admin/payments", icon: FiZap, label: "Sub Approvals" },
    { path: "/admin/blog", icon: FiFileText, label: "Blog Manager" },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 flex">
      
      {/* SIDEBAR - Desktop */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 
        border-r border-slate-200 dark:border-gray-800
        transition-transform duration-300 lg:translate-x-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-gray-800">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform">
                <FiGrid className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                Shcadule
              </span>
            </Link>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
            {/* Main Menu */}
            <div>
              <p className="px-3 text-xs font-semibold text-slate-400 dark:text-gray-500 uppercase tracking-wider mb-4">
                Main Menu
              </p>
              <nav className="space-y-1">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group
                      ${isActive(item.path) 
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
                        : "text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400"}
                    `}
                  >
                    <item.icon className={`w-5 h-5 ${isActive(item.path) ? "text-white" : "group-hover:scale-110 transition-transform"}`} />
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Admin Menu */}
            {isAdmin && (
              <div>
                <p className="px-3 text-xs font-semibold text-amber-500 dark:text-amber-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <FiShield className="w-3 h-3" /> Admin Area
                </p>
                <nav className="space-y-1">
                  {adminItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group
                        ${isActive(item.path) 
                          ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20" 
                          : "text-slate-600 dark:text-gray-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-600"}
                      `}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>
            )}
          </div>

          {/* User Profile Hook */}
          <div className="p-4 border-t border-slate-100 dark:border-gray-800">
            <div className={`p-4 rounded-2xl bg-slate-50 dark:bg-gray-800/50 flex items-center gap-3`}>
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold border-2 border-white dark:border-gray-700">
                {userProfile?.name?.[0] || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {userProfile?.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-gray-400 capitalize">
                  {userProfile?.subscriptionStatus === 'pending' 
                    ? `${userProfile?.pendingPlan} (Pending)` 
                    : `${userProfile?.plan || 'Free'} Plan`}
                </p>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
              >
                <FiLogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        
        {/* TOPBAR */}
        <header className="h-16 sticky top-0 z-40 bg-white/70 dark:bg-gray-950/70 backdrop-blur-xl border-b border-slate-200 dark:border-gray-800 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2 sm:p-2.5 rounded-xl lg:hidden hover:bg-slate-100 dark:hover:bg-gray-800 transition active:scale-95"
            >
              <FiMenu className="w-5 h-5 sm:w-6 h-6 text-slate-600 dark:text-gray-400" />
            </button>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate max-w-[120px] sm:max-w-none">
              {menuItems.find(i => isActive(i.path))?.label || adminItems.find(i => isActive(i.path))?.label || "Settings"}
            </h2>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3">
            <button className="p-2 sm:p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-gray-800 transition-all relative active:scale-95">
              <FiBell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
            </button>
            <Link to="/settings" className="p-2 sm:p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-gray-800 transition-all active:scale-95">
              <FiSettings className="w-5 h-5" />
            </Link>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 p-4 lg:p-8">
          {/* Subscription Warning Banner */}
          <AnimatePresence>
            {daysRemaining !== null && daysRemaining <= 3 && (userProfile?.plan || userProfile?.settings?.plan) !== 'free' && (
              <motion.div 
                initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                animate={{ height: 'auto', opacity: 1, marginBottom: 24 }}
                exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 dark:bg-amber-800/50 rounded-lg">
                      <FiZap className="text-amber-500 w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-amber-900 dark:text-amber-100">
                        Subscription Expiring Soon!
                      </p>
                      <p className="text-xs text-amber-700/80 dark:text-amber-200/60">
                        Your {userProfile.plan || userProfile.settings?.plan} plan expires in {daysRemaining} days.
                      </p>
                    </div>
                  </div>
                  <Link to="/pricing" className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-amber-500/20">
                    Renew Now
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-white dark:bg-gray-950 z-50 lg:hidden shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 dark:border-gray-800 flex items-center justify-between">
                <Link to="/dashboard" className="flex items-center gap-3" onClick={() => setSidebarOpen(false)}>
                  <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <FiGrid className="text-white w-5 h-5" />
                  </div>
                  <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Shcadule</h1>
                </Link>
                <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-xl bg-slate-100 dark:bg-gray-800 active:scale-95 transition-transform">
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 py-6 space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${
                        isActive(item.path) 
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                          : 'text-slate-500 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-gray-900'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  )
                })}

                {isAdmin && (
                  <div className="mt-10">
                    <h3 className="px-4 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500 mb-4">Administration</h3>
                    {adminItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setSidebarOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${
                            isActive(item.path) 
                              ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' 
                              : 'text-slate-500 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-gray-900'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          {item.label}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-slate-100 dark:border-gray-800">
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-4 text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl transition-all">
                  <FiLogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AppShell;
