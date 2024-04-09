import { Networks, Series, Treasury, getSignerFromPrivateKey } from "@ample-launchpad/core"

export const useContracts = async (): Promise<{ treasury: Treasury, series: Series }> => {
	// 1. get a new signer
	const signer = await getSignerFromPrivateKey({
		network: process.env.NITRO_NEAR_NETWORK as Networks,
		accountId: process.env.NITRO_ACCOUNT_ID,
		privateKey: process.env.NITRO_PRIVATE_KEY
	})

	// 2. create instances for treasury and series contracts interfaces
	const treasury = new Treasury(signer, process.env.NITRO_TREASURY_ADDRESS)
	const series = new Series(signer, process.env.NITRO_SERIES_ADDRESS)

	// 3. return such instances
	return { treasury, series }
}
