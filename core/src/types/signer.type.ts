import { FinalExecutionOutcome } from "@near-wallet-selector/core";
import { IContractMethodParams } from "./getSigner.types";

export interface ISigner {
	address: string,
	view<T = any>(props: IContractMethodParams): Promise<T>,
	call<T = any>(props: IContractMethodParams): Promise<T | void | FinalExecutionOutcome>,
}
