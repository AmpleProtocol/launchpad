import { FinalExecutionOutcome } from "near-api-js/lib/providers";
import { IContractMethodParams } from "./getSigner.types";

export interface ISigner {
	/** Signer address */
	accountId: string,

	/** Isomorphic view function call */
	view<T = any>(props: IContractMethodParams): Promise<T>,

	/** Isomorphic function call */
	call(props: IContractMethodParams): Promise<void | FinalExecutionOutcome>,
}
