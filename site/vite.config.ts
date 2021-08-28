import preact from '@preact/preset-vite';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [preact()],
	resolve: {
		alias: [{ find: 'react', replacement: 'preact/compat' }],
	},
	server: {
		force: true,
		port: 8080,
	},
});
