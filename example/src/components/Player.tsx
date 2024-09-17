import { useStreaming } from "@ample-launchpad/ui"
import { getSrc } from "@livepeer/react/external";
import * as LPlayer from "@livepeer/react/player";

interface IProps {
	contentId: string,
	title: string
}
export const Player: React.FC<IProps> = ({ contentId, title }) => {
	const { error, streamingUrl, jwt, tryAgain } = useStreaming(contentId)

	if (!streamingUrl) return null

	if (error) return <div>
		<pre>{error}</pre>
		<button onClick={tryAgain}>Try again</button>
	</div>

	return <LPlayer.Root aspectRatio={null} autoPlay src={getSrc(streamingUrl)} jwt={jwt}>
		<LPlayer.Container>
			<LPlayer.Video controls title={title} />
		</LPlayer.Container>
	</LPlayer.Root>
}
