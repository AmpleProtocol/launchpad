export default defineTask({
	meta: {
		name: "analytics",
		description: "Upload analytics to the treasury"
	},
	async run({ payload, context }) {
		// 1. Retrieve every content there are 
		// 2. Retrieve analytics for each content from provider (livepeer)
		// 3. Upload analytics to treasury
		return { result: true }
	}
})
