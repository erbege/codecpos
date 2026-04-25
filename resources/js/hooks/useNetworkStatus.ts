import { useState, useEffect, useCallback, useRef } from 'react';

interface NetworkStatus {
    isOnline: boolean;
    wasOffline: boolean;       // true if was previously offline (just reconnected)
    lastChecked: Date | null;
    latency: number | null;    // ms, null if offline
}

/**
 * Hook to detect network connectivity status.
 * Uses navigator.onLine + periodic server ping for accurate detection.
 */
export function useNetworkStatus(pingUrl?: string, pingIntervalMs = 30000) {
    const [status, setStatus] = useState<NetworkStatus>({
        isOnline: navigator.onLine,
        wasOffline: false,
        lastChecked: null,
        latency: null,
    });

    const wasOfflineRef = useRef(false);
    const pingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const checkConnection = useCallback(async () => {
        const start = performance.now();
        try {
            // Ping the server with a lightweight HEAD request
            const url = pingUrl || '/api/ping';
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const response = await fetch(url, {
                method: 'HEAD',
                cache: 'no-cache',
                signal: controller.signal,
            });

            clearTimeout(timeoutId);
            const latency = Math.round(performance.now() - start);

            if (response.ok) {
                const justReconnected = wasOfflineRef.current;
                wasOfflineRef.current = false;

                setStatus({
                    isOnline: true,
                    wasOffline: justReconnected,
                    lastChecked: new Date(),
                    latency,
                });

                // Reset wasOffline flag after a brief period
                if (justReconnected) {
                    setTimeout(() => {
                        setStatus(prev => ({ ...prev, wasOffline: false }));
                    }, 5000);
                }
            } else {
                throw new Error('Server returned non-OK');
            }
        } catch {
            wasOfflineRef.current = true;
            setStatus({
                isOnline: false,
                wasOffline: false,
                lastChecked: new Date(),
                latency: null,
            });
        }
    }, [pingUrl]);

    useEffect(() => {
        const handleOnline = () => {
            checkConnection();
        };

        const handleOffline = () => {
            wasOfflineRef.current = true;
            setStatus({
                isOnline: false,
                wasOffline: false,
                lastChecked: new Date(),
                latency: null,
            });
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Initial check
        checkConnection();

        // Periodic ping
        pingTimerRef.current = setInterval(checkConnection, pingIntervalMs);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            if (pingTimerRef.current) clearInterval(pingTimerRef.current);
        };
    }, [checkConnection, pingIntervalMs]);

    return status;
}
