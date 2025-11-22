import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/Firebase';
import ProgressBar from '../components/ProgressBar';
import CountdownCard from '../components/CountdownCard';
import PricingBanner from '../components/PricingBanner';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { FiTrendingUp, FiCalendar, FiTarget, FiCheckCircle } from 'react-icons/fi';

const Dashboard = () => {
  const { currentUser, userProfile } = useAuth();
  const [stats, setStats] = useState({
    dailyProgress: [],
    weeklyProgress: [],
    monthlyProgress: [],
    totalCompleted: 0,
    bestDay: null,
    worstDay: null
  });
  const [loading, setLoading] = useState(true);

  // Load dashboard analytics
  useEffect(() => {
    const loadAnalytics = async () => {
      if (!currentUser?.uid) return;

      try {
        setLoading(true);
        
        // Load daily tasks for the last 7 days
        const today = new Date();
        const dailyData = [];
        const weeklyData = [];
        
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dateString = date.toISOString().split('T')[0];
          
          // In production, fetch actual data from Firestore
          // For now, using mock data structure
          const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
          dailyData.push({
            day: dayName,
            progress: Math.random() * 100 // Replace with actual data
          });
        }

        // Weekly data (last 4 weeks)
        for (let i = 3; i >= 0; i--) {
          weeklyData.push({
            week: `Week ${4 - i}`,
            progress: Math.random() * 100 // Replace with actual data
          });
        }

        // Monthly data (last 6 months)
        const monthlyData = [
          { name: 'Jan', value: 65 },
          { name: 'Feb', value: 78 },
          { name: 'Mar', value: 82 },
          { name: 'Apr', value: 70 },
          { name: 'May', value: 90 },
          { name: 'Jun', value: 85 }
        ];

        setStats({
          dailyProgress: dailyData,
          weeklyProgress: weeklyData,
          monthlyProgress: monthlyData,
          totalCompleted: 156, // Replace with actual count
          bestDay: 'Friday',
          worstDay: 'Monday'
        });
      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [currentUser?.uid]);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {userProfile?.name || 'User'}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Here's your planning overview
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Completed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalCompleted}
                </p>
              </div>
              <FiCheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Best Day</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.bestDay || 'N/A'}
                </p>
              </div>
              <FiTrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">This Week</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.weeklyProgress.length > 0 
                    ? Math.round(stats.weeklyProgress[stats.weeklyProgress.length - 1].progress)
                    : 0}%
                </p>
              </div>
              <FiCalendar className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Goals</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {/* Replace with actual count */}
                  8
                </p>
              </div>
              <FiTarget className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Daily Progress Line Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Daily Progress (Last 7 Days)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.dailyProgress}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="progress" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="Progress %"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Weekly Progress Bar Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Weekly Progress (Last 4 Weeks)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.weeklyProgress}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="progress" fill="#10B981" name="Progress %" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Progress Pie Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Monthly Progress (Last 6 Months)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.monthlyProgress}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.monthlyProgress.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Countdown Card */}
        {userProfile?.countdownDate && (
          <div className="mb-8">
            <CountdownCard
              targetDate={userProfile.countdownDate}
              message={userProfile.customMessage}
            />
          </div>
        )}

        {/* Pricing Banner */}
        <div className="mb-8">
          <PricingBanner currentPlan={userProfile?.plan || 'free'} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

