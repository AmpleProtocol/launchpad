import { Royalty, TreasuryRoyalty } from "@ample-launchpad/core";

interface IRentalCollection {
	price: string,
	royalty?: Royalty,
	validPeriodMs: number
}

interface IRoyaltyCollection extends Omit<IRentalCollection, 'validPeriodMs'> {
	totalSupply: number,
	treasuryRoyalty: TreasuryRoyalty
}

export interface ICreateContentParams {
	owner: string,
	title: string,
	description: string,
	mediaUrl: string,
	royaltyCollection: IRoyaltyCollection,
	rentalCollection: IRentalCollection
}

export interface IPayload {
	publicKey: string,
	message: string,
	signature: string,
	nonce: string,
	recipient: string,
	callbackUrl?: string
}

export interface IGetJwtParams {
	contentId: string,
	payload: IPayload
}

export interface IContent {
	id: string,
	title: string,
	media: string,
	royaltyCollectionId: number,
	rentalCollectionId: number,
	playbackId: string,
	assetId: string
}
