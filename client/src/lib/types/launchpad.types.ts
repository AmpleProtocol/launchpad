import { Royalty, TreasuryRoyalty } from "@ample-launchpad/core";

export interface ICreateContentParams {
	owner: string,
	price: string,
	title: string,
	description: string,
	mediaUrl: string,
	totalSupply: number,
	royalty: Royalty,
	treasuryRoyalty: TreasuryRoyalty
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
	accountId: string,
	playbackId: string,
	payload: IPayload
}
