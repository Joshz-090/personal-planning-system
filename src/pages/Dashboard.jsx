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
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

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
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-2 leading-tight">
            Welcome back, <span className="text-blue-600 dark:text-blue-400">{userProfile?.name?.split(' ')[0] || 'User'}</span>!
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-gray-400 font-medium">
            Here's your productivity overview
          </p>
        </div>

        {/* Stats Cards */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8"
        >
          <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-slate-100 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-gray-400">Total Completed</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">
                  {stats.totalCompleted}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-2xl flex items-center justify-center">
                <FiCheckCircle className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-slate-100 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-gray-400">Best Day</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">
                  {stats.bestDay || 'N/A'}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center">
                <FiTrendingUp className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-slate-100 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-gray-400">This Week</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">
                  {stats.weeklyProgress.length > 0 
                    ? Math.round(stats.weeklyProgress[stats.weeklyProgress.length - 1].progress)
                    : 0}%
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center">
                <FiCalendar className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-slate-100 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-gray-400">Active Goals</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">
                  8
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/20 rounded-2xl flex items-center justify-center">
                <FiTarget className="w-6 h-6 text-orange-500" />
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Charts Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
        >
          {/* Daily Progress Line Chart */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-slate-100 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Daily Performance
              </h3>
              <div className="text-xs px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full font-bold">
                Last 7 Days
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.dailyProgress}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="progress" 
                  stroke="#3B82F6" 
                  strokeWidth={4}
                  dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  name="Progress %"
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Weekly Progress Bar Chart */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-slate-100 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Weekly Growth
              </h3>
              <div className="text-xs px-3 py-1 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full font-bold">
                Consistency
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.weeklyProgress}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="progress" fill="#10B981" radius={[10, 10, 0, 0]} name="Progress %" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Monthly Progress Pie Chart */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-slate-100 dark:border-gray-800 p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Monthly Breakdown
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.monthlyProgress}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.monthlyProgress.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={8} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </motion.div>

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

