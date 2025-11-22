import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useGoals } from '../hooks/useGoals';
import GoalCard from '../components/GoalCard';
import { FiPlus, FiX } from 'react-icons/fi';

const Goals = () => {
  const { currentUser } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('month');
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalDescription, setNewGoalDescription] = useState('');
  const [editingGoal, setEditingGoal] = useState(null);

  const { goals, loading, addGoal, updateGoal, toggleChecklistItem, deleteGoal } = useGoals(
    currentUser?.uid,
    selectedCategory
  );

  const categories = [
    { id: 'month', label: 'Monthly Goals' },
    { id: 'quarter', label: '3-Month Goals' },
    { id: 'half', label: '6-Month Goals' },
    { id: 'year', label: 'Yearly Goals' }
  ];

  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;

    const result = await addGoal({
      title: newGoalTitle.trim(),
      description: newGoalDescription.trim(),
      checklist: []
    });

    if (result.success) {
      setNewGoalTitle('');
      setNewGoalDescription('');
      setShowAddGoal(false);
    }
  };

  const handleEditGoal = async (goal) => {
    setEditingGoal(goal);
    setNewGoalTitle(goal.title);
    setNewGoalDescription(goal.description || '');
    setShowAddGoal(true);
  };

  const handleUpdateGoal = async (e) => {
    e.preventDefault();
    if (!newGoalTitle.trim() || !editingGoal) return;

    const result = await updateGoal(editingGoal.id, {
      title: newGoalTitle.trim(),
      description: newGoalDescription.trim()
    });

    if (result.success) {
      setEditingGoal(null);
      setNewGoalTitle('');
      setNewGoalDescription('');
      setShowAddGoal(false);
    }
  };

  const handleDeleteGoal = async (goalId) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      await deleteGoal(goalId);
    }
  };

  const handleAddChecklistItem = async (goalId, itemText) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const checklist = goal.checklist || [];
    const newItem = {
      text: itemText,
      completed: false
    };

    await updateGoal(goalId, {
      checklist: [...checklist, newItem]
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Long-Term Goals
          </h1>

          {/* Category Tabs */}
          <div className="flex space-x-2 mb-6">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  setSelectedCategory(category.id);
                  setShowAddGoal(false);
                  setEditingGoal(null);
                }}
                className={`px-6 py-2 rounded-md font-medium transition ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>

          {/* Add Goal Button */}
          <div className="flex justify-end mb-4">
            <button
              onClick={() => {
                setEditingGoal(null);
                setNewGoalTitle('');
                setNewGoalDescription('');
                setShowAddGoal(true);
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              <FiPlus className="w-5 h-5" />
              <span>Add Goal</span>
            </button>
          </div>
        </div>

        {/* Add/Edit Goal Form */}
        {showAddGoal && (
          <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingGoal ? 'Edit Goal' : 'New Goal'}
              </h3>
              <button
                onClick={() => {
                  setShowAddGoal(false);
                  setEditingGoal(null);
                  setNewGoalTitle('');
                  setNewGoalDescription('');
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={editingGoal ? handleUpdateGoal : handleAddGoal}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={newGoalTitle}
                    onChange={(e) => setNewGoalTitle(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter goal title"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newGoalDescription}
                    onChange={(e) => setNewGoalDescription(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe your goal..."
                    rows="4"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddGoal(false);
                      setEditingGoal(null);
                      setNewGoalTitle('');
                      setNewGoalDescription('');
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                  >
                    {editingGoal ? 'Update' : 'Add'} Goal
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Goals List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Loading goals...</p>
          </div>
        ) : goals.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <p className="text-gray-600 dark:text-gray-400">
              No {categories.find(c => c.id === selectedCategory)?.label.toLowerCase()} yet. Add one to get started!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onEdit={handleEditGoal}
                onDelete={handleDeleteGoal}
                onToggleChecklist={toggleChecklistItem}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Goals;

