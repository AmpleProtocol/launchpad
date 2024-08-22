import { useEffect, useMemo, useState } from "react"
import { useLaunchpad } from "../context"
import { IContent, IPayload } from "@ample-launchpad/client"
import type { SignedMessage, SignMessageParams } from "@near-wallet-selector/core";

import 'video.js/dist/video-js.css'
import { VideoPlayer } from "@videojs-player/react";

interface IPlayerProps {
	contentId: string,

}
/**
	* 1. Check for an existing jwt in localStorage
	* 2. Check for signatures in URL
	* 3. sign a new message using wallet
	* 4. Get a new JWT using getJwt() and store it in LS
*/
export const Player: React.FC<IPlayerProps> = ({ contentId }) => {
	const { getJwt, getContent, wallet, provider } = useLaunchpad()
	const [jwt, setJwt] = useState<string | null>(null)
	const [content, setContent] = useState<IContent | null>(null)

	useEffect(() => {
		fetchContent()
	}, [])

	useEffect(() => {
		// check for jwt in local storage
		// if not there, check for the url for signatures to get access 
		// if none of the above, sign a new message
		if (!jwt) {
			// whenever any of these functions updates the state (jwt); the useEffect 
			// execution will terminate and rerun it
			checkForJwt()
			checkForSignatureInUrl()
			signMessage()
		}
	}, [jwt])

	// send payload (signature) to get an access jwt
	const getAccess = async (payload: IPayload) => {
		const _jwt = await getJwt({ contentId, payload })

		localStorage.setItem(`jwt-access-${contentId}`, _jwt)
		setJwt(_jwt)
	}

	const checkForJwt = () => {
		// Check in localStorage for jwt
		const _jwt = localStorage.getItem(`jwt-access-${contentId}`)
		if (_jwt) {
			setJwt(_jwt)
		}
	}

	const checkForSignatureInUrl = () => {
		const searchParams = new URLSearchParams(window.location.search);
		const accountId = searchParams.get("accountId") as string;
		const publicKey = searchParams.get("publicKey") as string;
		const signature = searchParams.get("signature") as string;

		if (!accountId || !publicKey || !signature) return

		const message: SignMessageParams = JSON.parse(
			localStorage.getItem(`message-to-sign-${contentId}`)!
		);
		const payload = constructPayload({ publicKey, signature, accountId }, message)

		// replace url 
		localStorage.removeItem(`message-to-sign-${contentId}`);
		const url = new URL(location.href);
		url.hash = "";
		url.search = "";
		window.history.replaceState({}, document.title, url);

		getAccess(payload)
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
			localStorage.setItem(`message-to-sign-${contentId}`,
				JSON.stringify({
					message,
					nonce: [...nonce],
					recipient,
					callbackUrl: location.href,
				})
			);
		}

		// this is either give the signedMessage as url query searchParams or return it right away 
		const signedMessage = await wallet.signMessage({ message, nonce, recipient });
		if (signedMessage) {
			// handle this signed message
			const payload = constructPayload(signedMessage, { message, recipient, nonce })
			getAccess(payload)
		}
	};

	const fetchContent = async () => {
		const res = await getContent(contentId)
		if (!res.data.data) throw new Error('Content not found')
		if (!res.data.success) throw new Error(res.data.message!)
		setContent(res.data.data)
	}

	const hlsUrl = useMemo<string | null>(() => {
		if (!jwt || !content) return null
		return provider.getStreamingUrl(content.playbackId, jwt)
	}, [jwt, content])

	const constructPayload = (
		{ publicKey, signature }: SignedMessage,
		{ message, recipient, nonce }: SignMessageParams
	): IPayload => {
		return {
			publicKey,
			signature,
			message,
			nonce: nonce.toString('base64'),
			recipient,
			callbackUrl: location.href
		}
	}

	if (!hlsUrl) return null

	// return hls video player
	return <VideoPlayer src={hlsUrl} controls loop={false} />
}

