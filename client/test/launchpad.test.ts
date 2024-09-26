import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { Launchpad, setupLaunchpad } from '../src'
import { server } from './mocks/server'
import { contents } from './fixtures/contents'
import { ACCOUNT_ID } from './fixtures/nearAccount'
import { Contract } from '@ample-launchpad/core'

const SERVER_URL = 'https://mock.com'

describe('Launchpad', async () => {
	beforeAll(() => server.listen())
	afterAll(() => server.close())

	// setup launchpad here
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

	it('should get an instance created', () => {
		expect(launchpad).toBeInstanceOf(Launchpad)
	})

	it('should get all of the contents', async () => {
		const res = await launchpad.getContents()

		expect(res.data.success).toEqual(true)
		expect(res.data.data).toEqual(contents)
	})

	it('should get a single content', async () => {
		const res = await launchpad.getContent(contents[0].id)

		expect(res.data.success).toEqual(true)
		expect(res.data.data).toEqual(contents[0])
	})

	it('should retrieve analytics', async () => {
		const res = await launchpad.getAnalytics('day', contents[0].id)

		expect(res.data.success).toEqual(true)
		expect(res.data.data?.analytics.length).toBeGreaterThan(0)
		expect(res.data.data?.totalGenerated).toBeGreaterThan(0)
		expect(res.data.data?.rentalGenerated).toBeGreaterThan(0)
		expect(res.data.data?.royaltyGenerated).toBeGreaterThan(0)
		expect(res.data.data?.streamsCount).toBeGreaterThan(0)
	})

	it('should create a new content', async () => {
		const res = await launchpad.createContent({
			owner: 'someone.testnet',
			title: 'The Smurfs',
			description: 'The smurfs movie',
			mediaUrl: 'https://picsum.photos/500',
			royaltyCollection: {
				price: '40',
				totalSupply: 50000,
				treasuryRoyalty: {
					owner: 50,
					holders: 50
				}
			},
			rentalCollection: {
				price: '4',
				validPeriodMs: 8645000,
			}
		})

		expect(res.data.success).toEqual(true)
		expect(res.data.data?.tusEndpoint).toBeTruthy()
		expect(res.data.data?.contentId).toBeTruthy()
		expect(res.data.data?.uploadEndpoint).toBeTruthy()
		expect(res.data.data?.rentalCollectionId).toBeTruthy()
		expect(res.data.data?.royaltyCollectionId).toBeTruthy()
	})

	it('should have contracts created properly', () => {
		expect(launchpad.contracts.series.address).toEqual('series.mock.testnet')
		expect(launchpad.contracts.treasury.address).toEqual('treasury.mock.testnet')
		expect(launchpad.contracts.treasury).toBeInstanceOf(Contract)
		expect(launchpad.contracts.series).toBeInstanceOf(Contract)
	})
})
