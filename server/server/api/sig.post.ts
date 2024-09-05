import { verifySignature } from "@near-wallet-selector/core"

// test endpoint 
interface IPayload {
	publicKey: string,
	message: string,
	signature: string,
	nonce: string, // base64 encoded buffer 
	recipient: string, // the name of the app requesting the access
	callbackUrl?: string // optional I guess
}

export default eventHandler(async event => {
	const payload = await readBody<IPayload>(event)

	console.log({ ...payload, nonce: Buffer.from(payload.nonce, 'base64') })

	return verifySignature({
		...payload,
		nonce: Buffer.from(payload.nonce, 'base64')
	})
})
