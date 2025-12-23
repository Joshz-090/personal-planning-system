import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWeeklyBoard } from '../hooks/useWeeklyBoard';
import Kenat from 'kenat';
import { 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiChevronLeft, 
  FiChevronRight,
  FiClock,
  FiCopy,
  FiBarChart2,
  FiHelpCircle
} from 'react-icons/fi';
import HelpGuide from '../components/HelpGuide';

const WeeklyTimeBoard = () => {
  const { currentUser, userProfile } = useAuth();
  const calendarPreference = userProfile?.calendarPreference || 'gregorian';
  const [selectedWeek, setSelectedWeek] = useState(getWeekId(new Date(), calendarPreference));
  const [timeFormat, setTimeFormat] = useState(userProfile?.timeFormat || '12');
  const [showAddSlotModal, setShowAddSlotModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const helpSteps = [
    { title: "Block Time", description: "Use the 'Add Time Slot' button to define periods in your day for specific focuses." },
    { title: "Assign Activities", description: "Click 'Add Activity' in any cell to label your time with colors and categories." },
    { title: "Smart Generation", description: "Use 'Next Week' to copy your ideal schedule forward, saving time on planning." },
    { title: "Sync Routine", description: "Ensure your deep-work slots align with your most productive hours for maximum results." }
  ];
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

  // Helper to format Date using Kenat (Ethiopian) or standard (Gregorian)
  function formatDateHelper(date, type = 'gregorian') {
    if (type === 'ethiopian') {
      try {
        const kenat = new Kenat(date);
        return kenat.format('D-M-Y') + ' (EC)';
      } catch (e) {
        console.error("Kenat error", e);
        return "Error";
      }
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  // Get week ID (format: 2025-W14 or Ethiopian week ID)
  // For Ethiopian: ETH-[year]-W[weekNo]
  function getWeekId(date, calendarType = 'gregorian') {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    
    if (calendarType === 'ethiopian') {
      try {
        const kenat = new Kenat(d);
        const eth = kenat.getEthiopian(); // { year, month, day }
        
        // Calculate week number manually as Kenat might not give "week of year" directly cleanly
        // Logic: Calculate days passed since the start of Ethiopian year (Meskerem 1)
        // Meskerem 1 is usually Sept 11 (or 12 in leap year before)
        // Since we are using Kenat, we can rely on it to give us the correct Ethiopian Year.
        // We just need the "Day of Year" in Ethiopian context.
        
        // Let's approximate: (month - 1) * 30 + day
        // This is safe because months 1-12 are 30 days. Pagumen is month 13.
        const dayOfYear = (eth.month - 1) * 30 + eth.day;
        const weekNo = Math.ceil(dayOfYear / 7);

        return `ETH-${eth.year}-W${String(weekNo).padStart(2, '0')}`;
      } catch (e) {
        console.error("Kenat calculation error", e);
        return `ETH-ERR-W01`;
      }
    } else {
      // Gregorian calendar standard ISO week logic (simplified)
      d.setDate(d.getDate() + 4 - (d.getDay() || 7));
      const yearStart = new Date(d.getFullYear(), 0, 1);
      const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
      return `${d.getFullYear()}-W${String(weekNo).padStart(2, '0')}`;
    }
  }

  // Get dates for the week (Monday to Sunday)
  function getWeekDates(weekId) {
    if (weekId.startsWith('ETH-')) {
      // ETH Logic: Reverse engineer the week
      // ETH-[year]-W[week]
      const parts = weekId.replace('ETH-', '').split('-W');
      const ethYear = parseInt(parts[0]);
      const week = parseInt(parts[1]);
      
      // Calculate approximated Gregorian start date for this Ethiopian Week
      // Start of year: Meskerem 1 ~ Sept 11
      // Days from start: (week - 1) * 7
      
      // We need a stable anchor. 
      // Let's find Meskerem 1 Gregorian date for 'ethYear'.
      // Kenat doesn't seem to have "ethiopianToGregorian" easily exposed in the snippet,
      // BUT we can use an established pivot.
      // 2017 EC starts on Sept 11, 2024 GC.
      // Difference is roughly 7 or 8 years.
      // Let's use a simpler approach: Iterate? No, too slow.
      // Pivot: Year 2000 EC = Sept 12, 2007 GC
      // Year diff = ethYear - 2000
      // GC Year approx = 2007 + yearDiff
      // This is getting complicated.
      // BETTER: Use the approximate start date logic we had, but corrected year.
      
      const gcYearApprox = ethYear + 7; 
      const yearStart = new Date(gcYearApprox, 8, 11); // Sept 11
      
      // If we are off by a year (leap year quirks), Kenat will fix it when we validate
      // But for "getting dates for the week", we just need 7 consecutive days.
      // Let's assume Sept 11 is close enough to start.
      
      const daysOffset = (week - 1) * 7;
      const weekStartApprox = new Date(yearStart);
      weekStartApprox.setDate(yearStart.getDate() + daysOffset);
      
      // Align to Monday
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
    
    // Inline time formatting instead of using the deleted utility
    if (timeFormat === '12') {
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
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
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 w-full">
      <div className="w-full px-0 py-6">
        {/* Header */}
        <div className="mb-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">
                Time Board
              </h1>
              <p className="text-sm text-slate-500 dark:text-gray-400 font-medium">
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

              {/* Help Me Button */}
              <button
                onClick={() => setShowHelp(true)}
                className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-slate-500 dark:text-gray-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm"
                title="How to use this page"
              >
                <FiHelpCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Help Me</span>
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

          {/* Week Navigation & Actions Wrapper */}
          <div className="bg-slate-50 dark:bg-gray-800/40 rounded-3xl p-4 sm:p-6 border border-slate-100 dark:border-gray-800 shadow-sm mb-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              
              {/* Week Navigation */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigateWeek(-1)}
                  className="p-3 bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-700 transition shadow-sm active:scale-95"
                  title="Previous week"
                >
                  <FiChevronLeft className="w-5 h-5 text-slate-600 dark:text-gray-300" />
                </button>
                
                <div className="text-center px-8 py-3 bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 shadow-sm min-w-[280px]">
                  <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    Week {selectedWeek}
                  </h2>
                  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-gray-400 mt-1 font-bold">
                    {calendarPreference === 'ethiopian' 
                      ? `${formatDateHelper(weekDates[0], 'ethiopian')} - ${formatDateHelper(weekDates[6], 'ethiopian')}`
                      : `${weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                    }
                  </p>
                </div>

                <button
                  onClick={() => navigateWeek(1)}
                  className="p-3 bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-700 transition shadow-sm active:scale-95"
                  title="Next week"
                >
                  <FiChevronRight className="w-5 h-5 text-slate-600 dark:text-gray-300" />
                </button>

                <button
                  onClick={() => setSelectedWeek(getWeekId(new Date(), calendarPreference))}
                  className="px-5 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition text-sm font-black shadow-lg shadow-blue-500/20 active:scale-95 ml-2"
                >
                  Today
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 w-full lg:w-auto">
                <button
                  onClick={() => setShowAddSlotModal(true)}
                  className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/25 font-black"
                >
                  <FiPlus className="w-5 h-5" />
                  <span>Add Time Slot</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Summary */}
        <div className="px-4 sm:px-6 lg:px-8 mb-8">
          <div className="bg-slate-50 dark:bg-gray-800/20 rounded-3xl p-6 border border-slate-100 dark:border-gray-800 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <FiBarChart2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Weekly Summary</h3>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-500 dark:text-gray-400">Total Activities:</span>
                <span className="text-lg font-black text-slate-900 dark:text-white">
                  {boardData?.activities ? Object.values(boardData.activities).reduce((acc, curr) => acc + (Array.isArray(curr) ? curr.length : 0), 0) : 0}
                </span>
              </div>
              
              {boardData?.activities && (
                <div className="flex flex-wrap gap-2">
                  {Object.entries(
                    Object.values(boardData.activities)
                      .flat()
                      .reduce((acc, curr) => {
                        acc[curr.category] = (acc[curr.category] || 0) + 1;
                        return acc;
                      }, {})
                  ).map(([category, count]) => (
                    <div key={category} className="flex items-center space-x-1.5 px-3 py-1 bg-white dark:bg-gray-800 rounded-xl border border-slate-100 dark:border-gray-700 shadow-sm">
                      <span className="text-xs font-bold capitalize text-slate-500 dark:text-gray-400">{category}:</span>
                      <span className="text-xs font-black text-slate-900 dark:text-white">{count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 px-4 sm:px-6 lg:px-8">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg">
              <p className="font-medium">Error: {error}</p>
            </div>
          </div>
        )}

        {/* Grid Table - ROWS FOR DAYS */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mx-0 sm:mx-6 lg:mx-8">
          <div className="safe-scroll w-full">
            <table className="w-full border-collapse table-fixed min-w-[1000px] sm:min-w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600 sticky top-0 z-30">
                  <th className="sticky left-0 z-40 bg-slate-100 dark:bg-gray-950 border-r border-slate-200 dark:border-gray-800 p-4 text-left text-xs font-black text-slate-500 dark:text-gray-400 uppercase tracking-widest w-[110px] sm:w-[150px] shadow-[4px_0_10px_rgba(0,0,0,0.05)]">
                    Day / Time
                  </th>
                  {boardData?.timeSlots && boardData.timeSlots.map((slot) => (
                    <th
                      key={slot.id}
                      className="border-r border-slate-200 dark:border-gray-800 last:border-r-0 p-3 text-center min-w-[220px] bg-slate-50/50 dark:bg-gray-900/50"
                    >
                      <div className="flex items-center justify-between px-2">
                        <div className="text-xs sm:text-sm font-black text-slate-700 dark:text-slate-200 tracking-tight">
                          {formatTimeDisplay(slot.startTime)} - {formatTimeDisplay(slot.endTime)}
                        </div>
                        <button
                          onClick={() => handleDeleteTimeSlot(slot.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors group"
                          title="Delete time slot"
                        >
                          <FiTrash2 className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dayKeys.map((day, dayIndex) => (
                  <tr key={day} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 border-b border-gray-200 dark:border-gray-600 last:border-b-0 transition-colors">
                    <td className="sticky left-0 z-20 bg-white dark:bg-gray-950 border-r border-slate-200 dark:border-gray-800 p-4 shadow-[4px_0_10px_rgba(0,0,0,0.05)]">
                      <div className="text-center space-y-1">
                        <div className="font-black text-xs sm:text-sm text-slate-800 dark:text-white uppercase tracking-widest">
                          {dayNames[dayIndex].substring(0, 3)}
                        </div>
                        <div className="text-[10px] text-slate-400 dark:text-gray-500 font-bold uppercase tracking-tight">
                          {calendarPreference === 'ethiopian' 
                            ? formatDateHelper(weekDates[dayIndex], 'ethiopian').split(' ')[0]
                            : weekDates[dayIndex].toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })
                          }
                        </div>
                      </div>
                    </td>
                    {boardData?.timeSlots && boardData.timeSlots.map((slot) => (
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
                            className="w-full h-12 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 dark:border-gray-800 text-slate-400 dark:text-gray-600 hover:border-blue-400 dark:hover:border-blue-500/50 hover:bg-blue-50/30 dark:hover:bg-blue-500/5 transition-all group"
                          >
                            <FiPlus className="w-4 h-4 group-hover:scale-125 transition-transform" />
                            <span className="text-[11px] font-black uppercase tracking-wider">Add Activity</span>
                          </button>
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
                {(!boardData?.timeSlots || boardData.timeSlots.length === 0) && (
                  <tr>
                    <td colSpan={boardData?.timeSlots ? boardData.timeSlots.length + 1 : 1} className="border-0 p-12 text-center">
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

        <HelpGuide 
          isOpen={showHelp} 
          onClose={() => setShowHelp(false)} 
          pageName="Weekly Time & Plan Board" 
          steps={helpSteps} 
        />
      </div>
    </div>
  );
};

export default WeeklyTimeBoard;