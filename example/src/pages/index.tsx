import { useEffect, useState } from 'react';
import { AmpleLaunchpadProvider } from '@ample-launchpad/ui'
import { Launchpad, setupLaunchpad, } from '@ample-launchpad/client';
import { setupWalletSelector, WalletSelector } from '@near-wallet-selector/core';
import { setupMyNearWallet } from '@near-wallet-selector/my-near-wallet';
import { setupModal, WalletSelectorModal } from '@near-wallet-selector/modal-ui';
import { Content } from '@/components/Content';
import SignIn from '@/components/SignIn';

export default function Home() {
	const [selector, setSelector] = useState<WalletSelector | null>(null)
	const [launchpad, setLaunchpad] = useState<Launchpad | null>(null)
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

		const account = selector.store.getState().accounts[0]
		if (account) setIsSignedIn(true)

		const modal = setupModal(selector, {
			// workaround this?
			contractId: 'treasury4.calabaza.testnet'
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

		// assert user is logged in
		const wallet = await selector.wallet()

		// setup launchpad
		const launchpad = await setupLaunchpad({
			network: 'testnet',
			wallet,
			serverUrl: 'https://localhost:5000',
			treasuryAddress: 'treasury4.calabaza.testnet',
			seriesAddress: 'nftseries2.calabaza.testnet',
		})

		setLaunchpad(launchpad)
	}

	return (
		<>
			{launchpad
				? <AmpleLaunchpadProvider launchpad={launchpad}>
					<Content />
				</AmpleLaunchpadProvider>
				: <SignIn modal={modal!} />
			}
		</>
	);
}
