import { useState, useEffect } from "react";
import { FiClock, FiCheck, FiPlay, FiAlertCircle } from "react-icons/fi";

const QuickPlanWidget = () => {
  const [task, setTask] = useState("");
  const [hours, setHours] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState("idle"); // idle, running, completed, failed
  const [message, setMessage] = useState("");
  const [isVisible, setIsVisible] = useState(true);

  const startPlan = () => {
    if (!task || !hours) return;
    setIsActive(true);
    setStatus("running");
    setMessage(`Focus mode on! You have ${hours} hours to complete: "${task}".`);
    
    // Simulate timer or just set start time in local storage for persistence
    // For now, we'll keep it simple state-based as verified by user request
  };

  const completePlan = () => {
    setIsActive(false);
    setStatus("completed");
    setMessage("Great job! You crushed it. Discipline is the bridge between goals and accomplishment.");
  };

  const failedPlan = () => {
    setIsActive(false);
    setStatus("failed");
    setMessage("Time is the one resource you can't get back. Use it wisely next time.");
  };

  if (!isVisible) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8 relative overflow-hidden transition-all">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <FiClock className="text-blue-600" />
          Quick Focus Plan
        </h3>
        
        {/* Only show close if idle */}
        {status === 'idle' && (
             <button onClick={() => setIsVisible(false)} className="text-gray-400 hover:text-gray-500 text-sm">Dismiss</button>
        )}
      </div>

      {status === "idle" && (
        <div className="flex flex-col gap-4">
          <input
            type="text"
            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="What needs to be done right now?"
            value={task}
            onChange={(e) => setTask(e.target.value)}
          />
          <div className="flex gap-4">
            <input
              type="number"
              className="w-24 p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Hours"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              min="0.5"
              step="0.5"
            />
            <button
              onClick={startPlan}
              disabled={!task || !hours}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start Mission <FiPlay />
            </button>
          </div>
        </div>
      )}

      {status === "running" && (
        <div className="text-center py-6 animate-pulse">
          <p className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">
            {task}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Allocated: {hours} hours
          </p>
          
          <div className="flex justify-center gap-4">
            <button
              onClick={completePlan}
              className="px-6 py-2 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded-full font-medium hover:bg-green-200 transition flex items-center gap-2"
            >
              <FiCheck /> Done
            </button>
            <button
               // In a real app this would be triggered by timer end, but for manual usage:
              onClick={failedPlan}
              className="px-6 py-2 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 rounded-full font-medium hover:bg-red-200 transition flex items-center gap-2"
            >
               <FiAlertCircle /> Failed
            </button>
          </div>
        </div>
      )}

      {(status === "completed" || status === "failed") && (
        <div className="text-center py-4 animate-fadeIn">
          <p className={`text-lg font-medium mb-4 ${status === 'completed' ? 'text-green-600' : 'text-red-500'}`}>
            {message}
          </p>
          <button
            onClick={() => {
                setStatus("idle");
                setTask("");
                setHours("");
            }}
            className="text-sm text-gray-500 underline hover:text-gray-700"
          >
            Start Another
          </button>
        </div>
      )}
    </div>
  );
};

export default QuickPlanWidget;
