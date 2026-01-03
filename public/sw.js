importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.3.0/workbox-sw.js');

if (workbox) {
    // ============================================
    // WORKBOX LOGGING CONFIGURATION
    // ============================================
    // Configure Workbox log level to reduce console noise
    // Options: 'debug' (most verbose), 'log' (default), 'warn', 'error', 'silent' (no logs)
    //
    // To change: Modify the WORKBOX_LOG_LEVEL constant below
    // Recommended: 'warn' or 'silent' for development, 'log' for production debugging
    // const WORKBOX_LOG_LEVEL = 'warn'; // Change this to 'silent' to disable all Workbox logs
    const WORKBOX_LOG_LEVEL = 'silent'; // Change this to 'silent' to disable all Workbox logs

    // Auto-detect development environment (optional - you can remove this and just use WORKBOX_LOG_LEVEL)
    const isDevelopment = self.location.origin.includes('localhost') ||
        self.location.origin.includes('127.0.0.1') ||
        self.location.origin.includes(':3000');

    // Use WORKBOX_LOG_LEVEL directly, or uncomment below to auto-set based on environment:
    // const logLevel = isDevelopment ? 'warn' : 'log';
    const logLevel = WORKBOX_LOG_LEVEL;

    // workbox.core.setLogLevel(logLevel); // error here unsupport
    // Disable all Workbox logs
    workbox.setConfig({ debug: false });


    // 0. Force Immediate Control (Important for offline to work right away)
    workbox.core.skipWaiting();
    workbox.core.clientsClaim();

    // CRITICAL: Global exclusion for POST requests (Next.js Server Actions)
    // Server actions must bypass service worker to maintain proper cookie/session handling
    // This is especially important in PWA standalone mode where cookie handling differs
    workbox.routing.registerRoute(
        ({ request }) => request.method === 'POST',
        async ({ request }) => {
            // Bypass service worker entirely - fetch directly from network
            return fetch(request);
        }
    );

    if (logLevel !== 'silent') {
        console.log(`Yay! Workbox is loaded 🎉`);
    }

    // 1. Precache Cleanup (optional for manual mode, but good practice)
    workbox.precaching.cleanupOutdatedCaches();

    // 2. Google Fonts (Cache First)
    // Cache the Google Fonts stylesheets with a stale-while-revalidate strategy.
    workbox.routing.registerRoute(
        ({ url }) => url.origin === 'https://fonts.googleapis.com',
        new workbox.strategies.StaleWhileRevalidate({
            cacheName: 'google-fonts-stylesheets',
        })
    );

    // Cache the underlying font files with a cache-first strategy for 1 year.
    workbox.routing.registerRoute(
        ({ url }) => url.origin === 'https://fonts.gstatic.com',
        new workbox.strategies.CacheFirst({
            cacheName: 'google-fonts-webfonts',
            plugins: [
                new workbox.cacheableResponse.CacheableResponsePlugin({
                    statuses: [0, 200],
                }),
                new workbox.expiration.ExpirationPlugin({
                    maxAgeSeconds: 60 * 60 * 24 * 365,
                    maxEntries: 30,
                }),
            ],
        })
    );

    // 3. Images (Cache First)
    workbox.routing.registerRoute(
        ({ request }) => request.destination === 'image',
        new workbox.strategies.CacheFirst({
            cacheName: 'images',
            plugins: [
                new workbox.expiration.ExpirationPlugin({
                    maxEntries: 60,
                    maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
                }),
            ],
        })
    );

    // 4. JS & CSS Assets (Stale While Revalidate)
    // Since we don't have build manifest injection, rely on SWR for static assets
    workbox.routing.registerRoute(
        ({ request }) =>
            request.destination === 'script' || request.destination === 'style',
        new workbox.strategies.StaleWhileRevalidate({
            cacheName: 'static-resources',
        })
    );

    // 5. Next.js Data/Page Routes (Network First)
    // Ensure users get fresh content, but fallback to cache if offline
    // CRITICAL: Exclude server actions (POST requests) from service worker interception
    // Server actions use special Next.js internal routes and must bypass SW for proper cookie/session handling
    workbox.routing.registerRoute(
        ({ url, request }) => {
            // Skip POST requests (server actions) - they must bypass service worker
            if (request.method === 'POST') {
                return false;
            }
            // Only intercept GET requests for data routes
            return (
                url.pathname.startsWith('/_next/data/') ||
                url.pathname.includes('/api/')
            );
        },
        new workbox.strategies.NetworkFirst({
            cacheName: 'api-data',
            plugins: [
                new workbox.expiration.ExpirationPlugin({
                    maxEntries: 50,
                    maxAgeSeconds: 5 * 60, // 5 minutes
                }),
            ],
        })
    );

    // 6. Navigation Routes (Network First for reliability)
    // CRITICAL: Exclude POST requests (server actions) from navigation interception
    // Server actions must bypass service worker to maintain proper cookie/session handling
    workbox.routing.registerRoute(
        ({ request }) => {
            // Only intercept GET navigation requests, not POST (server actions)
            return request.mode === 'navigate' && request.method === 'GET';
        },
        new workbox.strategies.NetworkFirst({
            cacheName: 'pages',
            plugins: [
                new workbox.expiration.ExpirationPlugin({
                    maxEntries: 20,
                }),
            ],
        })
    );

    // 7. Offline Fallback
    // Precache the offline page manually
    const FALLBACK_HTML_URL = '/offline';

    self.addEventListener('install', (event) => {
        event.waitUntil(
            caches.open('workbox-offline-fallbacks')
                .then((cache) => {
                    console.log('Precaching offline page:', FALLBACK_HTML_URL);
                    return cache.add(FALLBACK_HTML_URL);
                })
                .catch((err) => console.error('Failed to precache offline page:', err))
        );
    });

    // Handle offline fallback
    workbox.routing.setCatchHandler(async ({ event }) => {
        if (event.request.destination === 'document') {
            // Try to get from specific cache first
            const cache = await caches.open('workbox-offline-fallbacks');
            const response = await cache.match(FALLBACK_HTML_URL);
            if (response) {
                return response;
            }
            console.warn('Offline page not found in cache.');
            return Response.error();
        }
        return Response.error();
    });

    // 8. Push Notifications
    self.addEventListener('push', function (event) {
        if (!event.data) return;

        const data = event.data.json();
        console.log('Push Received:', data);

        const options = {
            body: data.body,
            icon: data.icon || '/assets/w_logo.png',
            badge: '/assets/w_logo.png', // Small icon for notification bar
            data: { url: data.url || '/' }, // Deep link
            tag: data.tag || 'general' // Grouping
        };

        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    });

    self.addEventListener('notificationclick', function (event) {
        event.notification.close();
        const urlToOpen = event.notification.data.url;

        event.waitUntil(
            clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
                // 1. If window is already open, focus it
                for (let i = 0; i < windowClients.length; i++) {
                    const client = windowClients[i];
                    if (client.url === urlToOpen && 'focus' in client) {
                        return client.focus();
                    }
                }
                // 2. Otherwise open new window
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
        );
    });

} else {
    console.log(`Boo! Workbox didn't load 😬`);
}
