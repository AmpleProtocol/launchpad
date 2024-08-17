import { Box, Grid, Input, Label, Spinner } from "theme-ui"
import { useLaunchpad } from "../context"
import { SubmitHandler, useForm } from 'react-hook-form';
import { ErrorMessage } from "./common/ErrorMessage";
import { ICreateContentParams } from "@ample-launchpad/client";
import { useState } from "react";

// fields left
// export interface ICreateContentParams {
// 	owner: string,
// 	royalty: Royalty,
// 	treasuryRoyalty: TreasuryRoyalty
// }

interface IFormData extends ICreateContentParams {
	file: FileList
}

interface ICreateContentResponse {
	contentId: string,
	collectionId: string,
}

interface ILaunchProps {
	onContentCreated?: (newContent: ICreateContentResponse) => any
}

export const Launch: React.FC<ILaunchProps> = ({ onContentCreated }) => {
	const { createContent } = useLaunchpad()
	const { handleSubmit, register, formState: { errors } } = useForm<IFormData>()
	const [loading, setLoading] = useState<boolean>(false)

	/**
		* Create the content and launch the collection
	*/
	const onSubmit: SubmitHandler<IFormData> = async (data) => {
		setLoading(true)
		// create the content and collection
		const res = await createContent(data)

		// start uploading the file
		// notify user back about the created content
		onContentCreated && onContentCreated({
			contentId: res.data.data!.contentId,
			collectionId: res.data.data!.collectionId
		})
		setLoading(false)
	}

	return <Grid>
		{/* fields */}
		<Box as="form" onSubmit={handleSubmit(onSubmit)}>
			<Box>
				<h2>Content</h2>
				<Label>
					Title
					<Input {...register('title', { required: 'Title is required' })} />
				</Label>
				<ErrorMessage fieldError={errors.title} />
				<Label>
					Description
					<Input {...register('description', { required: 'Description is required' })} />
				</Label>
				<ErrorMessage fieldError={errors.description} />

				<h2>NFT collection</h2>
				<Label>
					Total supply
					<Input type="number" {...register('totalSupply', { required: 'Total Supply is required' })} />
				</Label>
				<ErrorMessage fieldError={errors.totalSupply} />
				<Label>
					Price
					<Input type="number" {...register('price', { required: 'Price is required' })} />
				</Label>
				<ErrorMessage fieldError={errors.price} />
				<Label>
					Media
					<Input type="url" {...register('mediaUrl', { required: 'Media url is required' })} />
				</Label>
				<ErrorMessage fieldError={errors.mediaUrl} />
			</Box>

			{/* media field */}
			<Box>
				<Label>
					File
					<Input type="file" {...register('file', { required: 'File required to create the content' })} />
				</Label>
				<ErrorMessage fieldError={errors.file} />

				{loading && <Spinner />}
				<Input type="submit" disabled={loading} />
			</Box>
		</Box>
	</Grid>
}
