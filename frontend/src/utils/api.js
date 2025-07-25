import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  validateToken: () => api.get('/auth/validate'),
};

export const coursesAPI = {
  getPublicCourses: () => api.get('/courses/public/all'),
  getCourse: (id) => api.get(`/courses/public/${id}`),
  searchCourses: (query) => api.get(`/courses/public/search?q=${query}`),
  filterCourses: (params) => api.get('/courses/public/filter', { params }),
  getCategories: () => api.get('/courses/public/categories'),
  getDifficulties: () => api.get('/courses/public/difficulties'),
  
  // Protected endpoints
  getAllCourses: () => api.get('/courses/all'),
  getCourseById: (id) => api.get(`/courses/${id}`),
  getMyCourses: () => api.get('/courses/my-courses'),
  createCourse: (courseData) => api.post('/courses', courseData),
  updateCourse: (id, courseData) => api.put(`/courses/${id}`, courseData),
  deleteCourse: (id) => api.delete(`/courses/${id}`),
  publishCourse: (id) => api.put(`/courses/${id}/publish`),
  unpublishCourse: (id) => api.put(`/courses/${id}/unpublish`),
};

export const lessonsAPI = {
  getLessonsByCourse: (courseId) => api.get(`/lessons/course/${courseId}`),
  getLesson: (id) => api.get(`/lessons/${id}`),
  searchLessons: (courseId, query) => api.get(`/lessons/course/${courseId}/search?q=${query}`),
  getNextLessons: (courseId, currentOrder) => api.get(`/lessons/course/${courseId}/next/${currentOrder}`),
  getPreviousLessons: (courseId, currentOrder) => api.get(`/lessons/course/${courseId}/previous/${currentOrder}`),
  getLessonByOrder: (courseId, order) => api.get(`/lessons/course/${courseId}/order/${order}`),
  
  // Teacher endpoints
  createLesson: (courseId, lessonData) => api.post(`/lessons/course/${courseId}`, lessonData),
  updateLesson: (id, lessonData) => api.put(`/lessons/${id}`, lessonData),
  deleteLesson: (id) => api.delete(`/lessons/${id}`),
  reorderLesson: (id, newOrder) => api.put(`/lessons/${id}/reorder?newOrder=${newOrder}`),
};

export const quizAPI = {
  getQuizzesByLesson: (lessonId) => api.get(`/quiz/lesson/${lessonId}`),
  getQuizzesByCourse: (courseId) => api.get(`/quiz/course/${courseId}`),
  getQuiz: (id) => api.get(`/quiz/${id}`),
  submitQuiz: (submission) => api.post('/quiz/submit', submission),
  getMyResults: () => api.get('/quiz/results/my'),
  getMyResultsByCourse: (courseId) => api.get(`/quiz/results/my/course/${courseId}`),
  getMyResult: (quizId) => api.get(`/quiz/results/${quizId}/my`),
  getMyStats: (courseId) => api.get(`/quiz/stats/my/course/${courseId}`),
  
  // Teacher endpoints
  createQuiz: (lessonId, quizData) => api.post(`/quiz/lesson/${lessonId}`, quizData),
  updateQuiz: (id, quizData) => api.put(`/quiz/${id}`, quizData),
  deleteQuiz: (id) => api.delete(`/quiz/${id}`),
  getCourseResults: (courseId) => api.get(`/quiz/results/course/${courseId}`),
};

export const progressAPI = {
  getMyProgress: () => api.get('/user/progress/my'),
  getMyProgressForCourse: (courseId) => api.get(`/user/progress/my/course/${courseId}`),
  getMyCompletedCourses: () => api.get('/user/progress/my/completed'),
  getMyInProgressCourses: () => api.get('/user/progress/my/in-progress'),
  enrollInCourse: (courseId) => api.post(`/user/progress/enroll/${courseId}`),
  unenrollFromCourse: (courseId) => api.delete(`/user/progress/unenroll/${courseId}`),
  saveLessonProgress: (progressData) => api.post('/user/progress/lesson/save', progressData),
  resetProgress: (courseId) => api.put(`/user/progress/reset/${courseId}`),
  getMyStats: () => api.get('/user/progress/my/stats'),
  
  // Teacher endpoints
  getCourseProgress: (courseId) => api.get(`/user/progress/course/${courseId}`),
  getCourseStats: (courseId) => api.get(`/user/progress/course/${courseId}/stats`),
  getHighPerformers: (minPercentage = 80) => api.get(`/user/progress/high-performers?minPercentage=${minPercentage}`),
};

// Offline-aware API wrapper
export const offlineAPI = {
  async request(apiCall, fallbackData = null, cacheKey = null) {
    try {
      // Try online request first
      const response = await apiCall();
      
      // Cache successful response if cacheKey provided
      if (cacheKey && 'caches' in window) {
        const cache = await caches.open('api-cache');
        cache.put(cacheKey, new Response(JSON.stringify(response.data)));
      }
      
      return { data: response.data, fromCache: false };
    } catch (error) {
      // If offline or request failed, try cache
      if (cacheKey && 'caches' in window) {
        try {
          const cache = await caches.open('api-cache');
          const cachedResponse = await cache.match(cacheKey);
          
          if (cachedResponse) {
            const data = await cachedResponse.json();
            return { data, fromCache: true };
          }
        } catch (cacheError) {
          console.error('Cache error:', cacheError);
        }
      }
      
      // Return fallback data if available
      if (fallbackData) {
        return { data: fallbackData, fromCache: true };
      }
      
      throw error;
    }
  },
};

export default api;
