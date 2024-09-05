import { Royalty, TreasuryRoyalty } from '@ample-launchpad/core'
import { nanoid, customAlphabet } from 'nanoid'

const numericid = customAlphabet('123456789', 16);

interface IRentalCollection {
	price: string,
	royalty?: Royalty,
	validPeriodMs: number
}

interface IRoyaltyCollection extends Omit<IRentalCollection, 'validPeriodMs'> {
	totalSupply: number,
	treasuryRoyalty: TreasuryRoyalty
}

interface IBody {
	owner: string,
	title: string,
	description: string,
	mediaUrl: string,
	royaltyCollection: IRoyaltyCollection,
	rentalCollection: IRentalCollection,
}

/**
	* Route for creating assets 
*/
export default eventHandler(async event => {
	const db = useDatabase()
	const { series } = await useContracts()

	const contentId = nanoid()
	const royaltyCollectionId = parseInt(numericid())
	const rentalCollectionId = parseInt(numericid())

	// 1. read body
	const {
		owner,
		title,
		description,
		mediaUrl: media,
		royaltyCollection,
		rentalCollection
	} = await readBody<IBody>(event)

	// 2. create nft collections
	console.log('Creating NFT collections...')
	// royalty
	await series.createSeries({
		id: royaltyCollectionId,
		owner,
		contentId,
		metadata: {
			title: `${title} Royalty NFT`,
			description,
			media,
			copies: royaltyCollection.totalSupply
		},
		royalty: royaltyCollection.royalty || null,
		treasuryRoyalty: royaltyCollection.treasuryRoyalty,
		validPeriod: null,
		price: royaltyCollection.price,
	})
	// rental
	await series.createSeries({
		id: rentalCollectionId,
		owner,
		contentId,
		metadata: {
			title: `${title} Rental NFT`,
			description,
			media
		},
		royalty: rentalCollection.royalty || null,
		treasuryRoyalty: null,
		validPeriod: rentalCollection.validPeriodMs,
		price: rentalCollection.price,
	})
	console.log('Done creating royalty and rental collections')

	// 3. create provider asset (won't upload the content)
	const { assetId, playbackId, tusEndpoint, uploadEndpoint } = await livepeer.createAsset(title)
	console.log(`Livepeer asset created`)
	console.log({ assetId, tusEndpoint, playbackId })

	// 4. create db record
	await db.sql`INSERT INTO contents VALUES (
		${contentId},
		${title},
		${media},
		${royaltyCollectionId},
		${rentalCollectionId},
		${playbackId},
		${assetId}
	)`;
	console.log(`Content added to db`)
	console.log({ contentId, royaltyCollectionId, rentalCollectionId })

	// 5. return the tusUrl for user to upload the actual file
	return {
		success: true,
		data: {
			contentId,
			royaltyCollectionId,
			rentalCollectionId,
			tusEndpoint,
			uploadEndpoint,
		}
	}
})
