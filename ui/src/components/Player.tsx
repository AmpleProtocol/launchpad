import { Box, Button, Spinner } from "theme-ui";
import { MediaPlayer, MediaProvider } from '@vidstack/react';
import { defaultLayoutIcons, DefaultVideoLayout } from '@vidstack/react/player/layouts/default';
import { useStreaming } from "../hooks";

interface IPlayerProps {
	contentId: string,
	title: string
}
export const Player: React.FC<IPlayerProps> = ({ contentId, title }) => {
	const { error, streamingUrl, tryAgain } = useStreaming(contentId)

	if (error) return <Box>
		<pre>{error}</pre>
		<Button onClick={tryAgain}>Try again</Button>
	</Box>

	if (!streamingUrl) return <Box>
		<Spinner />
	</Box>

	return <MediaPlayer style={{ height: '100%' }} autoplay title={title} src={streamingUrl}>
		<MediaProvider />
		<DefaultVideoLayout icons={defaultLayoutIcons} />
	</MediaPlayer>
}

