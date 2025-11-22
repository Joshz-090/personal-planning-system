import { FiEdit2, FiTrash2, FiCheckCircle, FiCircle } from 'react-icons/fi';

/**
 * TaskCard Component
 * Displays a single task with checkbox, title, note, and actions
 */
const TaskCard = ({ task, onToggle, onEdit, onDelete, disabled = false }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border-l-4 ${
      task.completed 
        ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
        : 'border-gray-300 dark:border-gray-600'
    } transition-all hover:shadow-lg`}>
      <div className="flex items-start space-x-3">
        {/* Checkbox */}
        <button
          onClick={() => !disabled && onToggle(task.id)}
          disabled={disabled}
          className={`mt-1 flex-shrink-0 ${
            disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-110'
          } transition-transform`}
        >
          {task.completed ? (
            <FiCheckCircle className="w-6 h-6 text-green-500" />
          ) : (
            <FiCircle className="w-6 h-6 text-gray-400" />
          )}
        </button>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <h3 className={`text-lg font-semibold ${
            task.completed 
              ? 'line-through text-gray-500 dark:text-gray-400' 
              : 'text-gray-900 dark:text-white'
          }`}>
            {task.title}
          </h3>
          {task.note && (
            <p className={`mt-1 text-sm ${
              task.completed 
                ? 'text-gray-400 dark:text-gray-500' 
                : 'text-gray-600 dark:text-gray-300'
            }`}>
              {task.note}
            </p>
          )}
          {task.timestamp && (
            <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
              Created: {new Date(task.timestamp).toLocaleString()}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        {!disabled && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onEdit(task)}
              className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition"
              title="Edit task"
            >
              <FiEdit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition"
              title="Delete task"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;

