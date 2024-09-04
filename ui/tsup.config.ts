import { defineConfig } from 'tsup'

export default defineConfig({
	onSuccess: 'cpx src/index.css dist/',
	external: ['@vidstack/react'],
	esbuildOptions(options, context) {
		options.jsx = 'automatic'
	},
	outExtension({ format }) {
		return {
			js: format === 'esm' ? '.mjs' : '.cjs', // Explicitly set .mjs for ESM and .cjs for CommonJS
		};
	},
})
