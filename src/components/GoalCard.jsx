import { FiEdit2, FiTrash2, FiCheckCircle } from 'react-icons/fi';
import ProgressBar from './ProgressBar';

/**
 * GoalCard Component
 * Displays a goal with checklist and progress
 */
const GoalCard = ({ goal, onEdit, onDelete, onToggleChecklist }) => {
  const completedItems = goal.checklist?.filter(item => item.completed).length || 0;
  const totalItems = goal.checklist?.length || 0;
  const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {goal.title}
          </h3>
          {goal.description && (
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              {goal.description}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={() => onEdit(goal)}
            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition"
            title="Edit goal"
          >
            <FiEdit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(goal.id)}
            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition"
            title="Delete goal"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <ProgressBar progress={progress} showPercentage={true} />
      </div>

      {/* Checklist */}
      {goal.checklist && goal.checklist.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Checklist ({completedItems}/{totalItems})
          </h4>
          {goal.checklist.map((item, index) => (
            <div
              key={index}
              className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer"
              onClick={() => onToggleChecklist(goal.id, index)}
            >
              {item.completed ? (
                <FiCheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              ) : (
                <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-full flex-shrink-0" />
              )}
              <span className={`text-sm ${
                item.completed 
                  ? 'line-through text-gray-500 dark:text-gray-400' 
                  : 'text-gray-700 dark:text-gray-300'
              }`}>
                {item.text}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GoalCard;

