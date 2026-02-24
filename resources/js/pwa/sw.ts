/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope;

import { ExpirationPlugin } from 'workbox-expiration';
import { precacheAndRoute } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst } from 'workbox-strategies';

// Precache manifest injected by VitePWA
precacheAndRoute(self.__WB_MANIFEST);

// Cache names
const INERTIA_CACHE = 'inertia-responses';
const DOCUMENTS_CACHE = 'documents';
const ASSETS_CACHE = 'assets';
const IMAGES_CACHE = 'images';

// Inertia XHR requests - CacheFirst since IndexedDB has the real data
// We intercept these and ensure proper headers when serving from cache
registerRoute(
    ({ url, request }) =>
        url.pathname.startsWith('/projects') &&
        request.headers.get('X-Inertia') === 'true',
    new CacheFirst({
        cacheName: INERTIA_CACHE,
        plugins: [
            new ExpirationPlugin({
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
            }),
        ],
    }),
);

// Document requests (full page loads) - NetworkFirst with HTML fallback
registerRoute(
    ({ request }) => request.destination === 'document',
    new NetworkFirst({
        cacheName: DOCUMENTS_CACHE,
        networkTimeoutSeconds: 3,
        plugins: [
            new ExpirationPlugin({
                maxEntries: 25,
                maxAgeSeconds: 60 * 60 * 24,
            }),
        ],
    }),
);

// Static assets - CacheFirst
registerRoute(
    ({ request }) =>
        request.destination === 'script' ||
        request.destination === 'style' ||
        request.destination === 'font',
    new CacheFirst({
        cacheName: ASSETS_CACHE,
        plugins: [
            new ExpirationPlugin({
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30,
            }),
        ],
    }),
);

// Images - CacheFirst
registerRoute(
    ({ request }) => request.destination === 'image',
    new CacheFirst({
        cacheName: IMAGES_CACHE,
        plugins: [
            new ExpirationPlugin({
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30,
            }),
        ],
    }),
);

// Navigation fallback for project routes - serve the cached HTML shell
const navigationRoute = new NavigationRoute(
    async ({ request }) => {
        const cache = await caches.open(DOCUMENTS_CACHE);

        // Try to get the cached HTML shell (from /projects or root)
        let cachedResponse = await cache.match('/projects');
        if (!cachedResponse) {
            cachedResponse = await cache.match('/');
        }
        if (!cachedResponse) {
            cachedResponse = await cache.match(request);
        }

        if (cachedResponse) {
            return cachedResponse;
        }

        // Try network as last resort
        try {
            const networkResponse = await fetch(request);
            if (networkResponse.ok) {
                await cache.put(request, networkResponse.clone());
            }
            return networkResponse;
        } catch {
            // Return a basic offline page
            return new Response(
                `<!DOCTYPE html>
                <html>
                <head><title>Offline</title></head>
                <body>
                    <h1>You're offline</h1>
                    <p>Please check your connection and try again.</p>
                </body>
                </html>`,
                {
                    status: 503,
                    headers: { 'Content-Type': 'text/html' },
                },
            );
        }
    },
    {
        allowlist: [/^\/projects/],
    },
);

registerRoute(navigationRoute);

// Skip waiting on update
self.addEventListener('message', (event) => {
    if (event.data?.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
