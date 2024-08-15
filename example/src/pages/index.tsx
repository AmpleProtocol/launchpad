import { AmpleLaunchpadProvider, Launch } from '@ample-launchpad/ui'
import { Launchpad, setupLaunchpad, } from '@ample-launchpad/client';
import { LivepeerProvider } from '@ample-launchpad/core';
import { useEffect, useState } from 'react';
import { setupWalletSelector, WalletSelector } from '@near-wallet-selector/core';
import { setupMyNearWallet } from '@near-wallet-selector/my-near-wallet';
import { setupModal, WalletSelectorModal } from '@near-wallet-selector/modal-ui';

export default function Home() {
	const [launchpad, setLaunchpad] = useState<Launchpad | null>(null)
	const [selector, setSelector] = useState<WalletSelector | null>(null)
	const [isSignedIn, setIsSignedIn] = useState<boolean>(false)
	const [modal, setModal] = useState<WalletSelectorModal | null>(null)

	useEffect(() => {
		initSelector()
	}, [])

	useEffect(() => {
		if (isSignedIn) {
			initLaunchpad()
		} else {
			setLaunchpad(null)
		}
	}, [isSignedIn])

	const initSelector = async () => {
		const selector = await setupWalletSelector({
			network: 'testnet',
			modules: [
				setupMyNearWallet()
			]
		})

		const modal = setupModal(selector, {
			// workaround this?
			contractId: 'treasury.test.testnet'
		})

		selector.on('signedIn', (_) => {
			setIsSignedIn(true)
		})

		selector.on('signedOut', (_) => {
			setIsSignedIn(false)
		})

		setSelector(selector)
		setModal(modal)
	}

	const initLaunchpad = async () => {
		if (!selector) return

		// get a provider
		const provider = new LivepeerProvider({ apiKey: 'someapikey' })

		// assert user is logged in
		const wallet = await selector.wallet()

		// setup launchpad
		const launchpad = await setupLaunchpad({
			network: 'testnet',
			provider,
			wallet,
			serverUrl: 'https://localhost:5000',
			treasuryAddress: 'treasury.test.testnet',
			seriesAddress: 'series.test.testnet',
		})

		setLaunchpad(launchpad)
	}

	return (
		<>
			{launchpad
				? <AmpleLaunchpadProvider launchpad={launchpad}>
					<h1>Hello world</h1>
					<Launch />
				</AmpleLaunchpadProvider>
				: <button onClick={() => modal?.show()}>Connect Wallet</button>
			}
		</>
	);
}
