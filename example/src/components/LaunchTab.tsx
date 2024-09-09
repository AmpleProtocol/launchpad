import { Launch } from "@ample-launchpad/ui"

export default function LaunchTab() {

	const onContentCreated = (res: any) => {
		console.log({ res })
		alert(`Content created!\n\n${JSON.stringify(res)}`)
	}

	return <Launch
		onUploadProgress={(progress) => { console.log({ progress }) }}
		onContentCreated={onContentCreated}
	/>
}
