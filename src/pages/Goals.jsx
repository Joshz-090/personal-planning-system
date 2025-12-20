import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useGoals } from "../hooks/useGoals";
import GoalCard from "../components/GoalCard";
import { FiPlus, FiX } from "react-icons/fi";

const Goals = () => {
  const { currentUser } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("month");
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalDescription, setNewGoalDescription] = useState("");
  const [editingGoal, setEditingGoal] = useState(null);

  const {
    goals,
    loading,
    addGoal,
    updateGoal,
    toggleChecklistItem,
    deleteGoal,
  } = useGoals(currentUser?.uid, selectedCategory);

  const categories = [
    { id: "month", label: "Monthly Goals" },
    { id: "quarter", label: "3-Month Goals" },
    { id: "half", label: "6-Month Goals" },
    { id: "year", label: "Yearly Goals" },
  ];

  const resetForm = () => {
    setEditingGoal(null);
    setNewGoalTitle("");
    setNewGoalDescription("");
  };

  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;

    const result = await addGoal({
      title: newGoalTitle.trim(),
      description: newGoalDescription.trim(),
      checklist: [],
    });

    if (result.success) {
      resetForm();
      setShowAddGoal(false);
    }
  };

  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
    setNewGoalTitle(goal.title);
    setNewGoalDescription(goal.description || "");
    setShowAddGoal(true);
  };

  const handleUpdateGoal = async (e) => {
    e.preventDefault();
    if (!editingGoal) return;

    const result = await updateGoal(editingGoal.id, {
      title: newGoalTitle.trim(),
      description: newGoalDescription.trim(),
    });

    if (result.success) {
      resetForm();
      setShowAddGoal(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-4">
      <div className="max-w-6xl mx-auto px-4 pb-16">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Long-Term Goals
          </h1>

          {/* Category Filter Tabs */}
          <div className="mt-4 flex space-x-3 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setShowAddGoal(false);
                  resetForm();
                }}
                className={`
                  px-5 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap
                  ${
                    selectedCategory === cat.id
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }
                `}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Add Goal Button */}
        <div className="flex justify-end mb-6">
          <button
            onClick={() => {
              resetForm();
              setShowAddGoal(true);
            }}
            className="flex items-center px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition shadow-md"
          >
            <FiPlus className="w-5 h-5 mr-2" />
            Add Goal
          </button>
        </div>

        {/* Add/Edit Form */}
        {showAddGoal && (
          <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingGoal ? "Edit Goal" : "New Goal"}
              </h3>
              <button
                onClick={() => {
                  setShowAddGoal(false);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={editingGoal ? handleUpdateGoal : handleAddGoal}>
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={newGoalTitle}
                    onChange={(e) => setNewGoalTitle(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="Goal title..."
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    value={newGoalDescription}
                    onChange={(e) => setNewGoalDescription(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe your goal..."
                  />
                </div>

                {/* Buttons */}
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddGoal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                  >
                    {editingGoal ? "Update Goal" : "Add Goal"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Goals List */}
        {loading ? (
          <div className="text-center py-16">
            <p className="text-gray-600 dark:text-gray-400 animate-pulse">
              Loading goals...
            </p>
          </div>
        ) : goals.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-md">
            <p className="text-gray-600 dark:text-gray-400">
              No goals yet in this category. Add one to get started!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onEdit={handleEditGoal}
                onDelete={deleteGoal}
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
