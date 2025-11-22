import { useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where
} from 'firebase/firestore';
import { db } from '../config/Firebase';

/**
 * Custom hook for managing goals (Monthly, 3-month, 6-month, Yearly)
 */
export const useGoals = (userId, category) => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId || !category) {
      setLoading(false);
      return;
    }

    const loadGoals = async () => {
      try {
        setLoading(true);
        const goalsRef = collection(db, 'users', userId, 'goals');
        const q = query(goalsRef, where('category', '==', category));
        const goalsSnapshot = await getDocs(q);

        const goalsList = [];
        goalsSnapshot.forEach((doc) => {
          goalsList.push({ id: doc.id, ...doc.data() });
        });

        setGoals(goalsList);
        setError(null);
      } catch (err) {
        console.error('Error loading goals:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadGoals();
  }, [userId, category]);

  // Add a new goal
  const addGoal = async (goalData) => {
    if (!userId || !category) return { success: false, error: 'Missing userId or category' };

    try {
      const goalId = Date.now().toString();
      const newGoal = {
        title: goalData.title,
        description: goalData.description || '',
        checklist: goalData.checklist || [],
        category: category,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const goalRef = doc(db, 'users', userId, 'goals', goalId);
      await setDoc(goalRef, newGoal);

      setGoals(prev => [...prev, { id: goalId, ...newGoal }]);
      return { success: true, goalId };
    } catch (err) {
      console.error('Error adding goal:', err);
      return { success: false, error: err.message };
    }
  };

  // Update goal
  const updateGoal = async (goalId, updates) => {
    if (!userId || !category) return { success: false, error: 'Missing userId or category' };

    try {
      const goalRef = doc(db, 'users', userId, 'goals', goalId);
      await updateDoc(goalRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });

      setGoals(prev => prev.map(goal =>
        goal.id === goalId ? { ...goal, ...updates } : goal
      ));
      return { success: true };
    } catch (err) {
      console.error('Error updating goal:', err);
      return { success: false, error: err.message };
    }
  };

  // Toggle checklist item
  const toggleChecklistItem = async (goalId, itemIndex) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return { success: false, error: 'Goal not found' };

    const checklist = goal.checklist || [];
    const updatedChecklist = checklist.map((item, index) =>
      index === itemIndex ? { ...item, completed: !item.completed } : item
    );

    return await updateGoal(goalId, { checklist: updatedChecklist });
  };

  // Delete goal
  const deleteGoal = async (goalId) => {
    if (!userId || !category) return { success: false, error: 'Missing userId or category' };

    try {
      const goalRef = doc(db, 'users', userId, 'goals', goalId);
      await deleteDoc(goalRef);

      setGoals(prev => prev.filter(goal => goal.id !== goalId));
      return { success: true };
    } catch (err) {
      console.error('Error deleting goal:', err);
      return { success: false, error: err.message };
    }
  };

  return {
    goals,
    loading,
    error,
    addGoal,
    updateGoal,
    toggleChecklistItem,
    deleteGoal
  };
};

