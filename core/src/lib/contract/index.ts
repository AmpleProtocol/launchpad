import { FinalExecutionOutcome } from '@near-wallet-selector/core';
import { ISigner } from '../../types/signer.type';

const THIRTY_TGAS = '30000000000000';
const NO_DEPOSIT = '0';

export class Contract {
	address: string;
	protected signer: ISigner

	constructor(signer: ISigner, contractAddress: string) {
		this.signer = signer;
		this.address = contractAddress;
	}

	protected view<T>(method: string, args: any): Promise<T> {
		return this.signer.view({
			contractId: this.address,
			method,
			args,
		})
	}

	protected call<T>(method: string, args: any, gas = THIRTY_TGAS, deposit = NO_DEPOSIT): Promise<T | void | FinalExecutionOutcome> {
		return this.signer.call({
			contractId: this.address,
			method,
			args,
			gas,
			deposit
		})
	}
}
