import { getSignerFromWalletSelector, IProvider, Networks, Series, Treasury } from "@ample-launchpad/core";
import { IContracts, Launchpad } from "../launchpad";
import { Wallet } from "@near-wallet-selector/core";


export interface ISetupProps {
	/** 
		* NEAR protocol networks: 'mainnet' | 'testnet' 
	*/
	network: Networks,
	/**
		* @near-wallet-selector Wallet  
	*/
	wallet: Wallet,
	/** 
		* The desired Ample Launchpad provider 
	*/
	provider: IProvider,
	/** 
		* The url of the Ample Launchpad compliant server 
	*/
	serverUrl: string,
	/** 
		* The deployed Ample Launchpad Treasury contract address 
	*/
	treasuryAddress: string,
	/** 
		* The deployed Ample Launchpad Series contract address 
	*/
	seriesAddress: string,
}

/**
	* Initializes the launchpad, handles signer creation and returns a base Launchpad object 
*/
export const setupLaunchpad = async ({
	network,
	wallet,
	provider,
	serverUrl,
	treasuryAddress,
	seriesAddress
}: ISetupProps): Promise<Launchpad> => {

	const signer = await getSignerFromWalletSelector({ network, wallet })

	const contracts: IContracts = {
		treasury: new Treasury(signer, treasuryAddress),
		series: new Series(signer, seriesAddress),
	}

	return new Launchpad(serverUrl, wallet, contracts, provider)
}
