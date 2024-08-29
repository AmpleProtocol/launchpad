import { IAnalytic } from "~/types/analytics.type"
import { IContent } from "~/types/content.type"

const DAY_IN_MS = 86400000

type Ranges = 'day' | 'week' | 'month' | 'year'

interface IQuery {
	range: Ranges,
	contentId: string
}

const RangeInDays = {
	day: 1,
	week: 7,
	month: 30,
	year: 365
}

/**
	* Sumarize analytics for a given content.
*/
export default eventHandler(async event => {
	const db = useDatabase()
	const { series } = await useContracts()
	const { range, contentId } = getQuery<IQuery>(event)

	// get the content
	const contentQuery = await db.sql`SELECT * FROM contents WHERE id = ${contentId} LIMIT 1`

	if (contentQuery.rows.length == 0) {
		setResponseStatus(event, 404)
		return {
			success: false,
			message: `Content with id = ${contentId} not found`
		}
	}

	const content = contentQuery.rows[0] as unknown as IContent


	// 1. CALCULATE TOTAL GENERATED
	// get collection and issued tokens for this content
	const rangeInMs = RangeInDays[range] * DAY_IN_MS
	const collection = await series.getSeriesDetails(content.collectionId)
	const issuedTokens = await series.tokensByTimeRange(rangeInMs, content.collectionId)

	// total generated in the given range = tokenPrice * issuedTokens
	const totalGenerated = collection.price * issuedTokens

	// 2. GET ANALYTICS
	const now = Date.now()
	const analyticsQuery = await db.sql`SELECT * FROM analytics 
		WHERE contentId = ${contentId} 
		AND timestamp >= ${now - rangeInMs}`;

	const analytics = analyticsQuery.rows as unknown as IAnalytic[]

	const streamsCount = analytics.reduce((acc, { streams }) => acc + streams, 0)
	const streams = analytics.map(({ streams, timestamp }) => ({ streams, timestamp }))

	return {
		success: true,
		data: {
			totalGenerated,
			streamsCount,
			streams
		}
	}
})
