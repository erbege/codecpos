import { create } from 'zustand';

type Theme = 'light' | 'dark' | 'system';

interface AppStore {
    sidebarOpen: boolean;
    toggleSidebar: () => void;
    setSidebarOpen: (open: boolean) => void;
    theme: Theme;
    setTheme: (theme: Theme) => void;
    initializeTheme: () => void;
    posViewMode: 'grid' | 'table';
    setPosViewMode: (mode: 'grid' | 'table') => void;

    // Global Dialog State
    dialog: {
        show: boolean;
        title: string;
        message: string;
        confirmLabel?: string;
        cancelLabel?: string;
        type?: 'danger' | 'info' | 'success';
        onConfirm?: () => void;
        onCancel?: () => void;
    };
    confirm: (options: {
        title: string;
        message: string;
        confirmLabel?: string;
        cancelLabel?: string;
        type?: 'danger' | 'info' | 'success';
        onConfirm: () => void;
        onCancel?: () => void;
    }) => void;
    alert: (options: {
        title: string;
        message: string;
        confirmLabel?: string;
        type?: 'info' | 'success' | 'danger';
    }) => void;
    closeDialog: () => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
    sidebarOpen: false,
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
    
    posViewMode: (localStorage.getItem('posViewMode') as 'grid'|'table') || 'grid',
    setPosViewMode: (mode: 'grid' | 'table') => {
        set({ posViewMode: mode });
        localStorage.setItem('posViewMode', mode);
    },
    
    theme: 'system',
    setTheme: (theme: Theme) => {
        set({ theme });
        localStorage.setItem('theme', theme);
        get().initializeTheme();
    },
    initializeTheme: () => {
        let currentTheme = get().theme;
        
        // If it's just initializing from boot, try reading localStorage
        if (currentTheme === 'system') {
            const saved = localStorage.getItem('theme');
            if (saved) currentTheme = saved as Theme;
            set({ theme: currentTheme });
        }

        const isDark =
            currentTheme === 'dark' ||
            (currentTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    },

    dialog: {
        show: false,
        title: '',
        message: '',
        type: 'info',
    },

    confirm: (options) => {
        set({
            dialog: {
                ...options,
                show: true,
                confirmLabel: options.confirmLabel || 'Ya, Lanjutkan',
                cancelLabel: options.cancelLabel || 'Batal',
                type: options.type || 'danger',
            }
        });
    },

    alert: (options) => {
        set({
            dialog: {
                ...options,
                show: true,
                confirmLabel: options.confirmLabel || 'Tutup',
                type: options.type || 'info',
                onConfirm: () => get().closeDialog(),
            }
        });
    },

    closeDialog: () => {
        set((state) => ({
            dialog: { ...state.dialog, show: false }
        }));
    },
}));
