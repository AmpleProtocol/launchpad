import { IWalletSelectorProps, IServerSideProps, IQueryResponseKindCustom, ISigner } from "../types";
import { Account, KeyPair, connect } from "near-api-js";
import { InMemoryKeyStore } from "near-api-js/lib/key_stores";
import { JsonRpcProvider } from "near-api-js/lib/providers";

/**
	* Ideal for server side usage
*/
export const getSignerFromPrivateKey = async ({ network, accountId, privateKey }: IServerSideProps): Promise<ISigner> => {
	// Create signer using keypair and accounts from near-api-js for server side usage
	const _pk = KeyPair.fromString(privateKey)
	const keyStore = new InMemoryKeyStore()
	await keyStore.setKey(network, accountId, _pk)

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
		address: account.accountId,
		view({ contractId, method, args }) {
			return account.viewFunction({
				contractId,
				methodName: method,
				args,
			})
		},
		call({ contractId, method, args, gas, deposit }) {
			return account.functionCall({
				contractId,
				methodName: method,
				args,
				gas,
				attachedDeposit: deposit
			})
		}
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
		address: account.accountId,
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

		}
	}
}
