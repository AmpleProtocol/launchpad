import { JsonSerie } from "@ample-launchpad/core"
import { Box, Flex, Image, Text } from "theme-ui"

interface IRoyaltiListItemProps {
	collection: JsonSerie,
	onClick: () => any,
	isSelected: boolean
}
export const RoyaltyListItem: React.FC<IRoyaltiListItemProps> = ({ collection, isSelected, onClick }) => {
	return <Flex
		onClick={onClick}
		className="royalty-item"
		sx={{
			height: '100px',
			width: '100%',
			padding: '10px',
			cursor: 'pointer',
		}}
	>
		<Box sx={{ height: '100%', borderRadius: '10px', overflow: 'hidden' }}>
			<Image sx={{ height: '100%', width: '60px', objectFit: 'cover' }} src={collection.metadata.media} alt={`${collection.metadata.title} image`} />
		</Box>
		<Flex sx={{ alignItems: 'center', marginLeft: '15px' }}>
			<Text sx={{
				fontSize: '20px',
				color: `${isSelected ? 'primary' : 'grey'}`,
				fontWeight: 600
			}}>
				{collection.metadata.title}
			</Text>
		</Flex>
	</Flex>
}
