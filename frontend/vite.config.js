import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    define: {
        global: 'globalThis',
    },
    resolve: {
        alias: {
            '~': path.resolve(__dirname, './src'),
            'bootstrap-icons': path.resolve(__dirname, '../node_modules/bootstrap-icons'),
            process: 'process/browser',
            stream: 'stream-browserify',
            zlib: 'browserify-zlib',
            util: 'util',
        },
    },
    css: {
        postcss: './postcss.config.js',
    },
    server: {
        fs: {
            allow: ['..'],
        },
    },
});
