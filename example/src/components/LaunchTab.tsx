import { Launch } from "@ample-launchpad/ui"

export default function LaunchTab() {

	return <Launch
		style={{
			margin: '20px'
		}}
		onProgress={(progress) => {
			console.log({ progress })
		}}
		onContentCreated={({ collectionId, contentId }) => {
			console.log({ collectionId, contentId })
		}}
	/>
}
