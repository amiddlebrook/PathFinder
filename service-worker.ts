const CACHE_NAME = 'pathfinder-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  // Add other assets that need caching like JS, CSS, fonts, icons
  // Note: The main JS and CSS are usually handled by the build process, but for this setup, we specify them.
  // The actual script names might need adjustment based on the final build output.
  '/index.tsx',
  '/App.tsx',
  '/types.ts',
  '/services/geminiService.ts',
  // Component files
  '/components/ExploreView.tsx',
  '/components/TripDetails.tsx',
  '/components/WelcomePlaceholder.tsx',
  // ...and so on for every file. A real build tool would automate this.
];

// Extend the Event interface for a Service Worker
interface ExtendableEvent extends Event {
  waitUntil(fn: Promise<any>): void;
}

// Extend the FetchEvent interface for a Service Worker
interface FetchEvent extends Event {
  request: Request;
  respondWith(response: Promise<Response | undefined>): void;
}


self.addEventListener('install', (event) => {
  const installEvent = event as ExtendableEvent;
  // Perform install steps
  installEvent.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        // This is a simplified list. In a real app, a build tool generates a manifest of all assets.
        return cache.addAll([
            '/',
            '/index.html',
            '/metadata.json',
        ]);
      })
  );
});

self.addEventListener('fetch', (event) => {
  const fetchEvent = event as FetchEvent;
  fetchEvent.respondWith(
    caches.match(fetchEvent.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // IMPORTANT: Clone the request. A request is a stream and
        // can only be consumed once. Since we are consuming this
        // once by cache and once by the browser for fetch, we need
        // to clone the response.
        const fetchRequest = fetchEvent.request.clone();

        return fetch(fetchRequest).then(
          (response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                // We don't cache calls to the Gemini API or other external services
                if(!fetchEvent.request.url.includes('googleapis.com')) {
                    cache.put(fetchEvent.request, responseToCache);
                }
              });

            return response;
          }
        );
      })
  );
});

self.addEventListener('activate', (event) => {
  const activateEvent = event as ExtendableEvent;
  const cacheWhitelist = [CACHE_NAME];
  activateEvent.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
