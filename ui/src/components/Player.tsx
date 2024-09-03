import { useEffect, useState } from "react"
import { useLaunchpad } from "../context"
import { IPayload } from "@ample-launchpad/client"
import { type SignedMessage, type SignMessageParams } from "@near-wallet-selector/core";
import { VideoPlayer, VideoPlayerProps } from "@videojs-player/react";
import { Box, Spinner } from "theme-ui";
// import 'video.js/dist/video-js.css'

interface ISignMessageParamsLocalStorage extends Omit<SignMessageParams, 'nonce'> {
	nonce: string
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

interface IPlayerProps {
	contentId: string,
	videoJSProps: Omit<VideoPlayerProps, 'src'>
}
export const Player: React.FC<IPlayerProps> = ({ contentId, videoJSProps }) => {
	const { getJwt, wallet } = useLaunchpad()
	const [streamingUrl, setStreamingUrl] = useState<string | null>(null)

	useEffect(() => {
		main()
	}, [])

	const main = async () => {
		// check for jwt in local storage
		if (checkForStreamingUrl()) return

		// if not there, check the url for signatures to get access 
		const payload = checkForSignatureInUrl()
		if (!payload) return signMessage()

		await getAccess(payload)
	}

	// send payload (signature) to get an access jwt
	const getAccess = async (payload: IPayload) => {
		try {
			const res = await getJwt({ contentId, payload })

			if (!res.data.success) throw new Error(res.data.message)

			const { streamingUrl: _url } = res.data.data!
			localStorage.setItem(`streaming-url-${contentId}`, _url)
			setStreamingUrl(_url)

			// replace url 
			const url = new URL(location.href);
			url.search = ''
			url.hash = ''
			window.history.replaceState({}, document.title, url);
			localStorage.removeItem(`message-to-sign-${contentId}`);
		} catch (error) {
			console.error(error)
			throw error
		}
	}

	const checkForStreamingUrl = (): boolean => {
		// Check in localStorage for jwt
		const _url = localStorage.getItem(`streaming-url-${contentId}`)
		if (!_url) return false
		// update state
		setStreamingUrl(_url)
		return true
	}

	const checkForSignatureInUrl = (): IPayload | null => {
		const hashParams = new URLSearchParams(window.location.hash.slice(1))
		const accountId = hashParams.get("accountId") as string;
		const publicKey = hashParams.get("publicKey") as string;
		const signature = hashParams.get("signature") as string;

		if (!accountId || !publicKey || !signature) return null

		const message: ISignMessageParamsLocalStorage = JSON.parse(
			localStorage.getItem(`message-to-sign-${contentId}`)!
		);
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
			localStorage.setItem(`message-to-sign-${contentId}`, JSON.stringify(toLocalStorage));
		}

		// this is either give the signedMessage as url query searchParams or return it right away 
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

	if (!streamingUrl) return <Box>
		<Spinner />
	</Box>

	// return hls video player
	return <VideoPlayer src={streamingUrl} {...videoJSProps} />
}

