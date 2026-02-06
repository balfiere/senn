import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

import { registerServiceWorker } from './pwa/register-service-worker';
import { initSyncEngine } from './lib/offline';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

registerServiceWorker();
initSyncEngine();

// For developer console testing
if (import.meta.env.DEV) {
    (window as any).db = (await import('./lib/offline')).db;
    (window as any).syncNow = (await import('./lib/offline')).syncNow;
    (window as any).offline = await import('./lib/offline');
}

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob('./Pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});
