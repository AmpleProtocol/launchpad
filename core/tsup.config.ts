import { defineConfig } from 'tsup'
import { polyfillNode } from 'esbuild-plugin-polyfill-node';

export default defineConfig({
	esbuildPlugins: [
		polyfillNode({
			globals: {
				buffer: true
			},
			polyfills: {
				fs: true,
				crypto: true
			},
		})
	],
	esbuildOptions(options, context) {
		// https://esbuild.github.io/api/#external
		options.packages = 'external'
	}
})
