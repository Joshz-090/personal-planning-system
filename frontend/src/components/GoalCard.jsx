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
    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm p-4 sm:p-6 border border-slate-100 dark:border-gray-800 hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mb-1.5 truncate">
            {goal.title}
          </h3>
          {goal.description && (
            <p className="text-slate-500 dark:text-gray-400 text-xs sm:text-sm leading-relaxed line-clamp-2">
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
        <div className="space-y-1.5 sm:space-y-2">
          <h4 className="text-xs sm:text-sm font-black text-slate-400 dark:text-gray-500 mb-2 uppercase tracking-widest">
            Checklist ({completedItems}/{totalItems})
          </h4>
          {goal.checklist.map((item, index) => (
            <div
              key={index}
              className="flex items-center space-x-2.5 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-gray-700/50 transition cursor-pointer active:scale-[0.98]"
              onClick={() => onToggleChecklist(goal.id, index)}
            >
              {item.completed ? (
                <FiCheckCircle className="w-4 h-4 sm:w-5 h-5 text-green-500 flex-shrink-0" />
              ) : (
                <div className="w-4 h-4 sm:w-5 h-5 border-2 border-slate-200 dark:border-gray-600 rounded-full flex-shrink-0" />
              )}
              <span className={`text-xs sm:text-sm font-medium ${
                item.completed 
                  ? 'line-through text-slate-400 dark:text-gray-500' 
                  : 'text-slate-700 dark:text-gray-300'
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

