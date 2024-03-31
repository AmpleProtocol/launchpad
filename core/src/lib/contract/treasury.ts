import { Contract } from ".";
import { ISigner } from "../../types/signer.type";

export class Treasury extends Contract {
	constructor(signer: ISigner, contractAddress: string) {
		super(signer, contractAddress)
	}

	/** Calculates the royalties the user has generated for a given contentId */
	async calculateRoyalties(contentId: string): Promise<number> {
		const res = await this.view<number>('calculate_royalties', {
			content_id: contentId,
			account_id: this.signer.address
		})

		return res * 10 ** -24
	}

	/** Claim whatever amount of royalties the user has generated for the given contentId */
	claimRoyalties(contentId: string) {
		return this.call('claim_royalties', {
			content_id: contentId
		})
	}

}
