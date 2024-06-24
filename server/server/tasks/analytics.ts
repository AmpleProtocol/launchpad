import { v4 as uuid } from 'uuid'

export default defineTask({
	meta: {
		name: "analytics",
		description: "Upload analytics to the treasury"
	},
	async run(_) {
		console.log(`[cron:analytics]: cron task started`)
		const db = useDatabase()
		const { treasury } = await useContracts()

		// 1. Retrieve every content there are 
		const { rows: contents } = await db.sql`SELECT * FROM contents`;

		const timestamp = Date.now()

		for (const content of contents) {
			const lastAnalyticRes = await db.sql`
				SELECT timestamp FROM analytics 
				WHERE contentId = ${content.id} 
				ORDER BY timestamp DESC 
				LIMIT 1
			`;

			const fromDate = lastAnalyticRes.rows[0]
				? new Date(lastAnalyticRes.rows[0].timestamp as number)
				: undefined

			// 2. Retrieve analytics for each content from provider (livepeer)
			const streams = await livepeer.retrieveViewcount(content.playbackId as string, fromDate)

			// 3. Upload analytics to treasury
			await treasury.addAnalyticsData(content.id as string, streams, timestamp)

			await db.sql`INSERT INTO analytics VALUES (
				${uuid()}, 
				${timestamp},
				${streams},
				${content.id}
			)`
		}

		return { result: true }
	}
})
