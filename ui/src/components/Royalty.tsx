import { useEffect, useState } from "react"
import { useLaunchpad } from "../context"
import { Box, Grid, GridProps } from "theme-ui"
import { RoyaltyListItem } from "./lib/RoyaltyListItem"
import { RoyaltyDashboard } from "./lib/RoyaltyDashboard"
import { JsonSerie } from "@ample-launchpad/core"

/**
	* Royalties management component
*/
export const Royalty: React.FC<GridProps> = (props) => {
	const { contracts } = useLaunchpad()
	const [collections, setCollections] = useState<JsonSerie[] | undefined>()
	const [selectedCollection, setSelectedCollection] = useState<JsonSerie | undefined>()

	useEffect(() => {
		fetchCollections()
	}, [])

	useEffect(() => {
		if (collections) {
			setSelectedCollection(collections[0])
		}
	}, [collections])

	const fetchCollections = async () => {
		try {
			const _collections = await contracts.series.nftSeriesForOwner('royalty')
			setCollections(_collections)
		} catch (error) {
			console.error(error)
		}
	}

	if (!collections) return null

	return <Grid {...props} columns={['1fr 3fr']}>
		<Box>
			{collections.map((collection, index) => <RoyaltyListItem
				key={index}
				collection={collection}
				onClick={() => setSelectedCollection(collection)}
				isSelected={!!selectedCollection && selectedCollection.content_id === collection.content_id}
			/>)}
		</Box>
		<Box>
			{selectedCollection && <RoyaltyDashboard collection={selectedCollection} />}
		</Box>
	</Grid>
}
