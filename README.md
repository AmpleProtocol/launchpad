# Ample Launchpad 
Plug-and-play components to deploy and tokenize media + IP anywhere.

## Overview 
The ample launchpad is a suit of tools that facilitate the tokenization of IP assets such as films and music. It is designed to work with the [NEAR](https://near.org) ecosystem and ships a [Livepeer](https://livepeer.org) provider (although is not limited to it).
Consists of three npm packages, a set of two NEAR smart contracts and a containerized server. 

## Getting Started
### Prerequisites 
- Deploy the [launchpad contracts](https://github.com/AmpleProtocol/launchpad/tree/master/contracts) 
- Deploy a [server](https://github.com/AmpleProtocol/launchpad/tree/master/server) instance 

### Install dependencies
```sh 
npm install \
    @ample-launchpad/core \
    @ample-launchpad/client \
    @ample-launchpad/ui
```

### Init launchpad 
> @ample-launchpad/ui and @ample-launchpad/client packages are intended to be used in tandem with @near-wallet-selector.
> Please setup wallet selector before using these packages.
> see [example/](https://github.com/AmpleProtocol/launchpad/tree/master/example) for a complete @near-wallet-selector + @ample-launchpad integration
```tsx 
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
```tsx
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
```tsx 
import { Launch } from "@ample-launchpad/ui"

const SomeOtherComponent = () => {
	return <Launch
		onUploadProgress={(progress) => { console.log({ progress }) }}
		onUploadError={(error) => { console.error(error) }}
		onContentCreated={({ collectionId, contentId }) => { console.log({ collectionId, contentId }) }}
	/>
}
```
> Please refer to the [UI package](https://github.com/AmpleProtocol/launchpad/tree/master/ui) for more information about these components.

## Contributing
Check our [contribution guidelines](https://github.com/AmpleProtocol/launchpad/tree/master/CONTRIBUTING.md) to learn how you can start contributing to the Ample Launchpad.

## Testing guide
### Running the `example/` dapp
1. Install dependencies 
```sh 
pnpm install
```
2. Create `.env` file for the `example/` project (see [.env.template](https://github.com/AmpleProtocol/launchpad/blob/master/example/.env.template))
3. Create `.env` file for the `server/` project (see [.env.template](https://github.com/AmpleProtocol/launchpad/blob/master/example/.env.template))
4. Start dev processes
```sh 
pnpm dev
```
5. Check it out at http://localhost:3000


### Integration + unit tests
```sh 
pnpm test
```
