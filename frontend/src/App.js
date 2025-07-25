import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Context
import { AuthProvider } from './contexts/AuthContext';
import { NetworkProvider } from './contexts/NetworkContext';
import { OfflineProvider } from './contexts/OfflineContext';
import { NotificationProvider } from './contexts/NotificationContext';

// Components
import Navbar from './components/Layout/Navbar';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import LoadingSpinner from './components/UI/LoadingSpinner';
import NotificationContainer from './components/UI/NotificationContainer';

// Pages
import Home from './pages/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import StudentDashboard from './pages/Student/Dashboard';
import TeacherDashboard from './pages/Teacher/Dashboard';
import Courses from './pages/Courses/Courses';
import CourseDetail from './pages/Courses/CourseDetail';
import LessonView from './pages/Lessons/LessonView';
import QuizView from './pages/Quiz/QuizView';
import Profile from './pages/Profile/Profile';
import NotFound from './pages/NotFound';

// Hooks
import { useAuth } from './hooks/useAuth';
import { useNetwork } from './hooks/useNetwork';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize app
    const initializeApp = async () => {
      try {
        // Check for existing authentication
        const token = localStorage.getItem('token');
        if (token) {
          // Validate token with backend
          // This will be handled by AuthContext
        }
        
        // Initialize offline storage
        await initializeOfflineStorage();
        
        // Preload essential data
        await preloadEssentialData();
        
      } catch (error) {
        console.error('App initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  const initializeOfflineStorage = async () => {
    try {
      // Initialize IndexedDB for offline storage
      const request = indexedDB.open('eLearningDB', 1);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object stores for offline data
        if (!db.objectStoreNames.contains('courses')) {
          db.createObjectStore('courses', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('lessons')) {
          db.createObjectStore('lessons', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('quizzes')) {
          db.createObjectStore('quizzes', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('userProgress')) {
          db.createObjectStore('userProgress', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('pendingQuizSubmissions')) {
          db.createObjectStore('pendingQuizSubmissions', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('pendingProgressUpdates')) {
          db.createObjectStore('pendingProgressUpdates', { keyPath: 'id' });
        }
      };
      
      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to initialize offline storage:', error);
    }
  };

  const preloadEssentialData = async () => {
    try {
      // Preload public courses data for offline access
      if (navigator.onLine) {
        const response = await fetch('/api/courses/public/all');
        if (response.ok) {
          const courses = await response.json();
          // Store in IndexedDB for offline access
          await storeInIndexedDB('courses', courses);
        }
      }
    } catch (error) {
      console.error('Failed to preload essential data:', error);
    }
  };

  const storeInIndexedDB = async (storeName, data) => {
    try {
      const request = indexedDB.open('eLearningDB', 1);
      
      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        
        if (Array.isArray(data)) {
          data.forEach(item => store.put(item));
        } else {
          store.put(data);
        }
      };
    } catch (error) {
      console.error('Failed to store data in IndexedDB:', error);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="App">
      <NetworkProvider>
        <OfflineProvider>
          <NotificationProvider>
            <AuthProvider>
              <Router>
                <div className="app-container">
                  <Navbar />
                  <NotificationContainer />
                  <main className="main-content">
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/courses" element={<Courses />} />
                    <Route path="/courses/:id" element={<CourseDetail />} />
                    
                    {/* Protected Routes */}
                    <Route path="/dashboard" element={
                      <ProtectedRoute>
                        <DashboardRouter />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/lesson/:id" element={
                      <ProtectedRoute>
                        <LessonView />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/quiz/:id" element={
                      <ProtectedRoute>
                        <QuizView />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/profile" element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    } />
                    
                    {/* 404 Route */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </div>
            </Router>
          </AuthProvider>
        </NotificationProvider>
        </OfflineProvider>
      </NetworkProvider>
    </div>
  );
}

// Dashboard Router Component
const DashboardRouter = () => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return user.roles?.includes('ROLE_TEACHER') ? <TeacherDashboard /> : <StudentDashboard />;
};

export default App;
