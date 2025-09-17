const CACHE_NAME = 'bh-onibus-v1';
const urlsToCache = [
  '/',
  '/admin',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
  '/manifest.json',
  '/favicon.png'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      }
    )
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  let options = {
    body: 'Nova informação sobre horários de ônibus! 🚌',
    icon: '/favicon.png',
    badge: '/favicon.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 'bh-onibus-notification'
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver Horários',
        icon: '/favicon.png'
      },
      {
        action: 'close',
        title: 'Fechar'
      }
    ],
    tag: 'bus-update',
    requireInteraction: false
  };

  // If push event has data, use it
  if (event.data) {
    try {
      const pushData = event.data.json();
      options.body = pushData.body || options.body;
      options.data = { ...options.data, ...pushData.data };
    } catch (e) {
      // If not JSON, use as text
      options.body = event.data.text() || options.body;
    }
  }

  event.waitUntil(
    self.registration.showNotification('BH Ônibus', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    // Open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'close') {
    // Just close the notification
    event.notification.close();
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});