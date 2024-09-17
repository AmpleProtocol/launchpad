import { nanoid } from "nanoid";

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
			console.log(`Uploading analytics for ${content.title}`)

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
			console.log({ streams })

			// create a record in db, no matter how many streams there are
			await db.sql`INSERT INTO analytics VALUES (
				${nanoid()}, 
				${timestamp},
				${streams},
				${content.id}
			)`

			// if no streams, don't send anything to treasury 
			if (streams == 0) continue

			// 3. Upload analytics to treasury
			await treasury.addAnalyticsData(content.id as string, streams, timestamp)

			console.log('Added to treasury')
		}

		return { result: true }
	}
})
