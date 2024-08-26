import { useEffect, useState } from "react"
import { useLaunchpad } from "../context"
import { IContent } from "@ample-launchpad/client"
import { Box, Grid } from "theme-ui"
import { RoyaltyListItem } from "./lib/RoyaltyListItem"
import { RoyaltyDashboard } from "./lib/RoyaltyDashboard"

/**
	* Royalties management component
*/
export const Royalty: React.FC = () => {
	const { getContents } = useLaunchpad()
	const [contents, setContents] = useState<IContent[] | null>(null)
	const [selectedContent, setSelectedContent] = useState<IContent | null>(null)

	useEffect(() => {
		fetchContents()
	}, [])

	useEffect(() => {
		if (contents) {
			setSelectedContent(contents[0])
		}
	}, [contents])

	const fetchContents = async () => {
		const res = await getContents()
		if (!res.data.success || !res.data.data) throw new Error(res.data.message)
		setContents(res.data.data)
	}

	if (!contents) return null

	return <Grid columns={['1fr 3fr']}>
		<Box>
			{contents.map((content, index) => <RoyaltyListItem
				key={index}
				content={content}
				onClick={() => setSelectedContent(content)}
			/>)}
		</Box>
		<Box>
			{selectedContent && <RoyaltyDashboard content={selectedContent} />}
		</Box>
	</Grid>
}
