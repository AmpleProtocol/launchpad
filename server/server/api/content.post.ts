import { Royalty, TokenMetadata, TreasuryRoyalty } from '@ample-launchpad/core'
import { nanoid, customAlphabet } from 'nanoid'

const numericid = customAlphabet('123456789', 16);

interface IBody {
	owner: string,
	price: string,
	title: string,
	description: string,
	mediaUrl: string,
	totalSupply: number,
	royalty: Royalty,
	treasuryRoyalty: TreasuryRoyalty
}

/**
	* Route for creating assets 
*/
export default eventHandler(async event => {
	const db = useDatabase()
	const { series } = await useContracts()

	const contentId = nanoid()
	const collectionId = parseInt(numericid())

	// 1. read body
	const {
		title,
		description,
		mediaUrl,
		totalSupply,
		price,
		owner,
		royalty,
		treasuryRoyalty
	} = await readBody<IBody>(event)

	// 2. create collection
	// todo: assert collection was created properly
	const metadata: TokenMetadata = {
		title,
		description,
		media: mediaUrl,
		copies: totalSupply.toString(),
	}
	await series.createSeries({
		id: collectionId,
		contentId,
		metadata,
		royalty,
		treasuryRoyalty,
		price,
		owner
	})

	// 3. create provider asset (won't upload the content)
	const { assetId, playbackId, tusEndpoint, uploadEndpoint } = await livepeer.createAsset(title)

	// 4. create db record
	await db.sql`INSERT INTO contents VALUES (
		${contentId},
		${title},
		${collectionId},
		${assetId},
		${playbackId},
	)`;

	// 5. return the tusUrl for user to upload the actual file
	return {
		success: true,
		data: {
			contentId,
			collectionId,
			tusEndpoint,
			uploadEndpoint,
		}
	}
})
