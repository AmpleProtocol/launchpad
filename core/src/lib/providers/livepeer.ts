import { GetViewershipsMetricsRequest } from "livepeer/dist/models/operations";
import { IProvider } from "../types";
import { signAccessJwt } from '@livepeer/core/crypto'
import { Livepeer, SDKProps } from "livepeer";
import { TypeT } from "livepeer/dist/models/components";
import { DetailedError, Upload } from "tus-js-client";


/**
	* Livepeer Provider to use the Ample Launchpad with Livepeer's infrastructure
*/
export class LivepeerProvider implements IProvider {
	livepeer: Livepeer

	constructor(sdkProps: SDKProps) {
		this.livepeer = new Livepeer(sdkProps)
	}

	async upload(
		title: string,
		filename: string,
		asset: File,
		onError?: (error: Error | DetailedError) => void,
		onProgress?: (bytesUploaded: number, byptesTotal: number) => void,
		onSuccess?: () => void
	): Promise<any> {

		// generate asset and upload urls
		const res = await this.livepeer.asset.create({
			name: title,
			playbackPolicy: {
				type: TypeT.Jwt
			}
		})
		// upload the actual asset
		// https://docs.livepeer.org/api-reference/asset/upload
		const upload = new Upload(asset, {
			endpoint: res.object?.tusEndpoint,
			metadata: {
				filename,
				filetype: asset.type,
			},
			uploadSize: asset.size,
			onError,
			onSuccess,
			onProgress
		})

		upload.start()

		// handle tokengated relation(?)
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
		if (to) query.to = to

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
