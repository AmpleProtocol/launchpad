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

### Hook
The `@ample-launchpad/ui` package ships a `useLaunchpad` hook to interact with both server and contracts instances.
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

### React components
Three ready-to-go react components are also provided by `@ample-launchpad/ui`, `<Launch/>`, `<Royalty/>` and `<Player/>`.
```typescript 
import { Launch } from "@ample-launchpad/ui"

const SomeOtherComponent = () => {
	return <Launch
		onUploadProgress={(progress) => { console.log({ progress }) }}
		onContentCreated={({ collectionId, contentId }) => { console.log({ collectionId, contentId }) }}
	/>
}
```



