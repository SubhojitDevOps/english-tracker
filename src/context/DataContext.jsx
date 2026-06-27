import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

const DataContext = createContext(null);

const STORAGE_KEY = 'english-tracker-data';

const getInitialData = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to parse stored data:', e);
  }
  return {
    studyLogs: [],
    vocabulary: [],
    goals: {
      dailyMinutes: 30,
      weeklyWords: 20,
      weeklyReading: 3,
    },
    reminders: {
      enabled: false,
      time: '19:00',
    },
    resources: [],
  };
};

export const DataProvider = ({ children }) => {
  const [data, setData] = useState(getInitialData);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [data, isLoaded]);

  const updateData = useCallback((updater) => {
    setData(prev => {
      const newData = typeof updater === 'function' ? updater(prev) : updater;
      return newData;
    });
  }, []);

  const studyLogActions = {
    addLog: (log) => updateData(prev => ({
      ...prev,
      studyLogs: [...prev.studyLogs, { ...log, id: uuidv4(), createdAt: new Date().toISOString() }]
    })),
    updateLog: (id, updates) => updateData(prev => ({
      ...prev,
      studyLogs: prev.studyLogs.map(log => log.id === id ? { ...log, ...updates } : log)
    })),
    deleteLog: (id) => updateData(prev => ({
      ...prev,
      studyLogs: prev.studyLogs.filter(log => log.id !== id)
    })),
    getByDate: (date) => data.studyLogs.find(log => log.date === date),
    getLogs: () => [...data.studyLogs].sort((a, b) => new Date(b.date) - new Date(a.date)),
    getLastDays: (days) => {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      return data.studyLogs
        .filter(log => new Date(log.date) >= cutoff)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    },
  };

  const vocabularyActions = {
    add: (word) => updateData(prev => ({
      ...prev,
      vocabulary: [...prev.vocabulary, { ...word, id: uuidv4(), createdAt: new Date().toISOString(), reviewCount: 0, lastReviewed: null, mastery: 0 }]
    })),
    update: (id, updates) => updateData(prev => ({
      ...prev,
      vocabulary: prev.vocabulary.map(w => w.id === id ? { ...w, ...updates } : w)
    })),
    delete: (id) => updateData(prev => ({
      ...prev,
      vocabulary: prev.vocabulary.filter(w => w.id !== id)
    })),
    getAll: () => [...data.vocabulary].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    getForReview: () => data.vocabulary
      .filter(w => w.mastery < 100)
      .sort((a, b) => (a.lastReviewed ? new Date(a.lastReviewed) : new Date(0)) - (b.lastReviewed ? new Date(b.lastReviewed) : new Date(0)))
      .slice(0, 20),
    markReviewed: (id, correct) => updateData(prev => ({
      ...prev,
      vocabulary: prev.vocabulary.map(w => {
        if (w.id !== id) return w;
        const newReviewCount = w.reviewCount + 1;
        const masteryGain = correct ? 15 : 5;
        const newMastery = Math.min(100, w.mastery + masteryGain);
        return {
          ...w,
          reviewCount: newReviewCount,
          lastReviewed: new Date().toISOString(),
          mastery: newMastery,
        };
      })
    })),
  };

  const goalsActions = {
    update: (goals) => updateData(prev => ({
      ...prev,
      goals: { ...prev.goals, ...goals }
    })),
  };

  const remindersActions = {
    update: (reminders) => updateData(prev => ({
      ...prev,
      reminders: { ...prev.reminders, ...reminders }
    })),
  };

  const resourcesActions = {
    add: (resource) => updateData(prev => ({
      ...prev,
      resources: [...prev.resources, { ...resource, id: uuidv4(), createdAt: new Date().toISOString() }]
    })),
    update: (id, updates) => updateData(prev => ({
      ...prev,
      resources: prev.resources.map(r => r.id === id ? { ...r, ...updates } : r)
    })),
    delete: (id) => updateData(prev => ({
      ...prev,
      resources: prev.resources.filter(r => r.id !== id)
    })),
    getAll: () => [...data.resources].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
  };

  const stats = {
    totalStudyDays: new Set(data.studyLogs.map(l => l.date)).size,
    totalMinutes: data.studyLogs.reduce((sum, l, log) => sum + (log.minutes || 0), 0),
    totalWordsLearned: data.vocabulary.filter(w => w.mastery >= 80).length,
    currentStreak: calculateStreak(data.studyLogs),
    longestStreak: calculateLongestStreak(data.studyLogs),
    wordsByCategory: data.vocabulary.reduce((acc, w) => {
      acc[w.category] = (acc[w.category] || 0) + 1;
      return acc;
    }, {}),
    studyByCategory: data.studyLogs.reduce((acc, log) => {
      log.categories?.forEach(cat => {
        acc[cat] = (acc[cat] || 0) + (log.minutes || 0);
      });
      return acc;
    }, {}),
  };

  return (
    <DataContext.Provider value={{
      data,
      isLoaded,
      studyLogActions,
      vocabularyActions,
      goalsActions,
      remindersActions,
      resourcesActions,
      stats,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

function calculateStreak(logs) {
  if (logs.length === 0) return 0;
  const dates = new Set(logs.map(l => l.date)).values();
  const sortedDates = Array.from(dates).sort().reverse();
  let streak = 0;
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  let checkDate = sortedDates[0] === today || sortedDates[0] === yesterday ? sortedDates[0] : null;
  if (!checkDate) return 0;
  
  for (const date of sortedDates) {
    if (date === checkDate) {
      streak++;
      const d = new Date(checkDate);
      d.setDate(d.getDate() - 1);
      checkDate = d.toISOString().split('T')[0];
    } else if (date < checkDate) {
      break;
    }
  }
  return streak;
}

function calculateLongestStreak(logs) {
  if (logs.length === 0) return 0;
  const dates = new Set(logs.map(l => l.date)).values();
  const sortedDates = Array.from(dates).sort();
  let longest = 0;
  let current = 1;
  
  for (let i = 1; i < sortedDates.length; i++) {
    const prev = new Date(sortedDates[i - 1]);
    const curr = new Date(sortedDates[i]);
    const diff = (curr - prev) / 86400000;
    if (diff === 1) {
      current++;
    } else {
      longest = Math.max(longest, current);
      current = 1;
    }
  }
  return Math.max(longest, current);
}