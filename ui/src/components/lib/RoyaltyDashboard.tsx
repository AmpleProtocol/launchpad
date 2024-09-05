import { useEffect, useMemo, useState } from "react"
import { JsonSerie } from "@ample-launchpad/core"
import { TimeRange } from "@ample-launchpad/client"
import { Box, Button, Flex, Grid, Image, Text } from "theme-ui"
import { useLaunchpad } from "../../context"
import AnalyticsChart from "./AnalyticsChart"
import { IAnalytic } from "../../types/analytic.type"

interface IRoyaltyDashboardProps {
	collection: JsonSerie
}
export const RoyaltyDashboard: React.FC<IRoyaltyDashboardProps> = ({ collection }) => {
	const { contracts, getAnalytics } = useLaunchpad()
	const [ownedCount, setOwnedCount] = useState<number | undefined>()
	const [analytics, setAnalytics] = useState<IAnalytic[] | undefined>()
	const [royalties, setRoyalties] = useState<string | undefined>()
	const [range, setRange] = useState<TimeRange>('month')

	useEffect(() => {
		fetchOwned()
		fetchRoyalties()
	}, [])

	useEffect(() => {
		fetchAnalytics()
	}, [range])

	const fetchOwned = async () => {
		const owned = await contracts.series.nftTokensForOwner(collection.series_id)
		setOwnedCount(owned.length)
	}

	const fetchAnalytics = async () => {
		const res = await getAnalytics(range, collection.content_id)
		setAnalytics(res.data.data?.analytics)
	}

	const fetchRoyalties = async () => {
		const _royalties = await contracts.treasury.calculateRoyalties(collection.content_id)

		setRoyalties(_royalties.toFixed(2))
	}

	const analyticsAvailable = useMemo<boolean>(() => {
		if (!analytics) return false
		if (analytics.length == 0) return false
		if (analytics[0].streams == 0) return false
		return true
	}, [analytics])

	return <Grid columns={['1fr 4fr']}>
		<Box>
			<Image
				sx={{ width: '100%', boxShadow: '0 2px 15px #a4a4a4', borderRadius: '10px' }}
				src={collection.metadata.media}
				alt={`${collection.metadata.title} image`}
			/>
			<Text sx={{ display: 'block', fontSize: '30px', marginBottom: '10px' }}>
				{collection.metadata.title}
			</Text>
			<Text sx={{ display: 'block', fontSize: '15px', marginBottom: '10px' }}>
				{collection.metadata.description}
			</Text>
			<Text sx={{ display: 'block', fontSize: '20px', fontWeight: 400 }}>
				Owned: {ownedCount}/{collection.metadata.copies}
			</Text>
		</Box>
		<Flex sx={{ flexDirection: 'column', justifyContent: 'space-between' }}>
			<Box sx={{ flexGrow: 1, marginBottom: '10px' }}>
				{/* time range buttons */}
				<Flex sx={{ justifyContent: 'end' }}>
					<Button
						variant='transparent'
						sx={{ color: range == 'day' ? 'primary' : 'lightgrey' }}
						onClick={() => setRange('day')}>D</Button>
					<Button
						variant='transparent'
						sx={{ color: range == 'week' ? 'primary' : 'lightgrey' }}
						onClick={() => setRange('week')}>W</Button>
					<Button
						variant='transparent'
						sx={{ color: range == 'month' ? 'primary' : 'lightgrey' }}
						onClick={() => setRange('month')}>M</Button>
					<Button
						variant='transparent'
						sx={{ color: range == 'year' ? 'primary' : 'lightgrey' }}
						onClick={() => setRange('year')}>Y</Button>
				</Flex>
				{
					analyticsAvailable
						? <Box>
							{/* chart */}
							<AnalyticsChart analytics={analytics!} />
						</Box>
						: <Flex sx={{
							width: '100%',
							height: '100%',
							justifyContent: 'center',
							alignItems: 'center'
						}}>
							<Text sx={{ color: '#b5b5b5' }}>No analytics to display</Text>
						</Flex>
				}
			</Box>
			{
				Number(royalties) > 0 &&
				<Box>
					<Box sx={{ marginY: '10px' }}>
						<Text sx={{ fontSize: '20px', fontWeight: 500 }}>Available to claim: {royalties} NEAR</Text>
					</Box>
					<Button onClick={() => contracts.treasury.claimRoyalties(collection.content_id)}>Claim</Button>
				</Box>
			}
		</Flex>
	</Grid >
}
