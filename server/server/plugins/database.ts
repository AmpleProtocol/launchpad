export default defineNitroPlugin(async () => {
	const db = useDatabase()
	// assert tables are created 

	// todo: remove this 
	await db.sql`drop table analytics`
	await db.sql`drop table contents`
	console.log('[db]: dropped tables')

	// contents table
	await db.sql`CREATE TABLE IF NOT EXISTS contents (
		id TEXT PRIMARY KEY, 
		title TEXT, 
		collectionId INT, 
		playbackId TEXT,
		assetId TEXT
	)`;

	// analytics table
	await db.sql`CREATE TABLE IF NOT EXISTS analytics (
		id TEXT PRIMARY KEY,
		timestamp INT,
		streams INT,
		contentId TEXT,
		FOREIGN KEY (contentId) REFERENCES contents(id)
	)`;

	// await db.sql`INSERT INTO contents VALUES ('firstId', 'Some movie', 'someCollectionId', 'somePlaybackId', 'someAssetId')`
	// [db]: added fake content with id = firstId

	console.log('[db]: tables ready')
})
