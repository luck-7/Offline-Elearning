// Service Worker for Offline-Ready eLearning Portal
const CACHE_NAME = 'elearning-portal-v1';
const API_CACHE_NAME = 'elearning-api-v1';

// Files to cache for offline use
const STATIC_CACHE_URLS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
];

// API endpoints to cache
const API_CACHE_URLS = [
  '/api/courses/public/all',
  '/api/courses/public/categories',
  '/api/courses/public/difficulties'
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache static files
      caches.open(CACHE_NAME).then((cache) => {
        console.log('Service Worker: Caching static files');
        return cache.addAll(STATIC_CACHE_URLS.map(url => new Request(url, { credentials: 'same-origin' })));
      }),
      // Cache API responses
      caches.open(API_CACHE_NAME).then((cache) => {
        console.log('Service Worker: Caching API responses');
        return Promise.all(
          API_CACHE_URLS.map(url => 
            fetch(url)
              .then(response => response.ok ? cache.put(url, response.clone()) : null)
              .catch(() => console.log(`Failed to cache: ${url}`))
          )
        );
      })
    ])
  );
  
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  self.clients.claim();
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
  }
  // Handle static files
  else {
    event.respondWith(handleStaticRequest(request));
  }
});

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(API_CACHE_NAME);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    throw new Error('Network response not ok');
  } catch (error) {
    console.log('Network failed, trying cache:', url.pathname);
    
    // Fall back to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline response for specific endpoints
    return getOfflineResponse(url.pathname);
  }
}

// Handle static requests with cache-first strategy
async function handleStaticRequest(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fall back to network
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache the response
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/');
    }
    
    throw error;
  }
}

// Generate offline responses for API endpoints
function getOfflineResponse(pathname) {
  const offlineData = {
    '/api/courses/public/all': {
      success: true,
      data: [],
      message: 'Offline mode - limited data available'
    },
    '/api/user/progress': {
      success: true,
      data: {
        completedCourses: 0,
        enrolledCourses: 0,
        averageCompletion: 0
      },
      message: 'Offline mode - progress will sync when online'
    }
  };
  
  const data = offlineData[pathname] || {
    success: false,
    message: 'This feature requires an internet connection'
  };
  
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'X-Offline-Response': 'true'
    }
  });
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered');
  
  if (event.tag === 'quiz-submission') {
    event.waitUntil(syncQuizSubmissions());
  } else if (event.tag === 'progress-update') {
    event.waitUntil(syncProgressUpdates());
  }
});

// Sync quiz submissions when back online
async function syncQuizSubmissions() {
  try {
    const db = await openIndexedDB();
    const pendingSubmissions = await getFromIndexedDB(db, 'pendingQuizSubmissions');
    
    for (const submission of pendingSubmissions) {
      try {
        const response = await fetch('/api/quiz/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${submission.token}`
          },
          body: JSON.stringify(submission.data)
        });
        
        if (response.ok) {
          await removeFromIndexedDB(db, 'pendingQuizSubmissions', submission.id);
          console.log('Synced quiz submission:', submission.id);
        }
      } catch (error) {
        console.error('Failed to sync quiz submission:', error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Sync progress updates when back online
async function syncProgressUpdates() {
  try {
    const db = await openIndexedDB();
    const pendingUpdates = await getFromIndexedDB(db, 'pendingProgressUpdates');
    
    for (const update of pendingUpdates) {
      try {
        const response = await fetch('/api/user/progress/lesson/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${update.token}`
          },
          body: JSON.stringify(update.data)
        });
        
        if (response.ok) {
          await removeFromIndexedDB(db, 'pendingProgressUpdates', update.id);
          console.log('Synced progress update:', update.id);
        }
      } catch (error) {
        console.error('Failed to sync progress update:', error);
      }
    }
  } catch (error) {
    console.error('Progress sync failed:', error);
  }
}

// IndexedDB helper functions
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('eLearningDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('pendingQuizSubmissions')) {
        db.createObjectStore('pendingQuizSubmissions', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('pendingProgressUpdates')) {
        db.createObjectStore('pendingProgressUpdates', { keyPath: 'id' });
      }
    };
  });
}

function getFromIndexedDB(db, storeName) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function removeFromIndexedDB(db, storeName, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}
