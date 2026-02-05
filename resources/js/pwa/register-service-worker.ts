export function registerServiceWorker(): void {
    if (!('serviceWorker' in navigator)) {
        return;
    }

    window.addEventListener('load', async () => {
        try {
            const swUrl = import.meta.env.PROD ? '/build/sw.js' : '/sw.js';

            await navigator.serviceWorker.register(swUrl, {
                scope: '/',
            });
        } catch {
            // Intentionally ignore registration errors (offline/dev quirks)
        }
    });
}
