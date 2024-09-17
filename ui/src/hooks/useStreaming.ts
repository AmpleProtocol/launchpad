import { useEffect, useState } from "react"
import { useLaunchpad } from "../context"
import { IPayload } from "@ample-launchpad/client"
import { type SignedMessage, type SignMessageParams } from "@near-wallet-selector/core";

const ONE_DAY_MS = 86400000
const TWO_HOURS_MS = 7200000

interface ISignMessageParamsLocalStorage extends Omit<SignMessageParams, 'nonce'> {
	nonce: string
}
interface IUrlData {
	url: string,
	jwt: string,
	expires: number
}

const constructPayload = (
	{ publicKey, signature }: SignedMessage,
	{ message, recipient, nonce, callbackUrl }: ISignMessageParamsLocalStorage
): IPayload => {
	return {
		publicKey,
		signature,
		message,
		nonce,
		recipient,
		callbackUrl
	}
}

export const useStreaming = (contentId: string) => {
	const { getJwt, wallet } = useLaunchpad()
	const [streamingUrl, setStreamingUrl] = useState<string | null>(null)
	const [jwt, setJwt] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		main()
	}, [])

	const main = async () => {
		if (errorsInUrl()) return

		// check for jwt in local storage
		if (checkForStreamingUrl()) return

		// if not there, check the url for signatures to get access 
		const payload = checkForSignatureInUrl()
		if (!payload) return await signMessage()

		await getAccess(payload)
	}

	// send payload (signature) to get an access jwt
	const getAccess = async (payload: IPayload) => {
		try {
			const res = await getJwt({ contentId, payload })

			if (!res.data.success) throw new Error(res.data.message)

			const { streamingUrl: _url, jwt } = res.data.data!

			const urlData: IUrlData = {
				url: _url,
				jwt,
				expires: Date.now() + ONE_DAY_MS // todo: receive expiration time from server
			}
			localStorage.setItem(`ample::streaming-url-${contentId}`, JSON.stringify(urlData))
			setStreamingUrl(_url)
			setJwt(jwt)

			// replace url 
			const url = new URL(location.href);
			url.search = ''
			url.hash = ''
			window.history.replaceState({}, document.title, url);
			localStorage.removeItem(`ample::message-to-sign-${contentId}`);
		} catch (error) {
			console.error(error)
			throw error
		}
	}

	const errorsInUrl = (): boolean => {
		// something like http://localhost:3000/#error=User%20rejected&.
		// that one gets returned after user cancelled signature from mynearwallet
		if (!window.location.hash) return false
		const hashParams = new URLSearchParams(window.location.hash.slice(1))

		const error = hashParams.get('error') as string
		if (!error) return false

		setError(error)
		return true
	}

	const checkForStreamingUrl = (): boolean => {
		// Check in localStorage for jwt
		const urlDataRaw = localStorage.getItem(`ample::streaming-url-${contentId}`)
		if (!urlDataRaw) return false

		const urlData = JSON.parse(urlDataRaw) as IUrlData

		//todo: check validity
		const now = Date.now()
		// we substract two hours to the expiration time to assure at least two hours of 
		// uninterrumpted streaming 
		const exp = urlData.expires - TWO_HOURS_MS
		if (now > exp) return false

		// update state
		setStreamingUrl(urlData.url)
		setJwt(urlData.jwt)
		return true
	}

	const checkForSignatureInUrl = (): IPayload | null => {
		const hashParams = new URLSearchParams(window.location.hash.slice(1))
		const accountId = hashParams.get("accountId") as string;
		const publicKey = hashParams.get("publicKey") as string;
		const signature = hashParams.get("signature") as string;

		if (!accountId || !publicKey || !signature) return null

		const messageRaw = localStorage.getItem(`ample::message-to-sign-${contentId}`)
		if (!messageRaw) return null

		const message = JSON.parse(messageRaw) as ISignMessageParamsLocalStorage;
		return constructPayload({ publicKey, signature, accountId }, message)
	}

	// sign an arbitrary message to prove wallet ownership
	const signMessage = async () => {
		if (!wallet.signMessage) {
			throw new Error('No signMessage() method found in current wallet, try using another one')
		}
		const message = "Sign this message to proceed";
		const nonce = Buffer.from(crypto.getRandomValues(new Uint8Array(32)));
		const recipient = "amplelaunchpad.testnet";

		if (wallet.type === "browser") {
			const toLocalStorage: ISignMessageParamsLocalStorage = {
				message,
				nonce: nonce.toString('base64'),
				recipient,
				callbackUrl: location.href,
			}
			localStorage.setItem(`ample::message-to-sign-${contentId}`, JSON.stringify(toLocalStorage));
		}

		// this will either give the signedMessage as url query searchParams or return it right away 
		const signedMessage = await wallet.signMessage({ message, nonce, recipient });
		if (signedMessage) {
			// handle this signed message
			const payload = constructPayload(
				signedMessage,
				{
					message,
					recipient,
					nonce: nonce.toString('base64')
				}
			)
			getAccess(payload)
		}
	};

	const tryAgain = () => {
		const url = new URL(location.href);
		url.hash = ''
		window.history.replaceState({}, document.title, url);

		main()
	}

	return {
		streamingUrl,
		jwt,
		error,
		tryAgain
	}
}

