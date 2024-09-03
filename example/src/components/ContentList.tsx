import { IContent } from "@ample-launchpad/client"
import { useLaunchpad } from "@ample-launchpad/ui"
import { useEffect, useState } from "react"
import ContentListItem from "./ContentListItem"

export default function ContentsList() {
	const { getContents, contracts } = useLaunchpad()
	const [ownedSeries, setOwnedSeries] = useState<number[]>([])
	const [contents, setContents] = useState<IContent[]>([])

	useEffect(() => {
		fetchOwnedSeries()
		fetchContents()
	}, [])

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

	const fetchOwnedSeries = async () => {
		const _series = await contracts.series.nftSeriesForOwner('royalty')
		setOwnedSeries(_series.map(s => s.series_id))
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

	return <div style={{ display: 'flex' }}>
		{contents.map((content, index) => <ContentListItem owned={ownedSeries.includes(content.collectionId)} content={content} key={index} />)}
	</div>
}
