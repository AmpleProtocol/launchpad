import { Box, Grid, Input, Label, Spinner } from "theme-ui"
import { useLaunchpad } from "../context"
import { SubmitHandler, useForm } from 'react-hook-form';
import { ErrorMessage } from "./common/ErrorMessage";
import { ICreateContentParams } from "@ample-launchpad/client";
import { useState } from "react";
import { Upload } from "tus-js-client";

interface IFormData extends ICreateContentParams {
	file: FileList,
	ownerRoyalty: number,
	holdersRoyalty: number
}

interface ICreateContentResponse {
	contentId: string,
	collectionId: string,
}

interface ILaunchProps {
	onContentCreated?: (newContent: ICreateContentResponse) => any,
	onProgress?: (progress: number) => any
}

export const Launch: React.FC<ILaunchProps> = ({ onContentCreated, onProgress }) => {
	const { createContent } = useLaunchpad()
	const { handleSubmit, register, formState: { errors } } = useForm<IFormData>()
	const [loading, setLoading] = useState<boolean>(false)

	/**
		* Create the content and launch the collection
	*/
	const onSubmit: SubmitHandler<IFormData> = async (data) => {
		const file = data.file.item(0)
		if (!file) return

		setLoading(true)

		// create the content and collection
		const res = await createContent({
			...data,
			treasuryRoyalty: {
				owner: data.ownerRoyalty,
				holders: data.holdersRoyalty
			}
		})
		if (!res.data.success) throw new Error(res.data.message!)

		// create a new Upload 
		const upload = new Upload(file, {
			endpoint: res.data.data?.tusEndpoint,
			retryDelays: [0, 3000, 5000, 10000, 20000],
			metadata: {
				filename: file.name,
				filetype: file.type,
			},
			onError: (error) => {
				alert(`Upload failed\n${error}`)
				console.error(error)
			},
			onProgress: (bytesUploaded, bytesTotal) => {
				const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2)
				onProgress && onProgress(Number(percentage))
			},
			onSuccess: () => {
				// notify user back about the created content
				setLoading(false)
				onContentCreated && onContentCreated({
					contentId: res.data.data!.contentId,
					collectionId: res.data.data!.collectionId
				})
			},
		})

		upload.start()
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
				<Label>
					Owner
					<Input {...register('owner', { required: 'Owner is required' })} />
				</Label>
				<ErrorMessage fieldError={errors.owner} />

				<h2>Royalty</h2>
				<Label>
					Owner royalty
					<Input {...register('ownerRoyalty', { required: 'This field is required' })} />
				</Label>
				<ErrorMessage fieldError={errors.ownerRoyalty} />
				<Label>
					Holders royalty
					<Input {...register('holdersRoyalty', { required: 'This field is required' })} />
				</Label>
				<ErrorMessage fieldError={errors.holdersRoyalty} />
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
