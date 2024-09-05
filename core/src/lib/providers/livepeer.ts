import { ICreateAssetResult, IProvider } from "../types";
import { Livepeer, SDKOptions } from "livepeer";
import { Type } from "livepeer/models/components";
import { GetViewershipMetricsRequest } from "livepeer/models/operations";

/**
	* Livepeer Provider to use the Ample Launchpad with Livepeer's infrastructure
*/
export class LivepeerProvider implements IProvider {
	livepeer: Livepeer

	constructor(sdkOptions: SDKOptions) {
		this.livepeer = new Livepeer(sdkOptions)
	}

	async createAsset(
		title: string,
	): Promise<ICreateAssetResult> {

		// generate asset and upload urls
		const res = await this.livepeer.asset.create({
			name: title,
			playbackPolicy: {
				type: Type.Jwt
			}
		})
		if (!res.data?.asset.playbackId) throw new Error('No playbackId for some reason')

		return {
			assetId: res.data.asset.id,
			playbackId: res.data.asset.playbackId,
			tusEndpoint: res.data.tusEndpoint,
			uploadEndpoint: res.data.url,
		}
	}

	async retrieveViewcount(
		referenceId: string,
		from?: Date | undefined,
		to?: Date | undefined
	): Promise<number> {
		if (!from) {
			// if no 'from' is provided, getViewership() call will throw a 'bytes exceeded' error.
			// we can get the total viewCount from getPublicViewership() with no issues though
			const res = await this.livepeer.metrics.getPublicViewership(referenceId)
			if (!res || !res.data || !res.data.viewCount) return 0

			return res.data.viewCount
		}

		let query: GetViewershipMetricsRequest = {
			playbackId: referenceId,
			from,
			to: to || undefined
		}

		// retrieve viewership metrics for this content
		const res = await this.livepeer.metrics.getViewership(query)

		if (!res || !res.data) return 0

		// get total viewCount
		let viewCount: number = 0;
		for (let metric of res.data) {
			viewCount += metric.viewCount
		}

		return viewCount
	}

	// async createJwt(
	// 	jwtPrivateKey: string,
	// 	jwtPublicKey: string,
	// 	referenceId: string,
	// 	issuer: string,
	// 	metadata: any
	// ) {
	// 	if (typeof window !== 'undefined') {
	// 		throw new Error('createJwt() is not available in the browser')
	// 	}
	// 	const jwt = await signAccessJwt({
	// 		privateKey: jwtPrivateKey,
	// 		publicKey: jwtPublicKey,
	// 		issuer,
	// 		playbackId: referenceId,
	// 		// expiration: 86400 // default value for now
	// 		custom: metadata
	// 	})
	//
	// 	// todo: add support for other streaming protocols other than hls
	// 	return {
	// 		jwt,
	// 		streamingUrl: `https://playback.livepeer.studio/asset/hls/${referenceId}/index.m3u8?jwt=${jwt}`
	// 	}
	// }

}
