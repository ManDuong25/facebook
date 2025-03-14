import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '~': path.resolve(__dirname, './src'), // Đổi '~' thành '@' nếu cần
        },
    },
    css: {
        postcss: './postcss.config.js',
    },
});
