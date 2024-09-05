import { Launch } from "@ample-launchpad/ui"

export default function LaunchTab() {

	return <Launch
		onUploadProgress={(progress) => { console.log({ progress }) }}
		onContentCreated={({ royaltyCollectionId, rentalCollectionId, contentId }) => {
			console.log({ royaltyCollectionId, rentalCollectionId, contentId })
		}}
	/>
}
