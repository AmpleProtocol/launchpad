export interface IProvider {
	/**
		* Upload a new tokengated asset
	*/
	upload(): Promise<any>,
}
