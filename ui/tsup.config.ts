import { defineConfig } from 'tsup'

export default defineConfig({
	esbuildOptions(options, context) {
		options.jsx = 'automatic'
	}
})
