import { Launch } from "@ample-launchpad/ui"

export default function LaunchTab() {

	return <Launch
		onUploadProgress={(progress) => { console.log({ progress }) }}
		onContentCreated={({ collectionId, contentId }) => { console.log({ collectionId, contentId }) }}
	/>
}
