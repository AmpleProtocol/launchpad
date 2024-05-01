import { IWalletSelectorProps, IServerSideProps, IQueryResponseKindCustom, ISigner } from "../types";
import { Account, KeyPair, connect } from "near-api-js";
import { InMemoryKeyStore } from "near-api-js/lib/key_stores";
import { verifySignature, verifyFullKeyBelongsToUser } from "@near-wallet-selector/core";
import { JsonRpcProvider } from "near-api-js/lib/providers";
import { stringToUint8Array, uint8ArrayToBase64 } from "../utils";

const RECIPIENT = 'noway.testnet'
const NONCE = Buffer.from(crypto.getRandomValues(new Uint8Array(32)));

/**
	* Ideal for server side usage
*/
export const getSignerFromPrivateKey = async ({ network, accountId, privateKey }: IServerSideProps): Promise<ISigner> => {
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
		},
		async sign(message) {
			const msgAsBytes = stringToUint8Array(message)
			const sig = keyPair.sign(msgAsBytes)
			const sigAsString = uint8ArrayToBase64(sig.signature)
			return sigAsString
		},
		async verifySignature(message, signature) {
			const msgAsBytes = stringToUint8Array(message)
			const sigAsBytes = stringToUint8Array(signature)
			const isValid = keyPair.verify(msgAsBytes, sigAsBytes)

			return isValid
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
		},
		async sign(message, callbackUrl) {
			if (!wallet.signMessage) {
				throw new Error(`${wallet.metadata.name} doesn't support signing methods through signMessage() method, consider using a different wallet for wallet-selector`)
			}

			if (wallet.type === "browser") {
				localStorage.setItem(
					"message",
					JSON.stringify({
						message,
						nonce: [...NONCE],
						recipient: RECIPIENT,
						callbackUrl: callbackUrl || location.href,
					})
				);
			}

			const res = await wallet.signMessage({
				message,
				nonce: NONCE,
				recipient: RECIPIENT,
				callbackUrl: callbackUrl || location.href
			});

			if (res) return res.signature
		},

		async verifySignature(message, signature, callbackUrl) {
			if (!account.publicKey) throw new Error('No publicKey found')

			return verifySignature({
				message,
				nonce: NONCE,
				recipient: RECIPIENT,
				publicKey: account.publicKey,
				signature,
				callbackUrl: callbackUrl || location.href,
			});
		},
	}
}
