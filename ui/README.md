# Ample Launchpad | UI Package
A set of React components and utils to launch and tokenize IP + media anywhere.

## Quick start
### Install dependencies
```sh 
npm install \
    @ample-launchpad/core \
    @ample-launchpad/client \
    @ample-launchpad/ui
```

### Init launchpad 
```typescript 
// @ample-launchpad/ui and @ample-launchpad/client packages are intended to be used in tandem with @near-wallet-selector.
// Please setup wallet selector before using these packages.
// see example/ for a complete @near-wallet-selector + @ample-launchpad integration
import { useState, useEffect } from 'react'
import { walletSelector } from 'your-wallet-selector-setup'
import { Launchpad, setupLaunchpad } from '@ample-launchpad/client'
import { AmpleLaunchpadProvider } from '@ample-launchpad/ui'
import "@ample-launchpad/ui/dist/index.css"


const ExampleApp = () => {
    const [launchpad, setLaunchpad] = useState<Launchpad | undefined>()

    useEffect(() => {
        initLaunchpad()
    }, [])

    const initLaunchpad = async () => {
        if(!walletSelector) return
        const wallet = await walletSelector.wallet()

        const launchpad = await setupLaunchpad({
            wallet,
            // you might want to make these env variables
            network: 'testnet',
            serverUrl: 'https://your-server-deployment.com',
            treasuryAddress: 'treasury.your-near-acc.testnet',
            seriesAddress: 'series.your-near-acc.testnet',
        })

        setLaunchpad(launchpad)
    }

    return <>
        {
            launchpad 
                ? <AmpleLaunchpadProvider launchpad={launchpad} accentColor='purple'> 
                    {/* content here */}
                </AmpleLaunchpadProvider>
                : <div>No launchpad here :(</div>
        }
    </>
}
```

### Hooks
#### useLaunchpad
This is the main hook to interact with the launchpad, it allows you to access the `Launchpad` instance created during setup.
```typescript
import { useLaunchpad } from '@ample-launchpad/ui'
import { IContent } from '@ample-launchpad/client'

const SomeComponent = () => {
    const { getContents } = useLaunchpad()
    const [contents, setContents] = useState<IContent[] | undefined>()

    useEffect(() => {
        fetchContents()
    }, [])

    const fetchContents = async () => {
        const res = await getContents()

        if(res.data.success) setContents(res.data.data)
    }

    if(!contents) return null

    return <>
        {contents.map((c, i) => <div key={i}>{c.title}</div>)}
    </>
}
```

#### useStreaming
This hook will take care of the tokengated streaming process by asking the user for a signature to validate wallet ownership, get a jwt with that signature and store the access token for each content in local storage.

Here is an example of how to use the `useStreaming` hook along with the Livepeer player component:
> The following setup is needed to get [Livepeer](https://livepeer.org) metrics working properly. See https://docs.livepeer.org/developers/guides/get-engagement-analytics-via-api#registering-views for more information
```typescript
import { useStreaming } from "@ample-launchpad/ui"
import { getSrc } from "@livepeer/react/external";
import * as LivepeerPlayer from "@livepeer/react/player";

interface IProps {
	contentId: string,
	title: string
}
export const CustomPlayer: React.FC<IProps> = ({ contentId, title }) => {
	const { error, streamingUrl, jwt, tryAgain } = useStreaming(contentId)

	if (!streamingUrl) return null

	if (error) return <div>
		<pre>{error}</pre>
		<button onClick={tryAgain}>Try again</button>
	</div>

	return <LivepeerPlayer.Root aspectRatio={null} autoPlay src={getSrc(streamingUrl)} jwt={jwt}>
		<LivepeerPlayer.Container>
			<LivepeerPlayer.Video controls title={title} muted />
		</LivepeerPlayer.Container>
	</LivepeerPlayer.Root>
}

```

### React components
#### `<Launch />`
```typescript 
import { Launch } from "@ample-launchpad/ui"

const SomeOtherComponent = () => {
	return <Launch
        onUploadError={(error) => console.error(error)}
		onUploadProgress={(progress) => { console.log({ progress }) }}
		onContentCreated={({ collectionId, contentId }) => { console.log({ collectionId, contentId }) }}
	/>
}
```

#### `<Royalty />`
```typescript
import { Royalty } from "@ample-launchpad/ui"

const AnotherOne = () => {
    return <Royalty />
}
```

#### `<Player />`
> This player component handles only the tokengated side of the streaming process. It is not yet capable of sending metrics to the chosen provider. For integrating a custom player with a per-provider metrics system, please see the [useStreaming](#usestreaming) hook.
```typescript 
import { Player } from "@ample-launchpad/ui"

const contentId = 'some-content-id'
const title = 'Shrek'

const LastFakeComponent = () => {
    return <Player contentId={contentId} title={title} />
}
```
