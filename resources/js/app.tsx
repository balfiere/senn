import '../css/app.css';
import './bootstrap';

import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

import { HydrationWrapper } from './Components/HydrationWrapper';
import { initSyncEngine } from './lib/offline';
import { registerServiceWorker } from './pwa/register-service-worker';

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

// For developer console testing
if (import.meta.env.DEV) {
    const offlineModule = await import('./lib/offline');
    window.db = offlineModule.db;
    window.syncNow = offlineModule.syncNow;
    window.offline = offlineModule;
}

interface PageModule {
    default: {
        layout?: (children: React.ReactNode) => React.ReactNode;
        [key: string]: unknown;
    };
}

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => {
        const page = resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob('./Pages/**/*.tsx'),
        ) as Promise<PageModule>;
        page.then((module) => {
            const pageComponent = module.default;
            const oldLayout = pageComponent.layout;
            pageComponent.layout = (children: React.ReactNode) => {
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
