import { describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { AmpleLaunchpadProvider, Launch } from '../src'
import { setupLaunchpad } from '@ample-launchpad/client'
import { ACCOUNT_ID } from './fixtures/nearAccount'
import { SERVER_URL } from './fixtures/serverUrl'


describe('Launch component', async () => {
	const launchpad = await setupLaunchpad({
		network: 'testnet',
		treasuryAddress: 'treasury.mock.testnet',
		seriesAddress: 'series.mock.testnet',
		serverUrl: SERVER_URL,
		wallet: {
			// @ts-ignore
			getAccounts() {
				return [{
					// @ts-ignore
					accountId: ACCOUNT_ID,
					publicKey: undefined
				}]
			},
			// @ts-ignore
			signAndSendTransactions(_: any) {
				return null
			}
		}
	})

	it('should render properly', () => {
		render(
			<AmpleLaunchpadProvider launchpad={launchpad}>
				<Launch />
			</AmpleLaunchpadProvider>
		)

		expect(screen.getByText('Content')).toBeInTheDocument()
		expect(screen.getByText('Title')).toBeInTheDocument()
		expect(screen.getByText('Royalty NFT')).toBeInTheDocument()
		expect(screen.getByText('Rental NFT')).toBeInTheDocument()
	})

	it('should have access to current logged in accountId', async () => {
		render(
			<AmpleLaunchpadProvider launchpad={launchpad}>
				<Launch />
			</AmpleLaunchpadProvider>
		)

		const ownerInput = screen.getByLabelText('Owner')

		expect(ownerInput).toBeInTheDocument()
		expect(ownerInput).toHaveValue('')

		await waitFor(() => {
			expect(ownerInput).toHaveValue(ACCOUNT_ID)
		})
	})
})
