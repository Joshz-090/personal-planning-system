import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/Firebase';
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
import { 
  FiTrendingUp, 
  FiCalendar, 
  FiTarget, 
  FiCheckCircle,
  FiClock,
  FiActivity,
  FiBarChart2
} from 'react-icons/fi';

const Analytics = () => {
  const { currentUser, userProfile } = useAuth();
  const [stats, setStats] = useState({
    dailyProgress: [],
    weeklyProgress: [],
    categoryBreakdown: [],
    totalCompleted: 0,
    totalTasks: 0,
    activeGoals: 0,
    completedGoals: 0,
    bestDay: null,
    worstDay: null,
    averageProgress: 0,
    weeklyBoardActivities: 0
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState(30); // days

  // Load real analytics data
  useEffect(() => {
    const loadAnalytics = async () => {
      if (!currentUser?.uid) return;

      try {
        setLoading(true);
        
        const today = new Date();
        const dailyData = [];
        const weeklyData = [];
        const categoryData = {};
        let totalCompleted = 0;
        let totalTasks = 0;
        const dayProgress = {};

        // Load daily tasks for the last N days
        for (let i = dateRange - 1; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dateString = date.toISOString().split('T')[0];
          
          try {
            const dailyRef = doc(db, 'users', currentUser.uid, 'daily', dateString);
            const dailyDoc = await getDoc(dailyRef);
            
            if (dailyDoc.exists()) {
              const tasks = dailyDoc.data().tasks || [];
              const completed = tasks.filter(t => t.completed).length;
              const progress = tasks.length > 0 ? (completed / tasks.length) * 100 : 0;
              
              totalTasks += tasks.length;
              totalCompleted += completed;
              
              const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
              dailyData.push({
                day: dayName,
                date: dateString,
                progress: Math.round(progress),
                completed,
                total: tasks.length
              });

              // Track progress by day of week
              const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
              if (!dayProgress[dayOfWeek]) {
                dayProgress[dayOfWeek] = { total: 0, completed: 0, count: 0 };
              }
              dayProgress[dayOfWeek].total += tasks.length;
              dayProgress[dayOfWeek].completed += completed;
              dayProgress[dayOfWeek].count += 1;
            } else {
              const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
              dailyData.push({
                day: dayName,
                date: dateString,
                progress: 0,
                completed: 0,
                total: 0
              });
            }
          } catch (err) {
            console.error(`Error loading day ${dateString}:`, err);
          }
        }

        // Calculate weekly progress (last 8 weeks)
        const currentWeek = getWeekNumber(today);
        for (let i = 7; i >= 0; i--) {
          const weekDate = new Date(today);
          weekDate.setDate(weekDate.getDate() - (i * 7));
          const weekNum = getWeekNumber(weekDate);
          const weekId = `${weekDate.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
          
          let weekProgress = 0;
          let weekCompleted = 0;
          let weekTotal = 0;
          
          // Calculate week progress from daily data
          const weekStart = new Date(weekDate);
          weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Monday
          
          for (let d = 0; d < 7; d++) {
            const dayDate = new Date(weekStart);
            dayDate.setDate(weekStart.getDate() + d);
            const dayString = dayDate.toISOString().split('T')[0];
            
            const dayData = dailyData.find(d => d.date === dayString);
            if (dayData) {
              weekTotal += dayData.total;
              weekCompleted += dayData.completed;
            }
          }
          
          weekProgress = weekTotal > 0 ? (weekCompleted / weekTotal) * 100 : 0;
          
          weeklyData.push({
            week: `W${weekNum}`,
            progress: Math.round(weekProgress),
            completed: weekCompleted,
            total: weekTotal
          });
        }

        // Load goals data
        let activeGoals = 0;
        let completedGoals = 0;
        const goalCategories = ['month', '3month', '6month', 'year'];
        
        for (const category of goalCategories) {
          try {
            const goalsRef = collection(db, 'users', currentUser.uid, 'goals');
            const q = query(goalsRef, where('category', '==', category));
            const goalsSnapshot = await getDocs(q);
            
            goalsSnapshot.forEach((doc) => {
              const goal = doc.data();
              activeGoals++;
              
              // Check if goal is completed (all checklist items done)
              if (goal.checklist && goal.checklist.length > 0) {
                const allCompleted = goal.checklist.every(item => item.completed);
                if (allCompleted) {
                  completedGoals++;
                }
              }
            });
          } catch (err) {
            console.error(`Error loading goals for ${category}:`, err);
          }
        }

        // Load weekly board activities
        let weeklyBoardActivities = 0;
        try {
          // Get current week and previous weeks
          const currentWeekId = `${today.getFullYear()}-W${String(getWeekNumber(today)).padStart(2, '0')}`;
          
          for (let i = 0; i < 4; i++) {
            const weekDate = new Date(today);
            weekDate.setDate(weekDate.getDate() - (i * 7));
            const weekNum = getWeekNumber(weekDate);
            const weekId = `${weekDate.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
            
            const boardRef = doc(db, 'users', currentUser.uid, 'weeklyBoard', weekId);
            const boardDoc = await getDoc(boardRef);
            
            if (boardDoc.exists()) {
              const activities = boardDoc.data().activities || {};
              const activityCount = Object.values(activities).reduce((sum, arr) => sum + (arr?.length || 0), 0);
              weeklyBoardActivities += activityCount;
            }
          }
        } catch (err) {
          console.error('Error loading weekly board activities:', err);
        }

        // Calculate category breakdown from weekly board
        try {
          const currentWeekId = `${today.getFullYear()}-W${String(getWeekNumber(today)).padStart(2, '0')}`;
          const boardRef = doc(db, 'users', currentUser.uid, 'weeklyBoard', currentWeekId);
          const boardDoc = await getDoc(boardRef);
          
          if (boardDoc.exists()) {
            const activities = boardDoc.data().activities || {};
            Object.values(activities).forEach(activityArray => {
              if (Array.isArray(activityArray)) {
                activityArray.forEach(activity => {
                  const category = activity.category || 'other';
                  categoryData[category] = (categoryData[category] || 0) + 1;
                });
              }
            });
          }
        } catch (err) {
          console.error('Error loading category breakdown:', err);
        }

        // Find best and worst days
        let bestDay = null;
        let worstDay = null;
        let bestProgress = -1;
        let worstProgress = 101;

        Object.entries(dayProgress).forEach(([day, data]) => {
          if (data.count > 0) {
            const avgProgress = (data.completed / data.total) * 100;
            if (avgProgress > bestProgress) {
              bestProgress = avgProgress;
              bestDay = day;
            }
            if (avgProgress < worstProgress && data.total > 0) {
              worstProgress = avgProgress;
              worstDay = day;
            }
          }
        });

        // Calculate average progress
        const averageProgress = dailyData.length > 0
          ? dailyData.reduce((sum, d) => sum + d.progress, 0) / dailyData.length
          : 0;

        // Convert category data to array
        const categoryBreakdown = Object.entries(categoryData).map(([name, value]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          value
        }));

        setStats({
          dailyProgress: dailyData,
          weeklyProgress: weeklyData,
          categoryBreakdown,
          totalCompleted,
          totalTasks,
          activeGoals,
          completedGoals,
          bestDay,
          worstDay,
          averageProgress: Math.round(averageProgress),
          weeklyBoardActivities
        });
      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [currentUser?.uid, dateRange]);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

  const getWeekNumber = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return weekNo;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Analytics & Insights
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your productivity and progress over time
          </p>
        </div>

        {/* Date Range Selector */}
        <div className="mb-6 flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Date Range:
          </label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(Number(e.target.value))}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
            <option value={60}>Last 60 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalTasks}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {stats.totalCompleted} completed
                </p>
              </div>
              <FiCheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Average Progress</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.averageProgress}%
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Over {dateRange} days
                </p>
              </div>
              <FiTrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Goals</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.activeGoals}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {stats.completedGoals} completed
                </p>
              </div>
              <FiTarget className="w-8 h-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Board Activities</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.weeklyBoardActivities}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Last 4 weeks
                </p>
              </div>
              <FiActivity className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Performance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-3 mb-4">
              <FiTrendingUp className="w-6 h-6 text-green-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Best Performing Day
              </h3>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.bestDay || 'N/A'}
            </p>
            {stats.bestDay && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Highest average completion rate
              </p>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-3 mb-4">
              <FiTrendingUp className="w-6 h-6 text-red-500 rotate-180" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Needs Improvement
              </h3>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.worstDay || 'N/A'}
            </p>
            {stats.worstDay && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Lowest average completion rate
              </p>
            )}
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Daily Progress Line Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Daily Progress Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.dailyProgress}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="day" 
                  stroke="#9CA3AF"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="progress" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="Progress %"
                  dot={{ fill: '#3B82F6', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Weekly Progress Bar Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Weekly Progress (Last 8 Weeks)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.weeklyProgress}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="week" 
                  stroke="#9CA3AF"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="progress" fill="#10B981" name="Progress %" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Category Breakdown Pie Chart */}
          {stats.categoryBreakdown.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Activity Categories Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stats.categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Additional Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Completion Statistics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalTasks > 0 
                  ? Math.round((stats.totalCompleted / stats.totalTasks) * 100)
                  : 0}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {stats.totalCompleted} of {stats.totalTasks} tasks
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Goal Completion</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.activeGoals > 0
                  ? Math.round((stats.completedGoals / stats.activeGoals) * 100)
                  : 0}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {stats.completedGoals} of {stats.activeGoals} goals
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Tasks per Day</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {dateRange > 0 ? Math.round(stats.totalTasks / dateRange) : 0}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Average over {dateRange} days
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
