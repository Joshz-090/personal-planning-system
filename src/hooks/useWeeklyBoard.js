import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/Firebase';

/**
 * Custom hook for managing Weekly Time & Plan Board
 * Stores data in: users/{userId}/weeklyBoard/{weekId}
 */
export const useWeeklyBoard = (userId, weekId) => {
  const [boardData, setBoardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId || !weekId) {
      setLoading(false);
      return;
    }

    const loadBoardData = async () => {
      try {
        setLoading(true);
        const boardRef = doc(db, 'users', userId, 'weeklyBoard', weekId);
        const boardDoc = await getDoc(boardRef);

        if (boardDoc.exists()) {
          setBoardData(boardDoc.data());
        } else {
          // Initialize empty board and save to Firestore
          const initialData = {
            weekId,
            timeSlots: [],
            activities: {}, // { day_timeSlotId: [activities] }
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          // Save initial empty board to Firestore
          const boardRef = doc(db, 'users', userId, 'weeklyBoard', weekId);
          await setDoc(boardRef, initialData);
          
          setBoardData(initialData);
        }
        setError(null);
      } catch (err) {
        console.error('Error loading weekly board:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadBoardData();
  }, [userId, weekId]);

  // Helper function to parse time string to minutes for sorting
  const parseTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + (minutes || 0);
  };

  // Save board data to Firestore
  const saveBoardData = async (data) => {
      if (!userId || !weekId) return { success: false, error: 'Missing userId or weekId' };

      try {
        const boardRef = doc(db, 'users', userId, 'weeklyBoard', weekId);
        
        // Merge with existing boardData to preserve all fields
        const existingData = boardData || {};
        const mergedData = {
          ...existingData,
          ...data,
          weekId,
          updatedAt: new Date().toISOString()
        };
        
        // Preserve createdAt if it exists
        if (existingData.createdAt && !data.createdAt) {
          mergedData.createdAt = existingData.createdAt;
        } else if (!mergedData.createdAt) {
          mergedData.createdAt = new Date().toISOString();
        }
        
        await setDoc(boardRef, mergedData);

        setBoardData(mergedData);
        return { success: true };
      } catch (err) {
        console.error('Error saving board data:', err);
        return { success: false, error: err.message };
      }
    };

    // Add a new time slot
    const addTimeSlot = async (startTime, endTime) => {
      if (!boardData) return { success: false, error: 'Board not loaded' };

      const newSlot = {
        id: Date.now().toString(),
        startTime,
        endTime,
        createdAt: new Date().toISOString()
      };

      const updatedSlots = [...(boardData.timeSlots || []), newSlot];
      // Sort slots by start time
      updatedSlots.sort((a, b) => {
        const timeA = parseTime(a.startTime);
        const timeB = parseTime(b.startTime);
        return timeA - timeB;
      });

      const result = await saveBoardData({ timeSlots: updatedSlots });
      
      // Auto-generate future weeks if this is the first time slot being added
      if (result.success && (boardData.timeSlots || []).length === 0) {
        // Auto-generate next 8 weeks in the background
        autoGenerateFutureWeeks(weekId, 8).catch(err => {
          console.error('Error auto-generating future weeks:', err);
        });
      }
      
      return result;
    };

  // Update time slot
  const updateTimeSlot = async (slotId, updates) => {
      if (!boardData) return { success: false, error: 'Board not loaded' };

      const updatedSlots = (boardData.timeSlots || []).map(slot =>
        slot.id === slotId ? { ...slot, ...updates } : slot
      );

      // Re-sort after update
      updatedSlots.sort((a, b) => {
        const timeA = parseTime(a.startTime);
        const timeB = parseTime(b.startTime);
        return timeA - timeB;
      });

      return await saveBoardData({ timeSlots: updatedSlots });
    };

  // Delete time slot
  const deleteTimeSlot = async (slotId) => {
      if (!boardData) return { success: false, error: 'Board not loaded' };

      const updatedSlots = (boardData.timeSlots || []).filter(slot => slot.id !== slotId);
      const updatedActivities = { ...(boardData.activities || {}) };

      // Remove activities for this time slot from all days
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      days.forEach(day => {
        const key = `${day}_${slotId}`;
        delete updatedActivities[key];
      });

      return await saveBoardData({ 
        timeSlots: updatedSlots,
        activities: updatedActivities
      });
    };

  // Add activity to a cell (day + time slot)
  const addActivity = async (day, slotId, activityData) => {
      if (!boardData) return { success: false, error: 'Board not loaded' };

      const activityKey = `${day}_${slotId}`;
      const existingActivities = boardData.activities?.[activityKey] || [];

      const newActivity = {
        id: Date.now().toString(),
        title: activityData.title,
        description: activityData.description || '',
        color: activityData.color || 'blue',
        category: activityData.category || 'other',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const updatedActivities = {
        ...(boardData.activities || {}),
        [activityKey]: [...existingActivities, newActivity]
      };

      return await saveBoardData({ activities: updatedActivities });
    };

  // Update activity
  const updateActivity = async (day, slotId, activityId, updates) => {
      if (!boardData) return { success: false, error: 'Board not loaded' };

      const activityKey = `${day}_${slotId}`;
      const existingActivities = boardData.activities?.[activityKey] || [];

      const updatedActivitiesList = existingActivities.map(activity =>
        activity.id === activityId
          ? { ...activity, ...updates, updatedAt: new Date().toISOString() }
          : activity
      );

      const updatedActivities = {
        ...(boardData.activities || {}),
        [activityKey]: updatedActivitiesList
      };

      return await saveBoardData({ activities: updatedActivities });
    };

  // Delete activity
  const deleteActivity = async (day, slotId, activityId) => {
      if (!boardData) return { success: false, error: 'Board not loaded' };

      const activityKey = `${day}_${slotId}`;
      const existingActivities = boardData.activities?.[activityKey] || [];

      const filteredActivities = existingActivities.filter(
        activity => activity.id !== activityId
      );

      const updatedActivities = {
        ...(boardData.activities || {}),
        [activityKey]: filteredActivities
      };

      return await saveBoardData({ activities: updatedActivities });
    };

  // Move activity between cells
  const moveActivity = async (fromDay, fromSlotId, activityId, toDay, toSlotId) => {
      if (!boardData) return { success: false, error: 'Board not loaded' };

      const fromKey = `${fromDay}_${fromSlotId}`;
      const toKey = `${toDay}_${toSlotId}`;
      const fromActivities = boardData.activities?.[fromKey] || [];
      const toActivities = boardData.activities?.[toKey] || [];

      const activity = fromActivities.find(a => a.id === activityId);
      if (!activity) return { success: false, error: 'Activity not found' };

      const updatedFromActivities = fromActivities.filter(a => a.id !== activityId);
      const updatedToActivities = [...toActivities, { ...activity, updatedAt: new Date().toISOString() }];

      const updatedActivities = {
        ...(boardData.activities || {}),
        [fromKey]: updatedFromActivities,
        [toKey]: updatedToActivities
      };

      return await saveBoardData({ activities: updatedActivities });
    };

  // Copy previous week's template
  const copyFromPreviousWeek = async (previousWeekId, targetWeekId = null) => {
      if (!userId || !previousWeekId) return { success: false, error: 'Missing parameters' };

      try {
        const previousRef = doc(db, 'users', userId, 'weeklyBoard', previousWeekId);
        const previousDoc = await getDoc(previousRef);

        if (!previousDoc.exists()) {
          return { success: false, error: 'Previous week not found' };
        }

        const previousData = previousDoc.data();
        const targetWeek = targetWeekId || weekId;
        
        // Copy time slots and structure, but reset activities
        const newData = {
          weekId: targetWeek,
          timeSlots: previousData.timeSlots || [],
          activities: {}, // Start fresh
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        // Save to target week
        const targetRef = doc(db, 'users', userId, 'weeklyBoard', targetWeek);
        await setDoc(targetRef, newData);
        
        // Update local state if it's the current week
        if (targetWeek === weekId) {
          setBoardData(newData);
        }
        
        return { success: true };
      } catch (err) {
        console.error('Error copying from previous week:', err);
        return { success: false, error: err.message };
      }
    };

  // Auto-generate future weeks from a template week
  const autoGenerateFutureWeeks = async (templateWeekId, weeksAhead = 8) => {
    if (!userId || !templateWeekId) return { success: false, error: 'Missing parameters' };

    try {
      const templateRef = doc(db, 'users', userId, 'weeklyBoard', templateWeekId);
      const templateDoc = await getDoc(templateRef);

      if (!templateDoc.exists()) {
        return { success: false, error: 'Template week not found' };
      }

      const templateData = templateDoc.data();
      const timeSlots = templateData.timeSlots || [];

      // Only auto-generate if there are time slots
      if (timeSlots.length === 0) {
        return { success: true, message: 'No time slots to copy' };
      }

      // Parse template week ID
      const [year, week] = templateWeekId.split('-W').map(Number);
      const generatedWeeks = [];

      // Generate next N weeks
      for (let i = 1; i <= weeksAhead; i++) {
        let newWeek = week + i;
        let newYear = year;

        // Handle year rollover
        while (newWeek > 52) {
          newWeek -= 52;
          newYear++;
        }

        const newWeekId = `${newYear}-W${String(newWeek).padStart(2, '0')}`;
        
        // Check if week already exists
        const existingRef = doc(db, 'users', userId, 'weeklyBoard', newWeekId);
        const existingDoc = await getDoc(existingRef);

        // Only create if it doesn't exist or if it exists but has no time slots
        if (!existingDoc.exists() || (existingDoc.exists() && (!existingDoc.data().timeSlots || existingDoc.data().timeSlots.length === 0))) {
          const newData = {
            weekId: newWeekId,
            timeSlots: JSON.parse(JSON.stringify(timeSlots)), // Deep copy
            activities: {}, // Start fresh
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            autoGenerated: true,
            templateWeekId: templateWeekId
          };

          await setDoc(existingRef, newData);
          generatedWeeks.push(newWeekId);
        }
      }

      return { success: true, generatedWeeks };
    } catch (err) {
      console.error('Error auto-generating future weeks:', err);
      return { success: false, error: err.message };
    }
  };

  return {
    boardData,
    loading,
    error,
    saveBoardData,
    addTimeSlot,
    updateTimeSlot,
    deleteTimeSlot,
    addActivity,
    updateActivity,
    deleteActivity,
    moveActivity,
    copyFromPreviousWeek,
    autoGenerateFutureWeeks
  };
};

