export default defineNitroPlugin(async nitroApp => {
	const db = useDatabase()
	// assert tables are created 

	// CONTENTS table
	const res = await db.sql`CREATE TABLE IF NOT EXISTS contents (
		"id" TEXT PRIMARY KEY, 
		"title" TEXT, 
		"collectionId" INT, 
		"playbackId" TEXT,
		"assetId" TEXT
	)`;
	if (res.error) throw new Error(res.error)
	console.log('[db]: contents table ready')
})
