import { describe, expect, it } from 'vitest'
import { getSignerFromPrivateKey, getSignerFromWalletSelector } from '../src'
import { ACCOUNT_ID, PRIVATE_KEY } from './fixtures/nearAccount'

describe('getSignerFromPrivateKey', async () => {
	const greeting = Date.now().toString()

	const signer = await getSignerFromPrivateKey({
		network: 'testnet',
		accountId: ACCOUNT_ID,
		privateKey: PRIVATE_KEY
	})

	it('creates a signer from private key', () => {
		expect(signer.accountId).toEqual(ACCOUNT_ID)
		expect(signer).toHaveProperty('view')
		expect(signer).toHaveProperty('call')
	})

	it('calls methods properly', async () => {
		// this call will be intercepted by msw
		const res = await signer.call({
			contractId: `contract.${ACCOUNT_ID}`,
			method: 'set_greeting',
			args: {
				greeting
			},
		})

		expect(res).toBeTruthy()
	})

	it('views methods properly', async () => {
		const res = await signer.view({
			contractId: `contract.${ACCOUNT_ID}`,
			method: 'get_greeting',
			args: undefined
		})

		expect(res).toEqual(greeting)
	})
})

describe('getSignerFromWalletSelector', () => {
	it('creates a signer from wallet selector instance', async () => {
		// this ofc should use a real wallet selector implementation as described in README.md file
		const _mockWallet = {
			getAccounts() {
				return [{
					accountId: ACCOUNT_ID,
					publicKey: undefined
				}]
			},
			signAndSendTransactions(_: any) {
				return null
			}
		}

		const signer = await getSignerFromWalletSelector({
			network: 'testnet',
			// @ts-ignore
			wallet: _mockWallet
		})

		expect(signer.accountId).toEqual(ACCOUNT_ID)
		expect(signer).toHaveProperty('view')
		expect(signer).toHaveProperty('call')
	})
})


