import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/Firebase';

/**
 * Custom hook for managing weekly planner data
 */
export const useWeeklyPlanner = (userId, weekId) => {
  const [weeklyData, setWeeklyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId || !weekId) {
      setLoading(false);
      return;
    }

    const loadWeeklyData = async () => {
      try {
        setLoading(true);
        const weeklyRef = doc(db, 'users', userId, 'weekly', weekId);
        const weeklyDoc = await getDoc(weeklyRef);

        if (weeklyDoc.exists()) {
          setWeeklyData(weeklyDoc.data());
        } else {
          setWeeklyData({
            weekId,
            goals: [],
            dailyProgress: {}
          });
        }
        setError(null);
      } catch (err) {
        console.error('Error loading weekly data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadWeeklyData();
  }, [userId, weekId]);

  // Save weekly data
  const saveWeeklyData = async (data) => {
    if (!userId || !weekId) return { success: false, error: 'Missing userId or weekId' };

    try {
      const weeklyRef = doc(db, 'users', userId, 'weekly', weekId);
      await setDoc(weeklyRef, {
        ...data,
        weekId,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      setWeeklyData(prev => ({ ...prev, ...data }));
      return { success: true };
    } catch (err) {
      console.error('Error saving weekly data:', err);
      return { success: false, error: err.message };
    }
  };

  // Add weekly goal
  const addGoal = async (goal) => {
    const goals = weeklyData?.goals || [];
    const newGoal = {
      id: Date.now().toString(),
      text: goal,
      createdAt: new Date().toISOString()
    };

    return await saveWeeklyData({
      goals: [...goals, newGoal]
    });
  };

  // Calculate weekly progress from daily progress
  const calculateWeeklyProgress = (dailyProgress) => {
    const days = Object.values(dailyProgress);
    if (days.length === 0) return 0;
    
    const sum = days.reduce((acc, val) => acc + (val || 0), 0);
    return sum / days.length;
  };

  const weeklyProgress = weeklyData?.dailyProgress 
    ? calculateWeeklyProgress(weeklyData.dailyProgress)
    : 0;

  return {
    weeklyData,
    loading,
    error,
    weeklyProgress,
    saveWeeklyData,
    addGoal
  };
};

