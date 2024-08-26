import { IContent } from "@ample-launchpad/client"
import { useLaunchpad } from "@ample-launchpad/ui"
import { JsonToken } from "@ample-launchpad/core"
import { useEffect, useState } from "react"

interface IProps {
	content: IContent
}
export default function ContentListItem({ content }: IProps) {
	const { contracts } = useLaunchpad()
	const [collection, setCollection] = useState<JsonToken | null>(null)

	useEffect(() => {
		fetchCollection()
	}, [])

	// fetch collection data
	const fetchCollection = async () => {
		const serie = await contracts.series.getSeriesDetails(content.collectionId)
		setCollection(serie)
	}

	return <div>
		<div>
			{collection && <img src={collection.metadata.media} alt={collection.metadata.title} />}
		</div>

		<h2>
			{content.title}
		</h2>

		<button>Play(tbi)</button>
	</div>
}
