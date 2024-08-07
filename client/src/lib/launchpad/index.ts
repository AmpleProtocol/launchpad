import { IProvider, Series, Treasury } from '@ample-launchpad/core'
import axios, { Axios } from 'axios'
import { IContent, ICreateContentParams, IGetJwtParams } from '../types/launchpad.types'

export interface IContracts {
	treasury: Treasury,
	series: Series,
}
interface IServerResponse<T = any> {
	success: boolean,
	data: T
}

/**
	* Main class of the module
	*/
export class Launchpad {
	axios: Axios

	constructor(
		serverUrl: string,
		public contracts: IContracts,
		public provider: IProvider,
	) {
		this.axios = axios.create({
			baseURL: serverUrl,
		})
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
	getJwt({ contentId, accountId, payload }: IGetJwtParams) {
		return this.axios.post<IServerResponse<string>>('/api/sign-jwt', {
			contentId,
			accountId,
			payload
		})
	}

	/**
		* Returns all of the contents stored in server db
	*/
	getContents() {
		// todo: add query params
		return this.axios.get<IServerResponse<IContent[]>>('/api/content')
	}

	/**
		* Returns full information about a specific content 
	*/
	getContent(id: string) {
		return this.axios.get<IServerResponse<IContent>>(`/api/content/${id}`)
	}
}
