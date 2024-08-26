import { IContent } from "@ample-launchpad/client"
import { useLaunchpad } from "@ample-launchpad/ui"
import { useEffect, useState } from "react"
import ContentListItem from "./ContentListItem"

export default function ContentsList() {
	const { getContents } = useLaunchpad()
	const [contents, setContents] = useState<IContent[]>([])

	useEffect(() => {
		fetchContents()
	}, [])

	const fetchContents = async () => {
		try {

			const res = await getContents()
			if (!res.data.data) return
			if (!res.data.success) throw new Error(res.data.message)

			setContents(res.data.data)
		} catch (error) {
			console.error(error)
		}
	}

	return <div>
		{contents.map((content, index) => <ContentListItem content={content} key={index} />)}
	</div>
}
