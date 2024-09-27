import { setupLaunchpad } from "@ample-launchpad/client";
import { describe, expect, it } from "vitest";
import { SERVER_URL } from "./fixtures/serverUrl";
import { ACCOUNT_ID } from "./fixtures/nearAccount";
import { render, screen } from "@testing-library/react";
import { AmpleLaunchpadProvider, Player } from "../src";
import { contents } from "./fixtures/contents";

describe('Player component', async () => {
	const wallet = {
		getAccounts() {
			return [{
				// @ts-ignore
				accountId: ACCOUNT_ID,
				publicKey: undefined
			}]
		},
		signAndSendTransactions(_: any) {
			return null
		},
		signMessage(_: any) {
			return null
		}
	}

	const launchpad = await setupLaunchpad({
		network: 'testnet',
		treasuryAddress: 'treasury.mock.testnet',
		seriesAddress: 'series.mock.testnet',
		serverUrl: SERVER_URL,
		// @ts-ignore 
		wallet
	})

	it('should render properly', () => {
		render(
			<AmpleLaunchpadProvider launchpad={launchpad}>
				<Player title="Shrek" contentId={contents[0].id} />
			</AmpleLaunchpadProvider>
		)

		// spinner
		expect(screen.getByRole('img')).toBeInTheDocument()
	})
})
