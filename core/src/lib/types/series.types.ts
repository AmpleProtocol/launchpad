export interface TokenMetadata {
	title: string,
	description: string,
	media: string,
	copies?: number,
}

export interface JsonToken {
	series_id: number,
	owner_id: string,
	metadata: TokenMetadata,
	price: string,
}

export interface JsonSerie {
	series_id: number,
	metadata: TokenMetadata,
	royalty?: any,
	price?: string,
	owner_id: string,
	content_id: string,
}

/**
	* Regular royalty for the NFT compliant with NEP-199
*/
export interface Royalty {
	[accountId: string]: number
}

export interface TreasuryRoyalty {
	owner: number,
	holders: number,
}
