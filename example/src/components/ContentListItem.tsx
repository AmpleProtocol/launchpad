import { IContent } from "@ample-launchpad/client"
import { useLaunchpad } from "@ample-launchpad/ui"
import { JsonToken } from "@ample-launchpad/core"
import { useEffect, useState } from "react"
import { FaPlay } from "react-icons/fa"
import { utils } from 'near-api-js'
import { useModal } from "@/context/ModalContext"

interface IProps {
	content: IContent,
	owned: boolean
}
export default function ContentListItem({ content, owned }: IProps) {
	const { contracts } = useLaunchpad()
	const { setContent } = useModal()
	const [collection, setCollection] = useState<JsonToken | null>(null)

	useEffect(() => {
		fetchCollection()
	}, [])

	// fetch collection data
	const fetchCollection = async () => {
		const serie = await contracts.series.getSeriesDetails(content.collectionId)
		setCollection(serie)
	}

	const onClick = () => {
		if (!collection) return
		if (owned) {
			// open player 
			setContent(content)
		} else {
			// mint nft
			contracts.series.mint(collection.series_id)
		}
	}

	if (!collection) return null

	return <div onClick={onClick} className="play-card">
		{collection && <img style={{ maxHeight: 200 }} src={collection.metadata.media} alt={collection.metadata.title} />}

		{/* <p style={{ fontWeight: 600, fontSize: '25px', margin: '10px 0' }}>{content.title}</p> */}
		<p>{content.title}</p>

		{
			owned
				? <button><FaPlay style={{ textShadow: '1px 1px 6px black' }} /></button>
				: <button style={{ fontSize: '24px' }}>{utils.format.formatNearAmount(collection?.price)} NEAR</button>
		}
	</div>
}
