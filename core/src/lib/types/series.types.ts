export interface TokenMetadata {
	title: string,
	description: string,
	media: string,
	copies?: string,
}

export interface JsonToken {
	series_id: number,
	owner_id: string,
	metadata: TokenMetadata,
	price: number,
}

export interface JsonSerie {
	series_id: number,
	metadata: TokenMetadata,
	royalty?: any,
	price?: number,
	owner_id: string,
	content_id: string,
}

export interface Royalty {
	[accountId: string]: number
}
