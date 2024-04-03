import { Series, Treasury } from "../contracts";
import { IProvider, ISigner } from "../types";

/**
	* Main function, this is intended to be called at the very beginning of
	* the implementation
*/
export const setupLaunchpad = async (provider: IProvider, signer: ISigner) => {
	// 1. create contract instances
	const treasury = new Treasury(signer, '')
	const series = new Series(signer, '')
}

export * from './getSigner'
