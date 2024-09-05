import { Box, BoxProps, Container, Flex, Grid, Image, Input, Label, Progress, Spinner, Text } from "theme-ui"
import { useLaunchpad } from "../context"
import { SubmitHandler, useForm } from 'react-hook-form';
import { ErrorMessage } from "./lib/ErrorMessage";
import { ICreateContentParams } from "@ample-launchpad/client";
import { useEffect, useMemo, useState } from "react";
import { Upload } from "tus-js-client";
import { utils } from "near-api-js";

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
	const { handleSubmit, register, setValue, watch, reset, formState: { errors } } = useForm<IFormData>({
		defaultValues: {
			totalSupply: 100000,
			price: '10'
		}
	})
	const [progress, setProgress] = useState<number | undefined>()
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

		setProgress(5)

		try {
			const yoctoPrice = utils.format.parseNearAmount(data.price)

			if (!yoctoPrice) throw new Error('Invalid price')

			// create the content and collection
			const res = await createContent({
				owner: data.owner,
				price: yoctoPrice,
				title: data.title,
				description: data.description,
				mediaUrl: data.mediaUrl,
				totalSupply: Number(data.totalSupply),
				treasuryRoyalty: {
					owner: Number(data.ownerRoyalty),
					holders: Number(data.holdersRoyalty)
				}
			})
			if (!res.data.success || !res.data.data) throw new Error(res.data.message!)

			setProgress(10)

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
					const asNumber = Number(percentage)
					onUploadProgress && onUploadProgress(asNumber)
					if (asNumber > 10) setProgress(asNumber)
				},
				onSuccess: () => {
					// notify user back about the created content
					reset()
					setProgress(undefined)
					onContentCreated && onContentCreated({
						contentId: res.data.data!.contentId,
						collectionId: res.data.data!.collectionId
					})
				},
			})

			upload.start()
		} catch (error) {
			throw error
		}
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

					{
						mediaSrc
							? <Box sx={{ alignSelf: 'center' }}>
								<Image variant="nftPreview" src={mediaSrc} alt="NFT media preview" />
							</Box>
							: <Flex sx={{
								backgroundColor: '#f1f1f1',
								aspectRatio: '0.8',
								marginX: 'auto',
								width: '50%',
								justifyContent: 'center',
								alignItems: 'center',
								color: '#b5b5b5',
								borderRadius: '15px'
							}}
							>
								Preview
							</Flex>
					}

					<Box>
						{
							progress
								? <Box>
									<Text sx={{ textAlign: 'center', fontWeight: 300 }}>
										Launching your content...
									</Text>
									<Progress sx={{ height: '10px' }} max={100} value={progress} />
								</Box>
								: <Flex sx={{ justifyContent: 'end' }}>
									<Input variant="launchButton" type="submit" value='Launch' />
								</Flex>
						}
					</Box>
				</Flex>
			</Container>
		</Grid>
	</Box>
}
