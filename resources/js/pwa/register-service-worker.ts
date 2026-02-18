export function registerServiceWorker(): void {
    if (!('serviceWorker' in navigator)) {
        return;
    }

    window.addEventListener('load', async () => {
        try {
            // The service worker is built to public/build/sw.js
            const swUrl = '/build/sw.js';

            await navigator.serviceWorker.register(swUrl, {
                scope: '/',
            });
        } catch {
            // Intentionally ignore registration errors (offline/dev quirks)
        }
    });
}
