import { Wifi, WifiOff, RefreshCw, AlertTriangle } from 'lucide-react';

interface NetworkStatusBarProps {
    isOnline: boolean;
    wasOffline: boolean;
    pendingCount: number;
    onSyncPending?: () => void;
    isSyncing?: boolean;
}

/**
 * Compact network status indicator for the POS module.
 * Shows connection status + pending transaction count.
 */
export default function NetworkStatusBar({ 
    isOnline, 
    wasOffline, 
    pendingCount, 
    onSyncPending,
    isSyncing = false
}: NetworkStatusBarProps) {
    // Only show the full bar if offline or has pending transactions
    const showFullBar = !isOnline || pendingCount > 0;

    return (
        <>
            {/* Compact inline indicator (always visible) */}
            <div className="flex items-center gap-1.5">
                {isOnline ? (
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20" title="Koneksi Online">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 animate-pulse" title="Koneksi Offline">
                        <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
                    </div>
                )}

                {/* Pending badge */}
                {pendingCount > 0 && (
                    <button
                        onClick={onSyncPending}
                        disabled={!isOnline || isSyncing}
                        className="flex items-center gap-1 px-2 py-1 rounded-md bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title={isOnline ? 'Klik untuk sinkronisasi' : 'Menunggu koneksi untuk sinkronisasi'}
                    >
                        {isSyncing ? (
                            <RefreshCw className="w-3 h-3 text-amber-500 animate-spin" />
                        ) : (
                            <AlertTriangle className="w-3 h-3 text-amber-500" />
                        )}
                        <span className="text-[9px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                            {isSyncing ? 'Syncing...' : `${pendingCount} Pending`}
                        </span>
                    </button>
                )}
            </div>

            {/* Full-width banner for offline or reconnected */}
            {showFullBar && (
                <div className={`fixed bottom-0 lg:bottom-auto lg:top-16 left-0 right-0 z-50 px-4 py-2 text-center text-xs font-bold uppercase tracking-wider transition-all duration-300 animate-in slide-in-from-top-2
                    ${!isOnline 
                        ? 'bg-red-500 text-white' 
                        : wasOffline 
                            ? 'bg-emerald-500 text-white' 
                            : 'bg-amber-500 text-white'}`}
                >
                    {!isOnline ? (
                        <div className="flex items-center justify-center gap-2">
                            <WifiOff className="w-4 h-4" />
                            <span>Koneksi terputus — Transaksi akan diantrekan secara lokal</span>
                        </div>
                    ) : wasOffline ? (
                        <div className="flex items-center justify-center gap-2">
                            <Wifi className="w-4 h-4" />
                            <span>Koneksi pulih kembali</span>
                        </div>
                    ) : pendingCount > 0 ? (
                        <div className="flex items-center justify-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            <span>{pendingCount} transaksi menunggu sinkronisasi</span>
                            {isOnline && (
                                <button 
                                    onClick={onSyncPending} 
                                    disabled={isSyncing}
                                    className="ml-2 px-3 py-1 rounded-md bg-white/20 hover:bg-white/30 transition-colors text-white"
                                >
                                    {isSyncing ? 'Menyinkronkan...' : 'Sync Sekarang'}
                                </button>
                            )}
                        </div>
                    ) : null}
                </div>
            )}
        </>
    );
}
