import { useEffect, useState } from 'react';
import { AmpleLaunchpadProvider } from '@ample-launchpad/ui'
import { Launchpad, setupLaunchpad, } from '@ample-launchpad/client';
import { setupWalletSelector, WalletSelector } from '@near-wallet-selector/core';
import { setupMyNearWallet } from '@near-wallet-selector/my-near-wallet';
import { setupModal, WalletSelectorModal } from '@near-wallet-selector/modal-ui';
import { Content } from '@/components/Content';
import SignIn from '@/components/SignIn';
import { Networks } from '@ample-launchpad/core';
import ModalContextProvider from '@/context/ModalContext';

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
			contractId: ''
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
			wallet,
			network: process.env.NEXT_PUBLIC_NEAR_NETWORK as Networks,
			serverUrl: process.env.NEXT_PUBLIC_SERVER_URL as string,
			treasuryAddress: process.env.NEXT_PUBLIC_TREASURY_CONTRACT_ADDRESS as string,
			seriesAddress: process.env.NEXT_PUBLIC_SERIES_CONTRACT_ADDRESS as string,
		})

		setLaunchpad(launchpad)
	}

	return (
		<>
			{launchpad
				? <AmpleLaunchpadProvider launchpad={launchpad} accentColor='#8e55fb'>
					<ModalContextProvider>
						<Content />
					</ModalContextProvider>
				</AmpleLaunchpadProvider>
				: <SignIn modal={modal!} />
			}
		</>
	);
}
