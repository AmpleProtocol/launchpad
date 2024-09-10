//https://nitro.unjs.io/config
export default defineNitroConfig({
	srcDir: "server",
	experimental: {
		tasks: true,
		database: true,
	},
	scheduledTasks: {
		// trigger server/tasks/analytics.ts task every 24 hours
		'0 0 * * *': ['analytics']
	},
	routeRules: {
		'/api/**': {
			cors: true,
			headers: {
				'access-control-allow-methods': '*',
				'access-control-allow-origin': '*',
				'access-control-allow-headers': '*',
			}
		}
	}
});

