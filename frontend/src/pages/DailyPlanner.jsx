import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useDailyTasks } from '../hooks/useDailyTasks';
import TaskCard from '../components/TaskCard';
import ProgressBar from '../components/ProgressBar';
import { FiPlus, FiX, FiChevronLeft, FiChevronRight, FiHelpCircle } from 'react-icons/fi';
import { formatDate, getCurrentDate } from '../utils/ethiopianCalendar';
import HelpGuide from '../components/HelpGuide';

const DailyPlanner = () => {
  const { currentUser, userProfile } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddTask, setShowAddTask] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskNote, setNewTaskNote] = useState('');
  const [editingTask, setEditingTask] = useState(null);

  const helpSteps = [
    { title: "Select Date", description: "Use the calendar navigation to pick which day you want to plan for." },
    { title: "Add Tasks", description: "Click the 'Add Task' button to list your goals for the day (up to 20 tasks)." },
    { title: "Track Progress", description: "Check off tasks as you complete them to see your daily progress bar grow." },
    { title: "Refine List", description: "Use the edit and delete icons to manage and update your daily priorities." }
  ];

  const dateString = selectedDate.toISOString().split('T')[0];
  const { tasks, loading, progress, addTask, toggleTask, updateTask, deleteTask } = useDailyTasks(
    currentUser?.uid,
    dateString
  );

  const calendarType = userProfile?.calendarPreference || 'gregorian';
  const formattedDate = formatDate(selectedDate, calendarType);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const result = await addTask({
      title: newTaskTitle.trim(),
      note: newTaskNote.trim()
    });

    if (result.success) {
      setNewTaskTitle('');
      setNewTaskNote('');
      setShowAddTask(false);
    }
  };

  const handleEditTask = async (task) => {
    setEditingTask(task);
    setNewTaskTitle(task.title);
    setNewTaskNote(task.note || '');
    setShowAddTask(true);
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !editingTask) return;

    const result = await updateTask(editingTask.id, {
      title: newTaskTitle.trim(),
      note: newTaskNote.trim()
    });

    if (result.success) {
      setEditingTask(null);
      setNewTaskTitle('');
      setNewTaskNote('');
      setShowAddTask(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteTask(taskId);
    }
  };

  const handleDateChange = (e) => {
    setSelectedDate(new Date(e.target.value));
    setShowAddTask(false);
    setEditingTask(null);
  };

  const canAddTask = tasks.length < 20;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Daily Planner
            </h1>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => setShowHelp(true)}
                className="p-2 sm:p-2.5 bg-white dark:bg-gray-800 text-slate-500 dark:text-gray-400 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-slate-50 dark:hover:bg-gray-700 transition shadow-sm flex items-center gap-2 active:scale-95"
                title="How to use this page"
              >
                <FiHelpCircle className="w-5 h-5" />
                <span className="text-xs sm:text-sm font-bold hidden xs:inline">Help</span>
              </button>
              <button
                onClick={() => setSelectedDate(new Date())}
                className="px-4 py-2 sm:py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition text-xs sm:text-sm font-bold shadow-md active:scale-95"
              >
                Today
              </button>
            </div>
          </div>
          
          {/* Date Selector */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-6">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <button
                onClick={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setDate(newDate.getDate() - 1);
                  setSelectedDate(newDate);
                }}
                className="p-2.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm active:scale-90"
              >
                <FiChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
              
              <input
                type="date"
                value={dateString}
                onChange={handleDateChange}
                className="px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
              />

              <button
                onClick={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setDate(newDate.getDate() + 1);
                  setSelectedDate(newDate);
                }}
                className="p-2.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm active:scale-90"
              >
                <FiChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
            </div>
            
            <div className="px-4 py-2.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl grow sm:grow-0 text-center">
              <span className="text-xs sm:text-sm font-bold text-blue-700 dark:text-blue-300 whitespace-nowrap">
                {formattedDate}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <ProgressBar 
              progress={progress} 
              label={`Daily Progress (${tasks.filter(t => t.completed).length}/${tasks.length} tasks completed)`}
            />
          </div>

          {/* Task Count */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {tasks.length}/20 tasks
            </p>
            {canAddTask && (
              <button
                onClick={() => {
                  setEditingTask(null);
                  setNewTaskTitle('');
                  setNewTaskNote('');
                  setShowAddTask(true);
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                <FiPlus className="w-5 h-5" />
                <span>Add Task</span>
              </button>
            )}
            {!canAddTask && (
              <p className="text-sm text-red-600 dark:text-red-400">
                Maximum 20 tasks reached
              </p>
            )}
          </div>
        </div>

        {/* Add/Edit Task Form */}
        {showAddTask && (
          <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingTask ? 'Edit Task' : 'New Task'}
              </h3>
              <button
                onClick={() => {
                  setShowAddTask(false);
                  setEditingTask(null);
                  setNewTaskTitle('');
                  setNewTaskNote('');
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={editingTask ? handleUpdateTask : handleAddTask}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter task title"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Note (optional)
                  </label>
                  <textarea
                    value={newTaskNote}
                    onChange={(e) => setNewTaskNote(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add a note..."
                    rows="3"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddTask(false);
                      setEditingTask(null);
                      setNewTaskTitle('');
                      setNewTaskNote('');
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                  >
                    {editingTask ? 'Update' : 'Add'} Task
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Tasks List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <p className="text-gray-600 dark:text-gray-400">No tasks for this day. Add one to get started!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={toggleTask}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
              />
            ))}
          </div>
        )}

        <HelpGuide 
          isOpen={showHelp} 
          onClose={() => setShowHelp(false)} 
          pageName="Daily Planner" 
          steps={helpSteps} 
        />
      </div>
  );
};

export default DailyPlanner;

