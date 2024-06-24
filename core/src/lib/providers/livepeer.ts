import { GetViewershipsMetricsRequest } from "livepeer/dist/models/operations";
import { ICreateAssetResult, IProvider } from "../types";
import { signAccessJwt } from '@livepeer/core/crypto'
import { Livepeer, SDKProps } from "livepeer";
import { TypeT } from "livepeer/dist/models/components";


/**
	* Livepeer Provider to use the Ample Launchpad with Livepeer's infrastructure
*/
export class LivepeerProvider implements IProvider {
	livepeer: Livepeer

	constructor(sdkProps: SDKProps) {
		this.livepeer = new Livepeer(sdkProps)
	}

	async createAsset(
		title: string,
	): Promise<ICreateAssetResult> {

		// generate asset and upload urls
		const res = await this.livepeer.asset.create({
			name: title,
			playbackPolicy: {
				type: TypeT.Jwt
			}
		})
		if (!res.object?.asset.playbackId) throw new Error('No playbackId for some reason')

		return {
			assetId: res.object.asset.id,
			playbackId: res.object.asset.playbackId,
			tusEndpoint: res.object.tusEndpoint,
			uploadEndpoint: res.object.url,
		}
	}

	async retrieveViewcount(
		referenceId: string,
		from?: Date | undefined,
		to?: Date | undefined
	): Promise<number> {
		let query: GetViewershipsMetricsRequest = {
			playbackId: referenceId,
		}

		if (from) query.from = from
		if (from && to) query.to = to

		// retrieve viewership metrics for this content
		const res = await this.livepeer.metrics.getViewership(query)

		if (!res || !res.classes) return 0

		// get total viewCount
		let viewCount: number = 0;
		for (let metric of res.classes) {
			viewCount += metric.viewCount
		}

		return viewCount
	}

	createJwt(
		jwtPrivateKey: string,
		jwtPublicKey: string,
		referenceId: string,
		issuer: string,
		metadata: any
	): Promise<string> {
		return signAccessJwt({
			privateKey: jwtPrivateKey,
			publicKey: jwtPublicKey,
			issuer,
			playbackId: referenceId,
			// expiration: 86400 // default value for now
			custom: metadata
		})
	}

}
