import { useState, useEffect } from 'react';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc
} from 'firebase/firestore';
import { db } from '../config/Firebase';

/**
 * Custom hook for managing daily tasks
 * Handles CRUD operations for daily tasks in Firestore
 */
export const useDailyTasks = (userId, date) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Format date as YYYY-MM-DD
  const dateString = date instanceof Date 
    ? date.toISOString().split('T')[0] 
    : date;

  // Load tasks from Firestore
  useEffect(() => {
    if (!userId || !dateString) {
      setLoading(false);
      return;
    }

    const loadTasks = async () => {
      try {
        setLoading(true);
        const dailyRef = doc(db, 'users', userId, 'daily', dateString);
        const dailyDoc = await getDoc(dailyRef);

        if (dailyDoc.exists()) {
          const data = dailyDoc.data();
          setTasks(data.tasks || []);
        } else {
          setTasks([]);
        }
        setError(null);
      } catch (err) {
        console.error('Error loading tasks:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, [userId, dateString]);

  // Add a new task
  const addTask = async (taskData) => {
    if (!userId || !dateString) return { success: false, error: 'Missing userId or date' };
    if (tasks.length >= 20) return { success: false, error: 'Maximum 20 tasks per day' };

    try {
      const newTask = {
        id: Date.now().toString(),
        title: taskData.title,
        note: taskData.note || '',
        completed: false,
        timestamp: new Date().toISOString()
      };

      const dailyRef = doc(db, 'users', userId, 'daily', dateString);
      const dailyDoc = await getDoc(dailyRef);
      
      const currentTasks = dailyDoc.exists() ? (dailyDoc.data().tasks || []) : [];
      const updatedTasks = [...currentTasks, newTask];

      await setDoc(dailyRef, {
        date: dateString,
        tasks: updatedTasks,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      setTasks(updatedTasks);
      return { success: true, task: newTask };
    } catch (err) {
      console.error('Error adding task:', err);
      return { success: false, error: err.message };
    }
  };

  // Update task
  const updateTask = async (taskId, updates) => {
    if (!userId || !dateString) return { success: false, error: 'Missing userId or date' };

    try {
      const dailyRef = doc(db, 'users', userId, 'daily', dateString);
      const dailyDoc = await getDoc(dailyRef);
      
      if (!dailyDoc.exists()) {
        return { success: false, error: 'Daily document not found' };
      }

      const currentTasks = dailyDoc.data().tasks || [];
      const updatedTasks = currentTasks.map(task =>
        task.id === taskId ? { ...task, ...updates } : task
      );

      await updateDoc(dailyRef, {
        tasks: updatedTasks,
        updatedAt: new Date().toISOString()
      });

      setTasks(updatedTasks);
      return { success: true };
    } catch (err) {
      console.error('Error updating task:', err);
      return { success: false, error: err.message };
    }
  };

  // Toggle task completion
  const toggleTask = async (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return { success: false, error: 'Task not found' };
    
    return await updateTask(taskId, { completed: !task.completed });
  };

  // Delete task
  const deleteTask = async (taskId) => {
    if (!userId || !dateString) return { success: false, error: 'Missing userId or date' };

    try {
      const dailyRef = doc(db, 'users', userId, 'daily', dateString);
      const dailyDoc = await getDoc(dailyRef);
      
      if (!dailyDoc.exists()) {
        return { success: false, error: 'Daily document not found' };
      }

      const currentTasks = dailyDoc.data().tasks || [];
      const filteredTasks = currentTasks.filter(task => task.id !== taskId);

      await updateDoc(dailyRef, {
        tasks: filteredTasks,
        updatedAt: new Date().toISOString()
      });

      setTasks(filteredTasks);
      return { success: true };
    } catch (err) {
      console.error('Error deleting task:', err);
      return { success: false, error: err.message };
    }
  };

  // Calculate daily progress
  const progress = tasks.length > 0 
    ? (tasks.filter(t => t.completed).length / tasks.length) * 100 
    : 0;

  return {
    tasks,
    loading,
    error,
    progress,
    addTask,
    updateTask,
    toggleTask,
    deleteTask
  };
};

