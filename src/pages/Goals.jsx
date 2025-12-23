import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useGoals } from "../hooks/useGoals";
import GoalCard from "../components/GoalCard";
import { FiPlus, FiX, FiHelpCircle } from "react-icons/fi";
import HelpGuide from "../components/HelpGuide";

const Goals = () => {
  const { currentUser } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("month");
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalDescription, setNewGoalDescription] = useState("");
  const [editingGoal, setEditingGoal] = useState(null);

  const helpSteps = [
    { title: "Set Categories", description: "Choose between Monthly, Quarterly, Half-Yearly or Yearly goal buckets." },
    { title: "Define Vision", description: "Add your big-picture objectives and brief descriptions." },
    { title: "Checklist Items", description: "Break down big goals into manageable sub-tasks inside each goal card." },
    { title: "Stay Focused", description: "Review your goals regularly to stay aligned with your long-term vision." }
  ];

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
    <div className="max-w-6xl mx-auto px-4 pb-12 pt-4 sm:pb-16">
        {/* Page Title */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Long-Term Goals
          </h1>

          {/* Category Filter Tabs */}
          <div className="mt-4 safe-scroll -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex space-x-1.5 sm:space-x-3 pb-2 min-w-max">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setShowAddGoal(false);
                    resetForm();
                  }}
                  className={`
                    px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap active:scale-95
                    ${
                      selectedCategory === cat.id
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                        : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-slate-100 dark:border-gray-800"
                    }
                  `}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col xs:flex-row justify-end mb-6 gap-3">
          <button
            onClick={() => setShowHelp(true)}
            className="flex items-center justify-center px-5 py-2.5 bg-white dark:bg-gray-800 text-slate-500 dark:text-gray-400 rounded-xl font-bold border border-gray-300 dark:border-gray-600 hover:bg-slate-50 dark:hover:bg-gray-700 transition shadow-sm active:scale-95"
          >
            <FiHelpCircle className="w-5 h-5 mr-2" />
            <span className="text-sm">Help Me</span>
          </button>
          <button
            onClick={() => {
              resetForm();
              setShowAddGoal(true);
            }}
            className="flex items-center justify-center px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-500/20 active:scale-95"
          >
            <FiPlus className="w-5 h-5 mr-2" />
            <span className="text-sm">Add Goal</span>
          </button>
        </div>

        {/* Add/Edit Form */}
        {showAddGoal && (
          <div className="mb-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-5 sm:p-6 animate-fadeIn border border-slate-100 dark:border-gray-800">
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

        <HelpGuide 
          isOpen={showHelp} 
          onClose={() => setShowHelp(false)} 
          pageName="Long-Term Goals" 
          steps={helpSteps} 
        />
    </div>
  );
};

export default Goals;
