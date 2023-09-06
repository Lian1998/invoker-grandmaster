import { defineConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
    root: path.resolve(__dirname, './multi-pages/'),
    publicDir: path.resolve(__dirname, './public/'),
    assetsInclude: ['*.vert', '*.frag', '*.glsl'],
    resolve: {
        alias: {
            '@src': path.resolve(__dirname, './src')
        },
    },
    build: {
        outDir: path.resolve(__dirname, './dist'),
        emptyOutDir: true,
        rollupOptions: {
            input: {
                index: path.resolve(__dirname, './multi-pages/index.html'),
            }
        }
    },
    plugins: [],
})
