import { DetailedError } from "tus-js-client"

export interface IJwtProps {
	jwtPrivateKey: string,
	jwtPublicKey: string,
	referenceId: string,
	issuer: string,
	metadata: any
}

export interface IProvider {
	/**
		* Upload a new tokengated asset
	*/
	upload(
		title: string,
		filename: string,
		asset: File,
		onError?: (error: Error | DetailedError) => void,
		onProgress?: (bytesUploaded: number, byptesTotal: number) => void,
		onSuccess?: () => void
	): Promise<any>,

	/**
		* Retrieves viewcount for a given content
		* @param referenceId - Reference of the content for viewership metrics to be retrieved from
	*/
	retrieveViewcount(
		referenceId: string,
		from?: Date,
		to?: Date
	): Promise<number>,

	/**
		* Creates a jwt for tokengated access 
	*/
	createJwt(
		jwtPrivateKey: string,
		jwtPublicKey: string,
		referenceId: string,
		issuer: string,
		metadata: any
	): Promise<string>
}
