import { IContent } from "@ample-launchpad/client"
import { useLaunchpad } from "@ample-launchpad/ui"
import { JsonToken } from "@ample-launchpad/core"
import { useEffect, useState } from "react"
import { utils } from 'near-api-js'
import { useModal } from "@/context/ModalContext"

interface IProps {
	content: IContent,
	owned: boolean
}
export default function ContentListItem({ content, owned }: IProps) {
	const { contracts, wallet } = useLaunchpad()
	const { setContent } = useModal()
	const [validNft, setValidNft] = useState<{ tokenId: string, expires_at?: number } | null>(null)
	const [royaltyCollection, setRoyaltyCollection] = useState<JsonToken | null>(null)
	const [rentalCollection, setRentalCollection] = useState<JsonToken | null>(null)

	useEffect(() => {
		fetchRoyaltyCollection()
		if (!owned) {
			fetchRentalCollection()
			checkValidRentedNft()
		}
	}, [])

	// fetch collections data
	const fetchRoyaltyCollection = async () => {
		const _royalty = await contracts.series.getSeriesDetails(content.royaltyCollectionId)
		setRoyaltyCollection(_royalty)
	}
	const fetchRentalCollection = async () => {
		const _rental = await contracts.series.getSeriesDetails(content.rentalCollectionId)
		setRentalCollection(_rental)
	}

	const checkValidRentedNft = async () => {
		const accountId = (await wallet.getAccounts())[0].accountId
		const _validNft = await contracts.series.validNFTForContent(content.id, accountId)
		console.log({ _validNft, accountId })
		if (!_validNft) return
		setValidNft(_validNft)
	}

	return <div className="play-card">
		<img src={content.media} alt={content.title} />

		<div className="hidden-content">
			<p>{content.title}</p>

			<div className="buttons">
				{/* play button */}
				{(owned || validNft) &&
					<button onClick={() => setContent(content)}>Play</button>
				}
				{/* <span>Valid until {new Date(validNft.expires_at).toLocaleString()}</span> */}

				{/* rent button */}
				{!owned && !validNft && rentalCollection &&
					<button onClick={() => contracts.series.mint(content.rentalCollectionId)}>Rent for {utils.format.formatNearAmount(rentalCollection.price)} NEAR</button>
				}

				{/* buy button */}
				{!owned && royaltyCollection &&
					<button onClick={() => contracts.series.mint(content.royaltyCollectionId)}>Buy for {utils.format.formatNearAmount(royaltyCollection.price)} NEAR</button>
				}
			</div>
		</div>
	</div >
}
