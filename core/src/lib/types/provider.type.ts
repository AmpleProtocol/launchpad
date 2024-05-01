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
		* @returns - The referenceId for that asset
	*/
	upload(
		title: string,
		filename: string,
		asset: File,
		collectionId: string,
		onError?: (error: Error | DetailedError) => void,
		onProgress?: (bytesUploaded: number, byptesTotal: number) => void,
		onSuccess?: () => void
	): Promise<string>,

	/**
		* Retrieves viewcount for a given content
		* @param referenceId - Reference of the content for viewership metrics to be retrieved from
		* @param from - Starting date
		* @param to - Ending date 
	*/
	retrieveViewcount(
		referenceId: string,
		from?: Date,
		to?: Date
	): Promise<number>,

	/**
		* Creates a jwt for tokengated access 
		* @param jwtPrivateKey - The private key used to sign the token
		* @param jwtPublicKey - Public key corresponding to the private key
		* @param referenceId - The reference id of the asset you are restricting access to
		* @param issuer - The issuer of the token
		* @param metadata - Custom data added to the token
	*/
	createJwt(
		jwtPrivateKey: string,
		jwtPublicKey: string,
		referenceId: string,
		issuer: string,
		metadata: any
	): Promise<string>
}
