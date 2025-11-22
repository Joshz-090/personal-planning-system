import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import NavBar from '../components/NavBar';
import Sidebar from '../components/Sidebar';
import CountdownCard from '../components/CountdownCard';
import PricingBanner from '../components/PricingBanner';
import { FiCalendar, FiTarget, FiBarChart2, FiCheckCircle } from 'react-icons/fi';

const Home = () => {
  const { currentUser, userProfile } = useAuth();

  if (currentUser) {
    // Authenticated user - show dashboard-like home
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <NavBar />
        <div className="flex">
          <Sidebar />
          <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Welcome to Shcadule
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              Your personal planning system for daily, weekly, and long-term goals
            </p>
            
            {userProfile?.customMessage && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8 max-w-2xl mx-auto">
                <p className="text-lg text-blue-900 dark:text-blue-200">
                  {userProfile.customMessage}
                </p>
              </div>
            )}

            {userProfile?.countdownDate && (
              <div className="mb-8">
                <CountdownCard
                  targetDate={userProfile.countdownDate}
                  message={userProfile.customMessage}
                />
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Link
              to="/daily"
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition text-center"
            >
              <FiCalendar className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Daily Planner
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage up to 20 tasks per day
              </p>
            </Link>

            <Link
              to="/weekly"
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition text-center"
            >
              <FiBarChart2 className="w-12 h-12 text-purple-600 dark:text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Weekly Planner
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Track your weekly progress
              </p>
            </Link>

            <Link
              to="/goals"
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition text-center"
            >
              <FiTarget className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Goals
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Set and track long-term goals
              </p>
            </Link>

            <Link
              to="/dashboard"
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition text-center"
            >
              <FiCheckCircle className="w-12 h-12 text-orange-600 dark:text-orange-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Dashboard
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                View analytics and insights
              </p>
            </Link>
          </div>

          {/* Pricing Banner */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Pricing Plans
            </h2>
            <PricingBanner currentPlan={userProfile?.plan || 'free'} />
          </div>
          </div>
        </div>
        </div>
      </div>
    );
  }

  // Unauthenticated user - show landing page
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Shcadule
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-8">
            Your complete personal planning system
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/register"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="px-8 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition shadow-lg"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
            <FiCalendar className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Daily Planning
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Manage up to 20 tasks per day with progress tracking
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
            <FiBarChart2 className="w-12 h-12 text-purple-600 dark:text-purple-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Weekly Overview
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Track your weekly progress and set weekly goals
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
            <FiTarget className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Long-Term Goals
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Set and track monthly, quarterly, and yearly goals
            </p>
          </div>
        </div>

        {/* Pricing Preview */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Choose Your Plan
          </h2>
          <PricingBanner currentPlan="free" />
        </div>
      </div>
    </div>
  );
};

export default Home;

