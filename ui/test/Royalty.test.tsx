import { setupLaunchpad } from "@ample-launchpad/client";
import { describe, expect, it } from "vitest";
import { SERVER_URL } from "./fixtures/serverUrl";
import { render, screen } from "@testing-library/react";
import { AmpleLaunchpadProvider, Royalty } from "../src";
import { ACCOUNT_ID } from "./fixtures/nearAccount";

describe('Royalty component', async () => {
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

	it('should render properly', async () => {
		render(
			<AmpleLaunchpadProvider launchpad={launchpad}>
				<Royalty />
			</AmpleLaunchpadProvider>
		)

		expect(screen.getByText("You don't own any launchpad NFT yet")).toBeInTheDocument()
	})
})
