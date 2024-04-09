export default defineTask({
	meta: {
		name: "analytics",
		description: "Upload analytics to the treasury"
	},
	async run({ payload, context }) {
		// 1. Retrieve analytics from provider
		// 2. Upload analytics to the treasury
		return { result: true }
	}
})
