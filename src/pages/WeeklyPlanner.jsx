import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWeeklyPlanner } from '../hooks/useWeeklyPlanner';
import { useDailyTasks } from '../hooks/useDailyTasks';
import ProgressBar from '../components/ProgressBar';
import { FiPlus, FiX } from 'react-icons/fi';

const WeeklyPlanner = () => {
  const { currentUser } = useAuth();
  const [selectedWeek, setSelectedWeek] = useState(getWeekId(new Date()));
  const [dailyProgress, setDailyProgress] = useState({});
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState('');

  const { weeklyData, loading, weeklyProgress, addGoal } = useWeeklyPlanner(
    currentUser?.uid,
    selectedWeek
  );

  // Get week ID from date (format: week-YYYY-WW)
  function getWeekId(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return `week-${d.getFullYear()}-${weekNo}`;
  }

  // Get dates for the week (Monday to Sunday)
  function getWeekDates(weekId) {
    const [year, week] = weekId.replace('week-', '').split('-').map(Number);
    const simple = new Date(year, 0, 1 + (week - 1) * 7);
    const dow = simple.getDay();
    const ISOweekStart = simple;
    if (dow <= 4) {
      ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    } else {
      ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
    }
    
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(ISOweekStart);
      date.setDate(ISOweekStart.getDate() + i);
      dates.push(date);
    }
    return dates;
  }

  const weekDates = getWeekDates(selectedWeek);
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Load daily progress for each day
  useEffect(() => {
    const loadDailyProgress = async () => {
      const progress = {};
      for (const date of weekDates) {
        const dateString = date.toISOString().split('T')[0];
        // We'll calculate this from daily tasks
        // For now, we'll use a placeholder - in production, you'd fetch from daily collection
        progress[dateString] = 0;
      }
      setDailyProgress(progress);
    };

    if (currentUser?.uid && weekDates.length > 0) {
      loadDailyProgress();
    }
  }, [currentUser?.uid, selectedWeek]);

  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (!newGoal.trim()) return;

    const result = await addGoal(newGoal.trim());
    if (result.success) {
      setNewGoal('');
      setShowAddGoal(false);
    }
  };

  const handleWeekChange = (e) => {
    const date = new Date(e.target.value);
    setSelectedWeek(getWeekId(date));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Weekly Planner
          </h1>
          
          {/* Week Selector */}
          <div className="flex items-center space-x-4 mb-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Select Week:
            </label>
            <input
              type="week"
              value={selectedWeek.replace('week-', '').replace('-', '-W')}
              onChange={handleWeekChange}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Weekly Progress */}
          <div className="mb-6">
            <ProgressBar 
              progress={weeklyProgress} 
              label="Weekly Progress"
            />
          </div>
        </div>

        {/* Weekly Goals */}
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Weekly Goals
            </h2>
            <button
              onClick={() => setShowAddGoal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              <FiPlus className="w-5 h-5" />
              <span>Add Goal</span>
            </button>
          </div>

          {showAddGoal && (
            <form onSubmit={handleAddGoal} className="mb-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter weekly goal..."
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddGoal(false);
                    setNewGoal('');
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
            </form>
          )}

          {weeklyData?.goals && weeklyData.goals.length > 0 ? (
            <ul className="space-y-2">
              {weeklyData.goals.map((goal) => (
                <li
                  key={goal.id}
                  className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md text-gray-700 dark:text-gray-300"
                >
                  {goal.text}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No weekly goals yet. Add one to get started!
            </p>
          )}
        </div>

        {/* Weekly Calendar Grid */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {weekDates.map((date, index) => {
            const dateString = date.toISOString().split('T')[0];
            const progress = dailyProgress[dateString] || 0;
            
            return (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700"
              >
                <div className="mb-2">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {dayNames[index]}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <div className="mt-4">
                  <ProgressBar progress={progress} size="sm" showPercentage={false} />
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {Math.round(progress)}%
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WeeklyPlanner;

