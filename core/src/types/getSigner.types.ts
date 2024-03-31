import { Wallet } from "@near-wallet-selector/core"
import { QueryResponseKind } from "near-api-js/lib/providers/provider";

export interface IContractMethodParams {
	contractId: string,
	method: any,
	args: any,
	gas?: string,
	deposit?: string
}

type Networks = 'mainnet' | 'testnet';

export interface IServerSideProps {
	/**
		* Desired env network
	*/
	network: Networks,
	/**
		* Private key for the near account to be used
	*/
	privateKey: string,
	/**
		* NEAR account ID for the private key provided
	*/
	accountId: string
}

export interface IWalletSelectorProps {
	/**
		* Desired env network
	*/
	network: Networks,
	/**
		* Wallet Selector Wallet
	*/
	wallet: Wallet,
}

export interface IQueryResponseKindCustom extends QueryResponseKind {
	/**
		* Polyfilled field
	*/
	result: any,
}

export function isServerSideProps(obj: any): obj is IServerSideProps {
	if (obj.network != 'mainnet' && obj.network != 'testnet') return false
	if (!obj.privateKey || !obj.accountId) return false
	return true
}
