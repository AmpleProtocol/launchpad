import { Contract } from "./contract";
import { ISigner } from '../types';

export class Treasury extends Contract {
	constructor(signer: ISigner, contractAddress: string) {
		super(signer, contractAddress)
	}

	/** Calculates the royalties the user has generated for a given contentId */
	async calculateRoyalties(contentId: string): Promise<number> {
		const res = await this.view<number>('calculate_royalties', {
			content_id: contentId,
			account_id: this.signer.accountId
		})

		return res * 10 ** -24
	}

	/** Claim whatever amount of royalties the user has generated for the given contentId */
	claimRoyalties(contentId: string) {
		return this.call('claim_royalties', {
			content_id: contentId
		})
	}


	/** Sends analytics to the contract for a given content id */
	addAnalyticsData(contentId: string, streams: number, timestamp: number = Date.now()) {
		return this.call('add_analytics_data', {
			bulk_analytics: {
				content_id: contentId,
				streams
			},
			timestamp
		})
	}

}
