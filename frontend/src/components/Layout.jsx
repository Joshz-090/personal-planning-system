import { Outlet } from 'react-router-dom';
import NavBar from './NavBar';
import Sidebar from './Sidebar';
import { useAuth } from '../contexts/AuthContext';

/**
 * Layout Component
 * Wraps protected routes with NavBar and Sidebar
 */
const Layout = () => {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 pt-16">
      <NavBar />
      <div className="flex">
        {currentUser && <Sidebar />}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;

