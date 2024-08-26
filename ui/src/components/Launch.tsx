import { Box, BoxProps, Container, Flex, Grid, Image, Input, Label, Spinner } from "theme-ui"
import { useLaunchpad } from "../context"
import { SubmitHandler, useForm } from 'react-hook-form';
import { ErrorMessage } from "./lib/ErrorMessage";
import { ICreateContentParams } from "@ample-launchpad/client";
import { useEffect, useMemo, useState } from "react";
import { Upload } from "tus-js-client";

interface IFormData extends Omit<ICreateContentParams, 'treasuryRoyalty'> {
	file: FileList,
	ownerRoyalty: number,
	holdersRoyalty: number
}

interface ICreateContentResponse {
	contentId: string,
	collectionId: string,
}

interface ILaunchProps extends BoxProps {
	onContentCreated?: (newContent: ICreateContentResponse) => any,
	onUploadProgress?: (progress: number) => any
}

export const Launch: React.FC<ILaunchProps> = ({ onContentCreated, onUploadProgress, ...props }) => {
	const { createContent, wallet } = useLaunchpad()
	const { handleSubmit, register, setValue, watch, formState: { errors } } = useForm<IFormData>({
		defaultValues: {
			totalSupply: 100000,
			price: '10'
		}
	})
	const [loading, setLoading] = useState<boolean>(false)
	const mediaUrl = watch('mediaUrl')

	useEffect(() => {
		setOwner()
	}, [])

	const setOwner = async () => {
		const accounts = await wallet.getAccounts()
		if (!accounts[0]) return

		setValue('owner', accounts[0].accountId)
	}
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
		if (!res.data.success || !res.data.data) throw new Error(res.data.message!)

		// create a new Upload 
		const upload = new Upload(file, {
			endpoint: res.data.data.tusEndpoint,
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
				onUploadProgress && onUploadProgress(Number(percentage))
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

	const mediaSrc = useMemo<string | null>(() => {
		try {
			const _url = new URL(mediaUrl)
			return _url.toString()
		} catch (error) {
			return null
		}
	}, [mediaUrl])

	return <Box sx={{ borderRadius: '5px' }} {...props}>
		<Grid as="form" onSubmit={handleSubmit(onSubmit)} columns={['1fr 1fr']}>
			<Container>
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
					Price (in NEAR)
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
					<Input type="number" {...register('ownerRoyalty', { required: 'This field is required' })} />
				</Label>
				<ErrorMessage fieldError={errors.ownerRoyalty} />
				<Label>
					Holders royalty
					<Input type="number" {...register('holdersRoyalty', { required: 'This field is required' })} />
				</Label>
				<ErrorMessage fieldError={errors.holdersRoyalty} />
			</Container>

			{/* media field */}
			<Container>
				<Flex sx={{ flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
					<Box>
						<h2>File</h2>
						<Input type="file" {...register('file', { required: 'File required to create the content' })} />
						<ErrorMessage fieldError={errors.file} />
					</Box>

					{mediaSrc && <Box sx={{ alignSelf: 'center' }}>
						<Image variant="nftPreview" src={mediaSrc} alt="NFT media preview" />
					</Box>}

					<Box>
						{loading && <Spinner />}
						<Input variant="launchButton" type="submit" disabled={loading} value='Launch' />
					</Box>
				</Flex>
			</Container>
		</Grid>
	</Box>
}
