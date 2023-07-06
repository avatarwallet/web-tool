import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
// import rollupNodePolyFill from 'rollup-plugin-node-polyfills';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';
// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			buffer: 'rollup-plugin-node-polyfills/polyfills/buffer-es6',
		},
	},
	server: {
		host: '0.0.0.0',
		port: 5173,
		proxy: {
			'/rpc': {
				target: 'http://192.168.50.72:8001',
				//target: "https://test.keylesswallet.io",
				//secure: false, //https
				changeOrigin: true,
			},
		},
	},
	optimizeDeps: {
		esbuildOptions: {
			// Node.js global to browser globalThis
			define: {
				global: 'globalThis',
			},
			// Enable esbuild polyfill plugins
			plugins: [
				NodeGlobalsPolyfillPlugin({
					process: true,
					buffer: true,
				}),
				NodeModulesPolyfillPlugin(),
			],
		},
	},
	// build: {
	// 	rollupOptions: {
	// 		plugins: [
	// 			// Enable rollup polyfills plugin
	// 			// used during production bundling
	// 			rollupNodePolyFill(),
	// 		],
	// 	},
	// },
});
