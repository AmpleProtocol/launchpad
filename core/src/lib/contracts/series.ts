import { utils } from "near-api-js";
import { Contract } from "./contract";
import { ISigner, JsonSerie, JsonToken } from "../types";

export class Series extends Contract {
	constructor(signer: ISigner, contractAddress: string) {
		super(signer, contractAddress)
	}

	/** Returns the serie information  */
	getSeriesDetails(serieId: number): Promise<JsonToken> {
		return this.view('get_series_details', { id: serieId })
	}

	/** Returns an array of series owned by the user */
	nftSeriesForOwner(type?: 'royalty' | 'rental'): Promise<JsonSerie[]> {
		return this.view('nft_series_for_owner', {
			account_id: this.signer.address,
			serie_type: type
		})
	}

	/** Returns an array of tokens owned by the user */
	nftTokensForOwner(serieId?: number): Promise<JsonToken[]> {
		return this.view('nft_tokens_for_owner', {
			account_id: this.signer.address,
			serie_id: serieId
		})
	}

	/** Returns the first valid nft the user has for the contentId provided */
	validNFTForContent(contentId: string): Promise<{ tokenId: string, expires_at?: number } | null> {
		return this.view('valid_nft_for_content', {
			account_id: this.signer.address,
			content_id: contentId
		})
	}

	/** Returns the amount of tokens aquired between now and now - msToSubstract */
	tokensByTimeRange(msToSubstract: number, serieId: number): Promise<number> {
		return this.view('tokens_by_time_range', {
			ms_to_substract: msToSubstract,
			serie_id: serieId
		})
	}

	/** Mints a new NFT for the given serieId; must attach enough gas and deposit to cover NFT price */
	async mint(serieId: number) {
		const collection = await this.getSeriesDetails(serieId)
		const deposit = utils.format.parseNearAmount(JSON.stringify(collection.price)) || undefined

		return this.call('nft_mint', {
			id: JSON.stringify(serieId),
			receiver_id: this.signer.address
		}, deposit)
	}
}
