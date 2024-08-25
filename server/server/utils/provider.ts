import { LivepeerProvider } from '@ample-launchpad/core'
import { signAccessJwt } from '@livepeer/core/crypto'

export const livepeer = new LivepeerProvider({
	apiKey: process.env.NITRO_LIVEPEER_API_KEY,
})

export async function createJwt(
	jwtPrivateKey: string,
	jwtPublicKey: string,
	referenceId: string,
	issuer: string,
	metadata: any
) {
	if (typeof window !== 'undefined') {
		throw new Error('createJwt() is not available in the browser')
	}
	const jwt = await signAccessJwt({
		privateKey: jwtPrivateKey,
		publicKey: jwtPublicKey,
		issuer,
		playbackId: referenceId,
		// expiration: 86400 // default value for now
		custom: metadata
	})

	return {
		jwt,
		streamingUrl: `https://playback.livepeer.studio/asset/hls/${referenceId}/index.m3u8?jwt=${jwt}`
	}

}
