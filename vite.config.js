import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.tsx',
            refresh: true,
        }),
        react(),
    ],
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('Pages/POS/')) {
                        return 'pos';
                    }
                    if (id.includes('Pages/Reports/')) {
                        return 'reports';
                    }
                    if (id.includes('Pages/Products/')) {
                        return 'products';
                    }
                },
            },
        },
    },
});
