import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useDailyTasks } from '../hooks/useDailyTasks';
import TaskCard from '../components/TaskCard';
import ProgressBar from '../components/ProgressBar';
import { FiPlus, FiX } from 'react-icons/fi';
import { formatDate, getCurrentDate } from '../utils/ethiopianCalendar';

const DailyPlanner = () => {
  const { currentUser, userProfile } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskNote, setNewTaskNote] = useState('');
  const [editingTask, setEditingTask] = useState(null);

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Daily Planner
          </h1>
          
          {/* Date Selector */}
          <div className="flex items-center space-x-4 mb-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Select Date:
            </label>
            <input
              type="date"
              value={dateString}
              onChange={handleDateChange}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {formattedDate}
            </span>
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
      </div>
    </div>
  );
};

export default DailyPlanner;

