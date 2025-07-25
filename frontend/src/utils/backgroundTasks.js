// Background Tasks API for preloading content during idle time

class BackgroundTaskManager {
  constructor() {
    this.tasks = [];
    this.isRunning = false;
    this.idleCallback = null;
    this.networkMonitor = null;
    
    this.init();
  }

  init() {
    // Use requestIdleCallback for background tasks
    if ('requestIdleCallback' in window) {
      this.scheduleIdleTasks();
    }
    
    // Monitor network changes
    this.setupNetworkMonitoring();
    
    // Setup visibility change listener
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseTasks();
      } else {
        this.resumeTasks();
      }
    });
  }

  scheduleIdleTasks() {
    const runTasks = (deadline) => {
      while (deadline.timeRemaining() > 0 && this.tasks.length > 0) {
        const task = this.tasks.shift();
        try {
          task();
        } catch (error) {
          console.error('Background task error:', error);
        }
      }
      
      // Schedule next idle callback
      if (this.tasks.length > 0) {
        this.idleCallback = requestIdleCallback(runTasks);
      } else {
        this.isRunning = false;
      }
    };

    if (!this.isRunning && this.tasks.length > 0) {
      this.isRunning = true;
      this.idleCallback = requestIdleCallback(runTasks);
    }
  }

  setupNetworkMonitoring() {
    // Monitor network connection
    window.addEventListener('online', () => {
      console.log('Network: Back online, resuming background tasks');
      this.resumeTasks();
    });

    window.addEventListener('offline', () => {
      console.log('Network: Gone offline, pausing background tasks');
      this.pauseTasks();
    });

    // Monitor connection quality changes
    if ('connection' in navigator) {
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (connection) {
        connection.addEventListener('change', () => {
          this.adjustTaskPriority();
        });
      }
    }
  }

  addTask(task, priority = 'normal') {
    const taskWrapper = {
      execute: task,
      priority,
      timestamp: Date.now()
    };

    // Insert task based on priority
    if (priority === 'high') {
      this.tasks.unshift(taskWrapper.execute);
    } else {
      this.tasks.push(taskWrapper.execute);
    }

    // Start processing if not already running
    this.scheduleIdleTasks();
  }

  pauseTasks() {
    if (this.idleCallback) {
      cancelIdleCallback(this.idleCallback);
      this.idleCallback = null;
    }
    this.isRunning = false;
  }

  resumeTasks() {
    if (this.tasks.length > 0 && !this.isRunning) {
      this.scheduleIdleTasks();
    }
  }

  adjustTaskPriority() {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!connection) return;

    // Adjust task execution based on connection quality
    if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
      // Pause heavy tasks on slow connections
      this.pauseTasks();
    } else if (connection.effectiveType === '3g' || connection.effectiveType === '4g') {
      // Resume tasks on better connections
      this.resumeTasks();
    }
  }

  clearTasks() {
    this.tasks = [];
    this.pauseTasks();
  }
}

// Create global instance
const backgroundTaskManager = new BackgroundTaskManager();

// Preloading functions
export const preloadCourseContent = async (courseId) => {
  backgroundTaskManager.addTask(async () => {
    try {
      console.log(`Preloading content for course ${courseId}`);
      
      // Preload course data
      const courseResponse = await fetch(`/api/courses/${courseId}`);
      if (courseResponse.ok) {
        const course = await courseResponse.json();
        await cacheInIndexedDB('courses', course);
      }

      // Preload lessons
      const lessonsResponse = await fetch(`/api/lessons/course/${courseId}`);
      if (lessonsResponse.ok) {
        const lessons = await lessonsResponse.json();
        await cacheInIndexedDB('lessons', lessons);
      }

      // Preload quizzes
      const quizzesResponse = await fetch(`/api/quiz/course/${courseId}`);
      if (quizzesResponse.ok) {
        const quizzes = await quizzesResponse.json();
        await cacheInIndexedDB('quizzes', quizzes);
      }

      console.log(`Successfully preloaded content for course ${courseId}`);
    } catch (error) {
      console.error(`Failed to preload course ${courseId}:`, error);
    }
  }, 'normal');
};

