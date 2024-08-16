import { IWalletSelectorProps, IServerSideProps, IQueryResponseKindCustom, ISigner } from "../types";
import { Account, KeyPair, connect } from "near-api-js";
import { JsonRpcProvider } from "near-api-js/lib/providers";
import { InMemoryKeyStore } from "near-api-js/lib/key_stores";

/**
	* Ideal for server side usage
*/
export const getSignerFromPrivateKey = async ({ network, accountId, privateKey }: IServerSideProps): Promise<ISigner> => {
	if (typeof window !== 'undefined') {
		throw new Error('getSignerFromPrivateKey() is not available in the browser, try using getSignerFromWalletSelector() instead')
	}

	// Create signer using keypair and accounts from near-api-js for server side usage
	const keyPair = KeyPair.fromString(privateKey)
	const keyStore = new InMemoryKeyStore()
	await keyStore.setKey(network, accountId, keyPair)

	const nearConnection = await connect({
		networkId: network,
		keyStore: keyStore,
		nodeUrl: `https://rpc.${network}.near.org`,
		walletUrl: `https://wallet.${network}.near.org`,
		helperUrl: `https://helper.${network}.near.org`,
	})
	const account = new Account(nearConnection.connection, accountId)

	// Return a signer
	return {
		accountId: account.accountId,
		view({ contractId, method, args }) {
			return account.viewFunction({
				contractId,
				methodName: method,
				args,
			})
		},
		call({ contractId, method, args, gas, deposit }) {
			const _gas = gas ? BigInt(gas) : undefined
			const attachedDeposit = deposit ? BigInt(deposit) : undefined
			return account.functionCall({
				contractId,
				methodName: method,
				args,
				attachedDeposit,
				gas: _gas,
			})
		},
	}
}

/**
	* Created to facilitate integration with @near-wallet-selector
*/
export const getSignerFromWalletSelector = async ({ network, wallet }: IWalletSelectorProps): Promise<ISigner> => {
	// Create signer using wallet selector tools and interfaces
	// Define a custom provider to view calls
	const provider = new JsonRpcProvider({ url: `https://rpc.${network}.near.org` })

	// Get account connected 
	const accounts = await wallet.getAccounts()
	const account = accounts[0]

	// Return a new signer
	return {
		accountId: account.accountId,
		async view({ contractId, method, args }) {
			const res = await provider.query<IQueryResponseKindCustom>({
				request_type: 'call_function',
				account_id: contractId,
				method_name: method,
				args_base64: Buffer.from(JSON.stringify(args)).toString('base64'),
				finality: 'optimistic',
			});
			return JSON.parse(Buffer.from(res.result).toString());
		},
		call({ contractId, method, args, gas, deposit }) {
			if (!gas || !deposit) throw new Error('Must attach gas and deposit')
			return wallet.signAndSendTransaction({
				signerId: account.accountId,
				receiverId: contractId,
				actions: [
					{
						type: 'FunctionCall',
						params: {
							methodName: method,
							args,
							gas,
							deposit,
						},
					},
				],
			});
		},
	}
}
