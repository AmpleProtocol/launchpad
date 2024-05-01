import { FinalExecutionOutcome } from "@near-wallet-selector/core";
import { IContractMethodParams } from "./getSigner.types";

export interface ISigner {
	/** Signer address */
	address: string,

	/** Isomorphic view function call */
	view<T = any>(props: IContractMethodParams): Promise<T>,

	/** Isomorphic function call */
	call(props: IContractMethodParams): Promise<void | FinalExecutionOutcome>,

	/** Signs the given message and returns the signature as string */
	sign(message: string, callbackUrl?: string): Promise<string | void>,

	/** Verifies that the signature corresponds to the message */
	verifySignature(message: string, signature: string, callbackUrl?: string): Promise<boolean>
}
