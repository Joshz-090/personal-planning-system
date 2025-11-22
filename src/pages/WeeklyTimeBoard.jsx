import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWeeklyBoard } from '../hooks/useWeeklyBoard';
import { formatTime, gregorianToEthiopian, formatDate } from '../utils/ethiopianCalendar';
import { 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiChevronLeft, 
  FiChevronRight,
  FiClock,
  FiCopy,
  FiBarChart2
} from 'react-icons/fi';

const WeeklyTimeBoard = () => {
  const { currentUser, userProfile } = useAuth();
  const calendarPreference = userProfile?.calendarPreference || 'gregorian';
  const [selectedWeek, setSelectedWeek] = useState(getWeekId(new Date(), calendarPreference));
  const [timeFormat, setTimeFormat] = useState(userProfile?.timeFormat || '24');
  const [showAddSlotModal, setShowAddSlotModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null); // { day, slotId }
  const [editingActivity, setEditingActivity] = useState(null);
  const [newSlotStart, setNewSlotStart] = useState('06:00');
  const [newSlotEnd, setNewSlotEnd] = useState('07:00');
  const [activityForm, setActivityForm] = useState({
    title: '',
    description: '',
    color: 'blue',
    category: 'other'
  });

  const { 
    boardData, 
    loading, 
    error,
    addTimeSlot,
    deleteTimeSlot,
    addActivity,
    updateActivity,
    deleteActivity,
    copyFromPreviousWeek
  } = useWeeklyBoard(currentUser?.uid, selectedWeek);

  // Update selected week when calendar preference changes
  useEffect(() => {
    if (userProfile?.calendarPreference) {
      const currentDate = new Date();
      const newWeekId = getWeekId(currentDate, userProfile.calendarPreference);
      setSelectedWeek(prev => {
        // Only update if the week ID format changed (gregorian vs ethiopian)
        const prevIsEth = prev.startsWith('ETH-');
        const newIsEth = newWeekId.startsWith('ETH-');
        if (prevIsEth !== newIsEth || newWeekId !== prev) {
          return newWeekId;
        }
        return prev;
      });
    }
  }, [userProfile?.calendarPreference]);

  // Get week ID (format: 2025-W14 or Ethiopian week ID)
  function getWeekId(date, calendarType = 'gregorian') {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    
    if (calendarType === 'ethiopian') {
      // Convert to Ethiopian date
      const ethDate = gregorianToEthiopian(d);
      
      // Calculate week number in Ethiopian calendar
      // Ethiopian year starts on September 11 (Gregorian)
      const ethYearStart = new Date(d.getFullYear(), 8, 11); // September 11
      if (d < ethYearStart) {
        ethYearStart.setFullYear(d.getFullYear() - 1);
      }
      
      const daysSinceYearStart = Math.floor((d - ethYearStart) / (1000 * 60 * 60 * 24));
      const weekNo = Math.floor(daysSinceYearStart / 7) + 1;
      
      // Handle week overflow (Ethiopian year has ~52 weeks)
      const finalWeek = weekNo > 52 ? 52 : (weekNo < 1 ? 1 : weekNo);
      
      return `ETH-${ethDate.year}-W${String(finalWeek).padStart(2, '0')}`;
    } else {
      // Gregorian calendar
      d.setDate(d.getDate() + 4 - (d.getDay() || 7));
      const yearStart = new Date(d.getFullYear(), 0, 1);
      const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
      return `${d.getFullYear()}-W${String(weekNo).padStart(2, '0')}`;
    }
  }

  // Get dates for the week (Monday to Sunday)
  function getWeekDates(weekId) {
    if (weekId.startsWith('ETH-')) {
      // Ethiopian calendar week
      const parts = weekId.replace('ETH-', '').split('-W');
      const ethYear = parseInt(parts[0]);
      const week = parseInt(parts[1]);
      
      // Approximate: Ethiopian year starts around Sept 11
      // Calculate approximate Gregorian date for the week
      const approxGregorianYear = ethYear + 7; // Ethiopian year is ~7-8 years behind
      const yearStart = new Date(approxGregorianYear, 8, 11); // September 11
      const weekStart = new Date(yearStart);
      weekStart.setDate(yearStart.getDate() + (week - 1) * 7);
      
      // Adjust to Monday
      const dayOfWeek = weekStart.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      weekStart.setDate(weekStart.getDate() + mondayOffset);
      
      const dates = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + i);
        dates.push(date);
      }
      return dates;
    } else {
      // Gregorian calendar week
      const [year, week] = weekId.split('-W').map(Number);
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

  const weekDates = getWeekDates(selectedWeek);
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  // Color options for activities
  const colorOptions = [
    { value: 'blue', label: 'Blue', class: 'bg-blue-500' },
    { value: 'green', label: 'Green', class: 'bg-green-500' },
    { value: 'red', label: 'Red', class: 'bg-red-500' },
    { value: 'yellow', label: 'Yellow', class: 'bg-yellow-500' },
    { value: 'purple', label: 'Purple', class: 'bg-purple-500' },
    { value: 'pink', label: 'Pink', class: 'bg-pink-500' },
    { value: 'indigo', label: 'Indigo', class: 'bg-indigo-500' },
    { value: 'orange', label: 'Orange', class: 'bg-orange-500' },
  ];

  const categoryOptions = [
    { value: 'study', label: 'Study' },
    { value: 'work', label: 'Work' },
    { value: 'rest', label: 'Rest' },
    { value: 'gym', label: 'Gym' },
    { value: 'meal', label: 'Meal' },
    { value: 'social', label: 'Social' },
    { value: 'other', label: 'Other' }
  ];

  // Format time based on user preference
  const formatTimeDisplay = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes || 0, 0, 0);
    return formatTime(date, timeFormat);
  };

  // Navigate weeks
  const navigateWeek = (direction) => {
    if (selectedWeek.startsWith('ETH-')) {
      // Ethiopian calendar navigation
      const parts = selectedWeek.replace('ETH-', '').split('-W');
      let ethYear = parseInt(parts[0]);
      let week = parseInt(parts[1]);
      
      week += direction;
      
      if (week < 1) {
        ethYear--;
        week = 52;
      } else if (week > 52) {
        ethYear++;
        week = 1;
      }
      
      setSelectedWeek(`ETH-${ethYear}-W${String(week).padStart(2, '0')}`);
    } else {
      // Gregorian calendar navigation
      const [year, week] = selectedWeek.split('-W').map(Number);
      let newWeek = week + direction;
      let newYear = year;

      if (newWeek < 1) {
        newYear--;
        newWeek = 52;
      } else if (newWeek > 52) {
        newYear++;
        newWeek = 1;
      }

      setSelectedWeek(`${newYear}-W${String(newWeek).padStart(2, '0')}`);
    }
  };

  // Handle add time slot
  const handleAddTimeSlot = async (e) => {
    e.preventDefault();
    if (!newSlotStart || !newSlotEnd) return;

    const result = await addTimeSlot(newSlotStart, newSlotEnd);
    if (result.success) {
      setShowAddSlotModal(false);
      setNewSlotStart('06:00');
      setNewSlotEnd('07:00');
    } else {
      alert('Error adding time slot: ' + result.error);
    }
  };

  // Handle add/edit activity
  const handleActivitySubmit = async (e) => {
    e.preventDefault();
    if (!activityForm.title.trim() || !selectedCell) return;

    let result;
    if (editingActivity) {
      result = await updateActivity(
        selectedCell.day,
        selectedCell.slotId,
        editingActivity.id,
        activityForm
      );
    } else {
      result = await addActivity(selectedCell.day, selectedCell.slotId, activityForm);
    }

    if (result.success) {
      setShowActivityModal(false);
      setSelectedCell(null);
      setEditingActivity(null);
      setActivityForm({ title: '', description: '', color: 'blue', category: 'other' });
    } else {
      alert('Error saving activity: ' + result.error);
    }
  };

  // Open activity modal
  const openActivityModal = (day, slotId, activity = null) => {
    setSelectedCell({ day, slotId });
    if (activity) {
      setEditingActivity(activity);
      setActivityForm({
        title: activity.title,
        description: activity.description || '',
        color: activity.color || 'blue',
        category: activity.category || 'other'
      });
    } else {
      setEditingActivity(null);
      setActivityForm({ title: '', description: '', color: 'blue', category: 'other' });
    }
    setShowActivityModal(true);
  };

  // Handle delete activity
  const handleDeleteActivity = async (day, slotId, activityId) => {
    if (!confirm('Are you sure you want to delete this activity?')) return;
    
    const result = await deleteActivity(day, slotId, activityId);
    if (!result.success) {
      alert('Error deleting activity: ' + result.error);
    }
  };

  // Handle delete time slot
  const handleDeleteTimeSlot = async (slotId) => {
    if (!confirm('Are you sure? This will delete all activities in this time slot.')) return;
    
    const result = await deleteTimeSlot(slotId);
    if (!result.success) {
      alert('Error deleting time slot: ' + result.error);
    }
  };

  // Auto-generate next week
  const handleGenerateNextWeek = async () => {
    let nextWeekId;
    
    if (selectedWeek.startsWith('ETH-')) {
      const parts = selectedWeek.replace('ETH-', '').split('-W');
      let ethYear = parseInt(parts[0]);
      let week = parseInt(parts[1]);
      
      week += 1;
      if (week > 52) {
        ethYear++;
        week = 1;
      }
      
      nextWeekId = `ETH-${ethYear}-W${String(week).padStart(2, '0')}`;
    } else {
      const [year, week] = selectedWeek.split('-W').map(Number);
      let nextWeek = week + 1;
      let nextYear = year;
      
      if (nextWeek > 52) {
        nextYear++;
        nextWeek = 1;
      }
      
      nextWeekId = `${nextYear}-W${String(nextWeek).padStart(2, '0')}`;
    }
    
    const result = await copyFromPreviousWeek(selectedWeek, nextWeekId);
    
    if (result.success) {
      setSelectedWeek(nextWeekId);
      alert('Next week generated successfully!');
    } else {
      alert('Error generating next week: ' + result.error);
    }
  };

  // Get activities for a cell
  const getActivitiesForCell = (day, slotId) => {
    if (!boardData?.activities) return [];
    const key = `${day}_${slotId}`;
    return boardData.activities[key] || [];
  };

  // Calculate weekly summary
  const getWeeklySummary = () => {
    if (!boardData?.activities) return { totalActivities: 0, categories: {} };

    let totalActivities = 0;
    const categories = {};

    Object.values(boardData.activities).forEach(activities => {
      activities.forEach(activity => {
        totalActivities++;
        const category = activity.category || 'other';
        categories[category] = (categories[category] || 0) + 1;
      });
    });

    return { totalActivities, categories };
  };

  const summary = getWeeklySummary();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                Weekly Time & Plan Board
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Plan your weekly schedule with time slots and activities
              </p>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Time Format Toggle */}
              <button
                onClick={() => setTimeFormat(timeFormat === '24' ? '12' : '24')}
                className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm"
                title="Toggle time format"
              >
                <FiClock className="w-4 h-4" />
                <span className="text-sm font-medium">{timeFormat === '24' ? '24h' : '12h'}</span>
              </button>

              {/* Generate Next Week */}
              <button
                onClick={handleGenerateNextWeek}
                className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-sm"
                title="Generate next week from template"
              >
                <FiCopy className="w-4 h-4" />
                <span className="text-sm font-medium hidden sm:inline">Next Week</span>
              </button>
            </div>
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
              
              <div className="text-center px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm min-w-[200px]">
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

              <button
                onClick={() => setSelectedWeek(getWeekId(new Date(), calendarPreference))}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium shadow-sm"
                title="Go to current week"
              >
                Today
              </button>
            </div>

            {/* Add Time Slot Button */}
            <button
              onClick={() => setShowAddSlotModal(true)}
              className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm font-medium"
            >
              <FiPlus className="w-5 h-5" />
              <span className="text-sm sm:text-base">Add Time Slot</span>
            </button>
          </div>

          {/* Weekly Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-5 mb-6">
            <div className="flex items-center space-x-2 mb-3">
              <FiBarChart2 className="w-5 h-5 text-blue-600" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Weekly Summary</h3>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Activities:</span>
                <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">{summary.totalActivities}</span>
              </div>
              {Object.keys(summary.categories).length > 0 && (
                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Categories:</span>
                  {Object.entries(summary.categories).map(([category, count]) => (
                    <div key={category} className="flex items-center space-x-1.5 px-2.5 py-1 bg-gray-100 dark:bg-gray-700 rounded-md">
                      <span className="text-xs sm:text-sm capitalize text-gray-700 dark:text-gray-300">{category}</span>
                      <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">{count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg">
            <p className="font-medium">Error: {error}</p>
          </div>
        )}

        {/* Grid Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
                  <th className="sticky left-0 z-10 bg-gray-50 dark:bg-gray-700/50 border-r border-gray-200 dark:border-gray-600 p-3 text-left text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 min-w-[140px] sm:min-w-[160px]">
                    Time Slot
                  </th>
                  {dayNames.map((day, index) => (
                    <th
                      key={index}
                      className="border-r border-gray-200 dark:border-gray-600 last:border-r-0 p-2 sm:p-3 text-center text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 min-w-[140px] sm:min-w-[160px]"
                    >
                      <div className="font-semibold">{day}</div>
                      <div className="text-xs font-normal text-gray-500 dark:text-gray-400 mt-1">
                        {calendarPreference === 'ethiopian' 
                          ? formatDate(weekDates[index], 'ethiopian')
                          : weekDates[index].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        }
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {boardData?.timeSlots && boardData.timeSlots.length > 0 ? (
                  boardData.timeSlots.map((slot) => (
                    <tr key={slot.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 border-b border-gray-200 dark:border-gray-600 last:border-b-0 transition-colors">
                      <td className="sticky left-0 z-10 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-600 p-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">
                            {formatTimeDisplay(slot.startTime)} - {formatTimeDisplay(slot.endTime)}
                          </div>
                          <button
                            onClick={() => handleDeleteTimeSlot(slot.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition flex-shrink-0"
                            title="Delete time slot"
                          >
                            <FiTrash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                      {dayKeys.map((day) => (
                        <td
                          key={`${day}_${slot.id}`}
                          className="border-r border-gray-200 dark:border-gray-600 last:border-r-0 p-2 sm:p-3 min-h-[100px] align-top bg-white dark:bg-gray-800"
                        >
                          <div className="space-y-2">
                            {getActivitiesForCell(day, slot.id).map((activity) => (
                              <div
                                key={activity.id}
                                className={`p-2.5 rounded-lg text-xs ${
                                  colorOptions.find(c => c.value === activity.color)?.class || 'bg-blue-500'
                                } bg-opacity-10 dark:bg-opacity-20 border-l-4 ${
                                  colorOptions.find(c => c.value === activity.color)?.class || 'border-blue-500'
                                } border-opacity-100 hover:shadow-sm transition-shadow`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-gray-900 dark:text-white truncate">
                                      {activity.title}
                                    </div>
                                    {activity.description && (
                                      <div className="text-gray-600 dark:text-gray-400 mt-1 text-xs line-clamp-2">
                                        {activity.description}
                                      </div>
                                    )}
                                    <div className="mt-1.5">
                                      <span className="inline-block px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs capitalize">
                                        {activity.category}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex space-x-1 flex-shrink-0">
                                    <button
                                      onClick={() => openActivityModal(day, slot.id, activity)}
                                      className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition"
                                      title="Edit"
                                    >
                                      <FiEdit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteActivity(day, slot.id, activity.id)}
                                      className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition"
                                      title="Delete"
                                    >
                                      <FiTrash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                            <button
                              onClick={() => openActivityModal(day, slot.id)}
                              className="w-full p-2 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 transition flex items-center justify-center space-x-1.5 font-medium"
                            >
                              <FiPlus className="w-3.5 h-3.5" />
                              <span>Add Activity</span>
                            </button>
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="border-0 p-12 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                          <FiClock className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400 font-medium mb-1">No time slots yet</p>
                          <p className="text-sm text-gray-500 dark:text-gray-500">Click "Add Time Slot" to get started!</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Time Slot Modal */}
        {showAddSlotModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Add Time Slot</h2>
              <form onSubmit={handleAddTimeSlot}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={newSlotStart}
                      onChange={(e) => setNewSlotStart(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={newSlotEnd}
                      onChange={(e) => setNewSlotEnd(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddSlotModal(false);
                      setNewSlotStart('06:00');
                      setNewSlotEnd('07:00');
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-sm"
                  >
                    Add Slot
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add/Edit Activity Modal */}
        {showActivityModal && selectedCell && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                {editingActivity ? 'Edit Activity' : 'Add Activity'}
              </h2>
              <form onSubmit={handleActivitySubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={activityForm.title}
                      onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Activity title"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={activityForm.description}
                      onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Optional description"
                      rows="3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category
                    </label>
                    <select
                      value={activityForm.category}
                      onChange={(e) => setActivityForm({ ...activityForm, category: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {categoryOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Color Tag
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {colorOptions.map(option => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setActivityForm({ ...activityForm, color: option.value })}
                          className={`p-3 rounded-md border-2 transition ${
                            activityForm.color === option.value
                              ? 'border-blue-600 ring-2 ring-blue-500'
                              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                          }`}
                        >
                          <div className={`w-full h-8 rounded ${option.class}`}></div>
                          <div className="text-xs mt-1 text-gray-700 dark:text-gray-300">{option.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => {
                      setShowActivityModal(false);
                      setSelectedCell(null);
                      setEditingActivity(null);
                      setActivityForm({ title: '', description: '', color: 'blue', category: 'other' });
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-sm"
                  >
                    {editingActivity ? 'Update' : 'Add'} Activity
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeeklyTimeBoard;

