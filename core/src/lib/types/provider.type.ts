export interface IProvider {
	/**
		* Upload a new tokengated asset
	*/
	upload(): Promise<any>,
	/**
		* Retrieves viewcount for a given content
		* @param referenceId - Reference of the content for viewership metrics to be retrieved from
	*/
	retrieveViewcount(referenceId: string, from?: Date, to?: Date): Promise<number>
}
