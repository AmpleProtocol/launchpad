import { verifySignature } from "@near-wallet-selector/core"
import { livepeer } from "~/utils/provider"

const privateKey = process.env.NITRO_PRIVATE_KEY
const publicKey = process.env.NITRO_PUBLIC_KEY

interface IPayload {
	publicKey: string,
	message: string,
	signature: string,
	nonce: string, // base64 encoded buffer 
	recipient: string, // the name of the app requesting the access
	callbackUrl?: string // optional I guess
}

interface IBody {
	contentId: string,
	accountId: string,
	payload: IPayload
}

/**
	* Used to issue JWTs that allows streaming tokengated contents
*/
export default eventHandler(async event => {
	const { series } = await useContracts()
	const db = useDatabase()

	// 1. Get private and public server keys, contentId and payload (sig) from body 
	const { contentId, accountId, payload } = await readBody<IBody>(event)
	const res = await db.sql`SELECT playbackId FROM contents WHERE id = ${contentId} LIMIT 1`
	if (!res.rows) {
		setResponseStatus(event, 404)
		return {
			success: false, message: `No content found with id = ${contentId}`
		}
	}
	if (res.error) {
		setResponseStatus(event, 500)
		return { success: false, message: res.error }
	}

	const playbackId = res.rows[0].playbackId as string

	if (payload.nonce.length != 32) {
		setResponseStatus(event, 400)
		return { success: false, message: 'nonce must be 32 bytes long' }
	}

	// 2. Verify signature and get user public key
	const isValidSignature = verifySignature({
		...payload,
		nonce: Buffer.from(payload.nonce, 'base64')
	})
	if (!isValidSignature) {
		setResponseStatus(event, 403)
		return { success: false, message: 'Not a valid signature' }
	}

	// 3. Check if the user has a valid nft for the given contentId from body
	const hasValidNFT = await series.validNFTForContent(contentId, accountId)
	if (!hasValidNFT) {
		setResponseStatus(event, 403)
		return { success: false, message: 'No valid NFT linked with the provided accountId' }
	}

	// 4. Sign a new JWT and send it to the user
	const jwt = await livepeer.createJwt(
		privateKey,
		publicKey,
		playbackId,
		payload.recipient,
		{
			accountId,
			contentId
		}
	)
	return { success: true, data: jwt }
})
