import { Box, Grid, Input, Label } from "theme-ui"
import { useLaunchpad } from "../context"
import { FormEvent, useCallback } from "react"

interface ILaunchProps {

}
export const Launch: React.FC<ILaunchProps> = () => {
	const { createContent } = useLaunchpad()

	/**
		* Create the content and launch the collection
	*/
	const onSubmit = useCallback((e: FormEvent) => {
		e.preventDefault()
	}, [])

	return <Grid>
		{/* fields */}
		<Box as="form" onSubmit={onSubmit}>
			<h2>Content</h2>
			<Label>
				Title
				<Input />
			</Label>
			<Label>
				Author
				<Input />
			</Label>

			<h2>NFT collection</h2>
			<Label>
				Total supply
				<Input />
			</Label>
			<Label>
				Media
				<Input />
			</Label>
		</Box>

		{/* media field */}
		<Box>
			<Label>
				File
				<input type="file" />
			</Label>
		</Box>
	</Grid>
}
