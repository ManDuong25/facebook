import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '~': path.resolve(__dirname, './src'), // Hoặc '@' nếu  bạn cần.
            'bootstrap-icons': path.resolve(__dirname, '../node_modules/bootstrap-icons')
        },
    },
    css: {
        postcss: './postcss.config.js',
    },
    server: {
        fs: {
            allow: ['..'] 
        }
    }
});
