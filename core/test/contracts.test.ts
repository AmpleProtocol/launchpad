import { describe, expect, it } from "vitest";
import { Contract } from "../src/lib/contracts/contract";
import { getSignerFromPrivateKey } from "../src";
import { ACCOUNT_ID, PRIVATE_KEY } from "./fixtures/nearAccount";

describe('Contract', async () => {
	const signer = await getSignerFromPrivateKey({
		network: 'testnet',
		accountId: ACCOUNT_ID,
		privateKey: PRIVATE_KEY
	})

	const contract = new Contract(signer, `contract.${ACCOUNT_ID}`)

	it('calls methods successfully', async () => {
		const greeting = 'some_greeting'

		const callRes = await contract.call('set_greeting', { greeting })
		expect(callRes).toBeTruthy()

		const viewRes = await contract.view('get_greeting', undefined)
		expect(viewRes).toEqual(greeting)
	})
})
