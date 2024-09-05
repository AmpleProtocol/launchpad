import { WalletSelectorModal } from "@near-wallet-selector/modal-ui"

interface IProps {
	modal: WalletSelectorModal
}
export default function SignIn({ modal }: IProps) {
	return <div
		style={{
			width: '100%',
			height: '80vh',
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center'
		}}
	>
		<div>
			<button
				style={{
					fontSize: '30px',
					color: "white",
					padding: '15px',
					backgroundColor: 'darkslategray',
					border: '1px solid lightgrey',
					borderRadius: '15px',
					boxShadow: '5px 5px 10px lightgrey',
					cursor: 'pointer',
				}}
				onClick={() => modal.show()}
			>
				Connect Wallet
			</button>
			<p style={{ textAlign: 'center' }}>Connect a wallet to proceed</p>
		</div>
	</div>
}
