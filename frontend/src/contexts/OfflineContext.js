import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNetwork } from './NetworkContext';

const OfflineContext = createContext();

export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
};

export const OfflineProvider = ({ children }) => {
  const { isOnline } = useNetwork();
  const [db, setDb] = useState(null);
  const [pendingActions, setPendingActions] = useState([]);
  const [syncStatus, setSyncStatus] = useState('idle'); // idle, syncing, error

  // Initialize IndexedDB
  useEffect(() => {
    const initDB = async () => {
      try {
        const database = await openIndexedDB();
        setDb(database);
        
        // Load pending actions
        const pending = await getFromIndexedDB(database, 'pendingActions');
        setPendingActions(pending || []);
      } catch (error) {
        console.error('Failed to initialize offline database:', error);
      }
    };

    initDB();
  }, []);

  // Sync pending actions when back online
  useEffect(() => {
    if (isOnline && pendingActions.length > 0) {
      syncPendingActions();
    }
  }, [isOnline, pendingActions]);

  const openIndexedDB = () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('eLearningDB', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const database = event.target.result;
        
        // Create object stores
        const stores = [
          'courses', 'lessons', 'quizzes', 'userProgress',
          'pendingQuizSubmissions', 'pendingProgressUpdates', 'pendingActions'
        ];
        
        stores.forEach(storeName => {
          if (!database.objectStoreNames.contains(storeName)) {
            database.createObjectStore(storeName, { keyPath: 'id' });
          }
        });
      };
    });
  };

  const getFromIndexedDB = (database, storeName, key = null) => {
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      
      const request = key ? store.get(key) : store.getAll();
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  };

  const saveToIndexedDB = (database, storeName, data) => {
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      const request = Array.isArray(data) 
        ? Promise.all(data.map(item => store.put(item)))
        : store.put(data);
      
      transaction.onerror = () => reject(transaction.error);
      transaction.oncomplete = () => resolve();
    });
  };

  const removeFromIndexedDB = (database, storeName, key) => {
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  };

  // Cache data for offline use
  const cacheData = async (type, data) => {
    if (!db) return;
    
    try {
      await saveToIndexedDB(db, type, data);
      console.log(`Cached ${type} data for offline use`);
    } catch (error) {
      console.error(`Failed to cache ${type} data:`, error);
    }
  };

  // Get cached data
  const getCachedData = async (type, key = null) => {
    if (!db) return null;
    
    try {
      return await getFromIndexedDB(db, type, key);
    } catch (error) {
      console.error(`Failed to get cached ${type} data:`, error);
      return null;
    }
  };

  // Queue action for later sync
  const queueAction = async (action) => {
    if (!db) return;
    
    const actionWithId = {
      ...action,
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString()
    };
    
    try {
      await saveToIndexedDB(db, 'pendingActions', actionWithId);
      setPendingActions(prev => [...prev, actionWithId]);
      console.log('Action queued for sync:', action.type);
    } catch (error) {
      console.error('Failed to queue action:', error);
    }
  };

  // Sync pending actions
  const syncPendingActions = async () => {
    if (!isOnline || pendingActions.length === 0) return;
    
    setSyncStatus('syncing');
    
    try {
      for (const action of pendingActions) {
        await syncAction(action);
        await removeFromIndexedDB(db, 'pendingActions', action.id);
        setPendingActions(prev => prev.filter(a => a.id !== action.id));
      }
      
      setSyncStatus('idle');
      console.log('All pending actions synced successfully');
    } catch (error) {
      setSyncStatus('error');
      console.error('Failed to sync pending actions:', error);
    }
  };

  // Sync individual action
  const syncAction = async (action) => {
    const { type, data, endpoint, method = 'POST' } = action;
    
    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`Sync failed for ${type}: ${response.statusText}`);
      }
      
      console.log(`Synced ${type} successfully`);
    } catch (error) {
      console.error(`Failed to sync ${type}:`, error);
      throw error;
    }
  };

  // Submit quiz offline
  const submitQuizOffline = async (quizData) => {
    await queueAction({
      type: 'quiz-submission',
      endpoint: '/api/quiz/submit',
      method: 'POST',
      data: quizData
    });
  };

  // Update progress offline
  const updateProgressOffline = async (progressData) => {
    await queueAction({
      type: 'progress-update',
      endpoint: '/api/user/progress/lesson/save',
      method: 'POST',
      data: progressData
    });
  };

  // Preload content for offline use
  const preloadContent = async (courseId) => {
    if (!isOnline) return;
    
    try {
      // Preload course data
      const courseResponse = await fetch(`/api/courses/${courseId}`);
      if (courseResponse.ok) {
        const course = await courseResponse.json();
        await cacheData('courses', course);
      }
      
      // Preload lessons
      const lessonsResponse = await fetch(`/api/lessons/course/${courseId}`);
      if (lessonsResponse.ok) {
        const lessons = await lessonsResponse.json();
        await cacheData('lessons', lessons);
      }
      
      // Preload quizzes
      const quizzesResponse = await fetch(`/api/quiz/course/${courseId}`);
      if (quizzesResponse.ok) {
        const quizzes = await quizzesResponse.json();
        await cacheData('quizzes', quizzes);
      }
      
      console.log(`Preloaded content for course ${courseId}`);
    } catch (error) {
      console.error('Failed to preload content:', error);
    }
  };

  // Clear cached data
  const clearCache = async (type = null) => {
    if (!db) return;
    
    try {
      if (type) {
        const transaction = db.transaction([type], 'readwrite');
        const store = transaction.objectStore(type);
        await store.clear();
      } else {
        // Clear all caches
        const storeNames = ['courses', 'lessons', 'quizzes', 'userProgress'];
        for (const storeName of storeNames) {
          const transaction = db.transaction([storeName], 'readwrite');
          const store = transaction.objectStore(storeName);
          await store.clear();
        }
      }
      
      console.log(`Cleared ${type || 'all'} cache`);
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  };

  const value = {
    db,
    pendingActions,
    syncStatus,
    cacheData,
    getCachedData,
    queueAction,
    syncPendingActions,
    submitQuizOffline,
    updateProgressOffline,
    preloadContent,
    clearCache
  };

  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  );
};
