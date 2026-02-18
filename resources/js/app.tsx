import '../css/app.css';
import './bootstrap';

import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

import { registerServiceWorker } from './pwa/register-service-worker';
import { initSyncEngine } from './lib/offline';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

registerServiceWorker();
initSyncEngine();

/**
 * When offline, Inertia may receive an HTML response (from the service worker's
 * navigateFallback) instead of a JSON Inertia response. This triggers Inertia's
 * "invalid" event, which would normally show a modal. We intercept it offline
 * and redirect to /projects instead.
 */
router.on('invalid', (event) => {
    if (!navigator.onLine) {
        event.preventDefault();
        router.visit(route('projects.index'), { replace: true });
    }
});

import { HydrationWrapper } from './Components/HydrationWrapper';

// For developer console testing
if (import.meta.env.DEV) {
    (window as any).db = (await import('./lib/offline')).db;
    (window as any).syncNow = (await import('./lib/offline')).syncNow;
    (window as any).offline = await import('./lib/offline');
}

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => {
        const page = resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob('./Pages/**/*.tsx'),
        );
        page.then((module: any) => {
            const page = module.default;
            const oldLayout = page.layout;
            page.layout = (children: React.ReactNode) => {
                const content = oldLayout ? oldLayout(children) : children;
                return <HydrationWrapper>{content}</HydrationWrapper>;
            };
        });
        return page;
    },
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});
