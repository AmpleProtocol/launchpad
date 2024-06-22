import { v4 as uuid } from 'uuid'

interface IBody {
	title: string,
	collectionId: number,
}

/**
	* Route for creating assets 
*/
export default eventHandler(async event => {
	const db = useDatabase()
	// 1. receive body
	const { title, collectionId } = await readBody<IBody>(event)

	// 2. create provider asset (not upload)
	const { assetId, playbackId, tusEndpoint, uploadEndpoint } = await livepeer.createAsset(title)

	// 3. create db record
	const res = await db.sql`INSERT INTO contents VALUES (
		${uuid()},
		${title},
		${collectionId},
		${assetId},
		${playbackId},
	)`;

	// 4. return the tusUrl to upload the actual file
	return {
		success: true,
		data: {
			contentId: res.lastInsertRowid,
			tusEndpoint,
			uploadEndpoint
		}
	}
})
