import { IContent } from "@ample-launchpad/client"
import { useLaunchpad } from "@ample-launchpad/ui"
import { useEffect, useState } from "react"
import ContentListItem from "./ContentListItem"

export default function ContentsList() {
	const { getContents, contracts } = useLaunchpad()
	const [ownedRoyalty, setOwnedRoyalty] = useState<number[]>([])
	const [contents, setContents] = useState<IContent[]>([])

	useEffect(() => {
		fetchOwnedSeries()
		fetchContents()
	}, [])

	const fetchOwnedSeries = async () => {
		const _ownedRoyalty = await contracts.series.nftSeriesForOwner('royalty')
		console.log({ _ownedRoyalty })
		setOwnedRoyalty(_ownedRoyalty.map(s => s.series_id))
	}

	const fetchContents = async () => {
		try {
			const res = await getContents()
			if (!res.data.data) return
			if (!res.data.success) throw new Error(res.data.message)

			setContents(res.data.data)
		} catch (error) {
			console.error(error)
		}
	}

	if (contents.length == 0) return <div
		style={{
			height: '500px',
			width: '100%',
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
			color: '#b5b5b5'
		}}
	>
		No contents available
	</div>

	return <div>
		<div style={{ display: 'flex', flexWrap: 'wrap' }}>
			{contents.map((content, index) => <ContentListItem
				owned={ownedRoyalty.includes(content.royaltyCollectionId)}
				content={content}
				key={index}
			/>)}
		</div>
	</div>
}