export const preloadUserProgress = async (userId) => {
  backgroundTaskManager.addTask(async () => {
    try {
      console.log(`Preloading progress for user ${userId}`);
      
      const progressResponse = await fetch('/api/user/progress/my');
      if (progressResponse.ok) {
        const progress = await progressResponse.json();
        await cacheInIndexedDB('userProgress', progress);
      }

      console.log(`Successfully preloaded progress for user ${userId}`);
    } catch (error) {
      console.error(`Failed to preload user progress:`, error);
    }
  }, 'low');
};

export const preloadImages = (imageUrls) => {
  imageUrls.forEach(url => {
    backgroundTaskManager.addTask(() => {
      const img = new Image();
      img.onload = () => console.log(`Preloaded image: ${url}`);
      img.onerror = () => console.error(`Failed to preload image: ${url}`);
      img.src = url;
    }, 'low');
  });
};

export const preloadEssentialData = () => {
  backgroundTaskManager.addTask(async () => {
    try {
      console.log('Preloading essential data');
      
      // Preload public courses
      const coursesResponse = await fetch('/api/courses/public/all');
      if (coursesResponse.ok) {
        const courses = await coursesResponse.json();
        await cacheInIndexedDB('courses', courses);
      }

      // Preload categories and difficulties
      const [categoriesResponse, difficultiesResponse] = await Promise.all([
        fetch('/api/courses/public/categories'),
        fetch('/api/courses/public/difficulties')
      ]);

      if (categoriesResponse.ok) {
        const categories = await categoriesResponse.json();
        await cacheInIndexedDB('categories', categories);
      }

      if (difficultiesResponse.ok) {
        const difficulties = await difficultiesResponse.json();
        await cacheInIndexedDB('difficulties', difficulties);
      }

      console.log('Successfully preloaded essential data');
    } catch (error) {
      console.error('Failed to preload essential data:', error);
    }
  }, 'high');
};

// Cache data in IndexedDB
const cacheInIndexedDB = async (storeName, data) => {
  try {
    const request = indexedDB.open('eLearningDB', 1);
    
    return new Promise((resolve, reject) => {
      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        
        if (Array.isArray(data)) {
          data.forEach(item => store.put(item));
        } else {
          store.put(data);
        }
        
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      };
      
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Failed to cache data in IndexedDB:', error);
  }
};

// Smart preloading based on user behavior
export const smartPreload = {
  // Preload next lesson when user is halfway through current lesson
  preloadNextLesson: (currentLessonId, courseId) => {
    backgroundTaskManager.addTask(async () => {
      try {
        const response = await fetch(`/api/lessons/course/${courseId}`);
        if (response.ok) {
          const lessons = await response.json();
          const currentIndex = lessons.findIndex(l => l.id === currentLessonId);
          
          if (currentIndex >= 0 && currentIndex < lessons.length - 1) {
            const nextLesson = lessons[currentIndex + 1];
            await cacheInIndexedDB('lessons', nextLesson);
            console.log(`Preloaded next lesson: ${nextLesson.title}`);
          }
        }
      } catch (error) {
        console.error('Failed to preload next lesson:', error);
      }
    }, 'normal');
  },

  // Preload course content when user shows interest (hovers over course card)
  preloadOnInterest: (courseId) => {
    backgroundTaskManager.addTask(async () => {
      try {
        const response = await fetch(`/api/courses/public/${courseId}`);
        if (response.ok) {
          const course = await response.json();
          await cacheInIndexedDB('courses', course);
          console.log(`Preloaded course on interest: ${course.title}`);
        }
      } catch (error) {
        console.error('Failed to preload course on interest:', error);
      }
    }, 'low');
  },

  // Preload popular courses
  preloadPopularCourses: async () => {
    backgroundTaskManager.addTask(async () => {
      try {
        const response = await fetch('/api/courses/public/all');
        if (response.ok) {
          const courses = await response.json();
          // Assume first 5 courses are most popular
          const popularCourses = courses.slice(0, 5);
          
          for (const course of popularCourses) {
            await cacheInIndexedDB('courses', course);
          }
          
          console.log('Preloaded popular courses');
        }
      } catch (error) {
        console.error('Failed to preload popular courses:', error);
      }
    }, 'low');
  }
};

// Export the task manager for direct use
export { backgroundTaskManager };

// Auto-start essential preloading
if (navigator.onLine) {
  preloadEssentialData();
}
