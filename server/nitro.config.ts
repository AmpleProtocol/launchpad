//https://nitro.unjs.io/config
export default defineNitroConfig({
	srcDir: "server",
	experimental: {
		tasks: true,
	},
	scheduledTasks: {
		// trigger server/tasks/analytics.ts task every 24 hours
		'0 0 * * *': ['analytics']
	}
});

