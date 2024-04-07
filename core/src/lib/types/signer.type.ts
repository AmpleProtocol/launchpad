import { FinalExecutionOutcome } from "@near-wallet-selector/core";
import { IContractMethodParams } from "./getSigner.types";

export interface ISigner {
	address: string,
	view<T = any>(props: IContractMethodParams): Promise<T>,
	call(props: IContractMethodParams): Promise<void | FinalExecutionOutcome>,
}
