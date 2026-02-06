import { db } from './db';

const TOKEN_KEY = 'sync_token';

/**
 * Get the stored sync token from IndexedDB.
 */
export async function getSyncToken(): Promise<string | null> {
    const metadata = await db.syncMetadata.get(TOKEN_KEY);
    return metadata?.value ?? null;
}

/**
 * Store a sync token in IndexedDB.
 */
export async function setSyncToken(token: string): Promise<void> {
    await db.syncMetadata.put({ key: TOKEN_KEY, value: token });
}

/**
 * Clear the stored sync token.
 */
export async function clearSyncToken(): Promise<void> {
    await db.syncMetadata.delete(TOKEN_KEY);
}

/**
 * Get value of a cookie by name.
 */
function getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
    return match ? decodeURIComponent(match[3]) : null;
}

/**
 * Generate or retrieve a persistent device identifier.
 */
function getDeviceName(): string {
    let deviceId = localStorage.getItem('rowcounter_device_id');
    if (!deviceId) {
        const userAgent = navigator.userAgent.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '');
        deviceId = `${userAgent}-${Date.now()}`;
        localStorage.setItem('rowcounter_device_id', deviceId);
    }
    return deviceId;
}

/**
 * Fetch a new sync token from the server using the session cookie.
 * This requires the user to be authenticated.
 */
export async function fetchNewToken(): Promise<string | null> {
    try {
        const xsrfToken = getCookie('XSRF-TOKEN');
        if (!xsrfToken) {
            console.warn('[SyncToken] No XSRF-TOKEN cookie found');
            return null;
        }

        const response = await fetch('/sync/token', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'X-XSRF-TOKEN': xsrfToken,
                Accept: 'application/json',
            },
            body: JSON.stringify({ device_name: getDeviceName() }),
        });

        if (!response.ok) {
            console.warn('[SyncToken] Failed to fetch token:', response.status);
            return null;
        }

        const data = await response.json();
        if (data.token) {
            await setSyncToken(data.token);
            return data.token;
        }
        return null;
    } catch (error) {
        console.warn('[SyncToken] Error fetching token:', error);
        return null;
    }
}

/**
 * Ensure we have a valid sync token, fetching a new one if needed.
 */
export async function ensureSyncToken(): Promise<string | null> {
    const existing = await getSyncToken();
    if (existing) {
        return existing;
    }
    return fetchNewToken();
}
