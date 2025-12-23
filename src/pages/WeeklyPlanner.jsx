import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWeeklyPlanner } from '../hooks/useWeeklyPlanner';
import { useDailyTasks } from '../hooks/useDailyTasks';
import ProgressBar from '../components/ProgressBar';
import Kenat from 'kenat';
import { 
  FiPlus, 
  FiX, 
  FiChevronLeft, 
  FiChevronRight,
  FiCalendar
} from 'react-icons/fi';
import { formatDate } from '../utils/ethiopianCalendar';

const WeeklyPlanner = () => {
  const { currentUser, userProfile } = useAuth();
  const calendarPreference = userProfile?.calendarPreference || 'gregorian';
  const [selectedWeek, setSelectedWeek] = useState(getWeekId(new Date(), calendarPreference));
  const [dailyProgress, setDailyProgress] = useState({});
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState('');

  // Update selected week when calendar preference changes
  useEffect(() => {
    if (userProfile?.calendarPreference) {
      const currentDate = new Date();
      const newWeekId = getWeekId(currentDate, userProfile.calendarPreference);
      setSelectedWeek(prev => {
        if (!prev) return newWeekId;
        const prevIsEth = prev.startsWith('ETH-') || prev.startsWith('week-ETH-'); // Adjusting for previous format if any
        const newIsEth = newWeekId.startsWith('ETH-');
        if (prevIsEth !== newIsEth || newWeekId !== prev) {
          return newWeekId;
        }
        return prev;
      });
    }
  }, [userProfile?.calendarPreference]);

  const { weeklyData, loading, weeklyProgress, addGoal } = useWeeklyPlanner(
    currentUser?.uid,
    selectedWeek
  );

  // Get week ID from date
  function getWeekId(date, calendarType = 'gregorian') {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    
    if (calendarType === 'ethiopian') {
      try {
        const kenat = new Kenat(d);
        const eth = kenat.getEthiopian();
        const dayOfYear = (eth.month - 1) * 30 + eth.day;
        const weekNo = Math.ceil(dayOfYear / 7);
        return `ETH-${eth.year}-W${String(weekNo).padStart(2, '0')}`;
      } catch (e) {
        console.error("Kenat calculation error", e);
        return `ETH-ERR-W01`;
      }
    } else {
      // ISO week logic
      d.setDate(d.getDate() + 4 - (d.getDay() || 7));
      const yearStart = new Date(d.getFullYear(), 0, 1);
      const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
      return `${d.getFullYear()}-W${String(weekNo).padStart(2, '0')}`;
    }
  }

  // Get dates for the week (Monday to Sunday)
  function getWeekDates(weekId) {
    if (weekId.startsWith('ETH-')) {
      const parts = weekId.replace('ETH-', '').split('-W');
      const ethYear = parseInt(parts[0]);
      const week = parseInt(parts[1]);
      
      const gcYearApprox = ethYear + 7; 
      const yearStart = new Date(gcYearApprox, 8, 11); // Sept 11
      
      const daysOffset = (week - 1) * 7;
      const weekStartApprox = new Date(yearStart);
      weekStartApprox.setDate(yearStart.getDate() + daysOffset);
      
      const dayOfWeek = weekStartApprox.getDay(); 
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      weekStartApprox.setDate(weekStartApprox.getDate() + mondayOffset);
      
      const dates = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(weekStartApprox);
        d.setDate(weekStartApprox.getDate() + i);
        dates.push(d);
      }
      return dates;
    } else {
      // Gregorian
      const parts = weekId.split('-W');
      const year = parseInt(parts[0]);
      const week = parseInt(parts[1]);
      
      const simple = new Date(year, 0, 1 + (week - 1) * 7);
      const dow = simple.getDay();
      const ISOweekStart = new Date(simple);
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
  }

  // Navigate week
  const navigateWeek = (direction) => {
    if (selectedWeek.startsWith('ETH-')) {
      const parts = selectedWeek.replace('ETH-', '').split('-W');
      let ethYear = parseInt(parts[0]);
      let week = parseInt(parts[1]);
      week += direction;
      if (week < 1) { ethYear--; week = 52; }
      else if (week > 52) { ethYear++; week = 1; }
      setSelectedWeek(`ETH-${ethYear}-W${String(week).padStart(2, '0')}`);
    } else {
      const parts = selectedWeek.split('-W');
      let year = parseInt(parts[0]);
      let week = parseInt(parts[1]);
      let newWeek = week + direction;
      if (newWeek < 1) { year--; newWeek = 52; }
      else if (newWeek > 52) { year++; newWeek = 1; }
      setSelectedWeek(`${year}-W${String(newWeek).padStart(2, '0')}`);
    }
  };

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
    <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Weekly Planner
            </h1>
            <button
              onClick={() => setSelectedWeek(getWeekId(new Date(), calendarPreference))}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium shadow-sm"
            >
              This Week
            </button>
          </div>
          
          {/* Week Navigation */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center justify-center sm:justify-start space-x-2 sm:space-x-3">
              <button
                onClick={() => navigateWeek(-1)}
                className="p-2.5 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm"
                title="Previous week"
              >
                <FiChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
              
              <div className="text-center px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm min-w-[220px]">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  Week {selectedWeek}
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                  {calendarPreference === 'ethiopian' 
                    ? `${formatDate(weekDates[0], 'ethiopian')} - ${formatDate(weekDates[6], 'ethiopian')}`
                    : `${weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                  }
                </p>
              </div>

              <button
                onClick={() => navigateWeek(1)}
                className="p-2.5 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm"
                title="Next week"
              >
                <FiChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
            </div>
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
                    {formatDate(date, calendarPreference)}
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
  );
};

export default WeeklyPlanner;

