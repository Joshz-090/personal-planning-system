import { Link, useLocation } from 'react-router-dom';
import { 
  FiHome, 
  FiCalendar, 
  FiBarChart2, 
  FiTarget, 
  FiSettings,
  FiTrendingUp,
  FiClock,
  FiGrid
} from 'react-icons/fi';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { path: '/daily', icon: FiClock, label: 'Daily Planner' },
    { path: '/weekly', icon: FiBarChart2, label: 'Weekly Planner' },
    { path: '/weekly-board', icon: FiGrid, label: 'Time & Plan Board' },
    { path: '/goals', icon: FiTarget, label: 'Goals' },
    { path: '/analytics', icon: FiTrendingUp, label: 'Analytics' },
    { path: '/settings', icon: FiSettings, label: 'Settings' },
  ];

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 shadow-lg min-h-screen border-r border-gray-200 dark:border-gray-700">
      <div className="p-4">
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                  isActive(item.path)
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;

