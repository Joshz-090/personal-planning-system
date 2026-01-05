import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Protected Route Component
 * Redirects to login if user is not authenticated
 */
import { FiSlash } from 'react-icons/fi';

const ProtectedRoute = ({ children }) => {
  const { currentUser, userProfile } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (userProfile?.status === 'denied') {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center p-4 text-center">
        <div className="max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiSlash className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4">Access Denied</h1>
          <p className="text-slate-500 dark:text-gray-400 mb-8 leading-relaxed">
            Your access to the Shcadule system has been suspended. <br/>
            Please contact administration if you believe this is a mistake.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-slate-900 dark:bg-white dark:text-gray-900 text-white rounded-2xl font-bold hover:scale-105 transition-transform"
          >
            Check Status
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;

