import { Series, Treasury } from '@ample-launchpad/core'
import axios, { Axios } from 'axios'
import { IContent, ICreateContentParams, IGetJwtParams } from '../types/launchpad.types'
import { Wallet } from '@near-wallet-selector/core'

export type TimeRange = 'day' | 'week' | 'month' | 'year'
export interface IContracts {
	treasury: Treasury,
	series: Series,
}
interface IServerResponse<T = any> {
	success: boolean,
	data?: T,
	message?: string
}

/**
	* Main class of the module
*/
export class Launchpad {
	private axios: Axios

	constructor(
		serverUrl: string,
		public wallet: Wallet,
		public contracts: IContracts,
	) {
		this.axios = axios.create({
			baseURL: serverUrl,
		})
		// bound 'this' context for preventing context changing when deconstructing 
		// methods
		this.createContent = this.createContent.bind(this)
		this.getJwt = this.getJwt.bind(this)
		this.getContents = this.getContents.bind(this)
		this.getContent = this.getContent.bind(this)
		this.getAnalytics = this.getAnalytics.bind(this)
	}

	/**
		* Deploys a collection, creates the provider asset and the db record 
	*/
	createContent(body: ICreateContentParams) {
		return this.axios.post<IServerResponse<{
			contentId: string,
			collectionId: string,
			tusEndpoint: string,
			uploadEndpoint: string
		}>>('/api/content', body)
	}

	/**
		* Creates a new JWT that allows the user to stream a given content.
		* In order to do so, the user must first provide a NEAR Wallet Selector
		* signature in the payload param to prove ownership over the provided 
		* publicKey.
		* See https://github.com/near/NEPs/blob/master/neps/nep-0413.md for reference
	*/
	async getJwt({ contentId, payload }: IGetJwtParams) {
		const accounts = await this.wallet.getAccounts()

		return this.axios.post<IServerResponse<{ jwt: string, streamingUrl: string }>>('/api/sign-jwt', {
			contentId,
			accountId: accounts[0].accountId,
			payload
		})
	}

	/**
		* Returns all of the contents stored in server db
	*/
	getContents() {
		return this.axios.get<IServerResponse<IContent[]>>('/api/content')
	}

	/**
		* Returns full information about a specific content 
	*/
	getContent(id: string) {
		return this.axios.get<IServerResponse<IContent>>(`/api/content/${id}`)
	}

	getAnalytics(range: TimeRange, contentId: string) {
		return this.axios.get<IServerResponse<{
			totalGenerated: number,
			streamsCount: number,
			analytics: { streams: number, timestamp: number }[]
		}>>(`/api/analytics?contentId=${contentId}&range=${range}`)
	}
}
