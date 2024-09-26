import { FinalExecutionOutcome } from 'near-api-js/lib/providers';
import { ISigner } from '../types';

export const THIRTY_TGAS = '30000000000000';
export const NO_DEPOSIT = '0';

/** Base contract class, inteded to be inherited and extended */
export class Contract {
	address: string;
	protected signer: ISigner

	constructor(signer: ISigner, contractAddress: string) {
		this.signer = signer;
		this.address = contractAddress;
	}

	/** Makes a view function call to the contract */
	view<T>(method: string, args: any): Promise<T> {
		return this.signer.view({
			contractId: this.address,
			method,
			args,
		})
	}

	/** Makes a function call with gas and deposit */
	call(method: string, args: any, gas = THIRTY_TGAS, deposit = NO_DEPOSIT): Promise<void | FinalExecutionOutcome> {
		return this.signer.call({
			contractId: this.address,
			method,
			args,
			gas,
			deposit
		})
	}
}
