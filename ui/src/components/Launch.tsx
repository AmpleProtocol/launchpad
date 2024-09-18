import { Box, BoxProps, Container, Flex, Grid, Image, Input, Label, Progress, Text } from "theme-ui"
import { SubmitHandler, useForm } from 'react-hook-form';
import { ErrorMessage } from "./lib/ErrorMessage";
import { ICreateContentParams } from "@ample-launchpad/client";
import { useEffect, useMemo, useState } from "react";
import { DetailedError, Upload } from "tus-js-client";
import { utils } from "near-api-js";
import { useLaunchpad } from "../hooks";

const ONE_DAY_MS = 86400000

interface IFormData extends Omit<ICreateContentParams, 'royaltyCollection' | 'rentalCollection'> {
	file: FileList,
	// for royalty collection 
	royaltyPrice: string,
	totalSupply: string,
	ownerRoyalty: string,
	holdersRoyalty: string,
	// for rental collection 
	rentalPrice: string,
	rentalValidDays: string,
}

interface ICreateContentResponse {
	contentId: string,
	royaltyCollectionId: number,
	rentalCollectionId: number,
}

interface ILaunchProps extends BoxProps {
	onContentCreated?: (newContent: ICreateContentResponse) => any,
	onUploadError?: (error: Error | DetailedError) => any,
	onUploadProgress?: (progress: number) => any
}

export const Launch: React.FC<ILaunchProps> = ({ onContentCreated, onUploadError, onUploadProgress, ...props }) => {
	const { createContent, wallet } = useLaunchpad()
	const { handleSubmit, register, setValue, setError, watch, reset, formState: { errors } } = useForm<IFormData>({
		defaultValues: {
			totalSupply: '100000',
			ownerRoyalty: '60',
			holdersRoyalty: '40',
			royaltyPrice: '10',
			rentalPrice: '1',
			rentalValidDays: '1',
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

		// validate treasuryRoyalty
		if (Number(data.ownerRoyalty) > 100) {
			setError('ownerRoyalty', {
				type: 'manual',
				message: "Owner royalty can't exceed 100%"
			})
			return
		}
		if (Number(data.ownerRoyalty) + Number(data.holdersRoyalty) !== 100) {
			setError('holdersRoyalty', {
				type: 'manual',
				message: "Owner + holders royalties must add up to 100%"
			})
			return
		}

		setProgress(5)

		try {
			const royaltyYoctoPrice = utils.format.parseNearAmount(data.royaltyPrice)
			const rentalYoctoPrice = utils.format.parseNearAmount(data.rentalPrice)

			if (!royaltyYoctoPrice || !rentalYoctoPrice) throw new Error('Invalid price')

			// create the content and collection
			const res = await createContent({
				owner: data.owner,
				title: data.title,
				description: data.description,
				mediaUrl: data.mediaUrl,
				royaltyCollection: {
					price: royaltyYoctoPrice,
					totalSupply: Number(data.totalSupply),
					treasuryRoyalty: {
						owner: Number(data.ownerRoyalty),
						holders: Number(data.holdersRoyalty)
					}
				},
				rentalCollection: {
					price: rentalYoctoPrice,
					validPeriodMs: Number(data.rentalValidDays) * ONE_DAY_MS
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
					if (!onUploadError) throw error
					onUploadError(error)
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
						royaltyCollectionId: res.data.data!.royaltyCollectionId,
						rentalCollectionId: res.data.data!.rentalCollectionId,
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

				<h2>NFT collections</h2>
				<Label>
					Owner
					<Input {...register('owner', { required: 'Owner is required' })} />
				</Label>
				<ErrorMessage fieldError={errors.owner} />
				<Label>
					Media
					<Input type="url" {...register('mediaUrl', { required: 'Media url is required' })} />
				</Label>
				<ErrorMessage fieldError={errors.mediaUrl} />
				<Grid columns='1fr 1fr'>
					<Box>
						<h3>Royalty NFT</h3>
						<Label>
							Price (in NEAR)
							<Input type="number" {...register('royaltyPrice', { required: 'Price is required' })} />
						</Label>
						<ErrorMessage fieldError={errors.royaltyPrice} />
						<Label>
							Total supply
							<Input type="number" {...register('totalSupply', { required: 'Total Supply is required' })} />
						</Label>
						<ErrorMessage fieldError={errors.totalSupply} />
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
					</Box>
					<Box>
						<h3>Rental NFT</h3>
						<Label>
							Price (in NEAR)
							<Input type="number" {...register('rentalPrice', { required: 'Price is required' })} />
						</Label>
						<ErrorMessage fieldError={errors.rentalPrice} />
						<Label>
							Valid for (in days)
							<Input type="number" {...register('rentalValidDays', { required: 'This field is required', min: 1 })} />
						</Label>
						<ErrorMessage fieldError={errors.rentalValidDays} />
					</Box>
				</Grid>

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
