import { LivepeerProvider } from '@ample-launchpad/core'
export const livepeer = new LivepeerProvider({
	apiKey: process.env.NITRO_LIVEPEER_API_KEY,
})
