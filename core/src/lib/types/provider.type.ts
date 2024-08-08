export interface IJwtProps {
	jwtPrivateKey: string,
	jwtPublicKey: string,
	referenceId: string,
	issuer: string,
	metadata: any
}

export interface ICreateAssetResult {
	assetId: string,
	playbackId: string,
	tusEndpoint: string,
	uploadEndpoint: string,
}

export interface IProvider {
	/**
		* Forms the streaming url (hls) for a given referenceId, a jwt can be 
		* included for token gated contents
		* @param referenceId - the reference id of the asset to be streamed
		* @param jwt - The jwt for accessing tokengated contents
	*/
	getStreamingUrl(referenceId: string, jwt?: string): string,

	/**
		* Creates a new asset, ready to be loaded with the actual file
	*/
	createAsset(title: string): Promise<ICreateAssetResult>,

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
