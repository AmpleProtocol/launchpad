# Ample Launchpad | Client Package
Main component for direct manipulation of a launchpad deployment.

## Quickstart
This guide assumes you have already deployed a [server](../server/README.md) and the NEAR [contracts](../contracts/README.md)

### Install dependencies
```sh 
npm install @ample-launchpad/core @ample-launchpad/client
```

### Setup
```typescript
import { setupLaunchpad } from '@ample-launchpad/client'
// from @near-wallet-selector
import { setupWalletSelector } from "@near-wallet-selector/core";
import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet";


const init = async () => {
    // get near-wallet-selector Wallet instance
    const selector = await setupWalletSelector({
        network: "testnet",
        modules: [setupMyNearWallet()],
    });
    if(!selector.isSignedIn()) throw new Error('User must be signed in in order to setup the launchpad')
    const wallet = await selector.wallet();

    // get the actual launchpad instance
    const launchpad = await setupLaunchpad({
        network: 'testnet',
        wallet,
        serverUrl: process.env.SERVER_URL,
        treasuryAddress: process.env.TREASURY_ADDRESS,
        seriesAddress: process.env.SERIES_ADDRESS
    })
}
```

### Usage
```typescript 
const res = await launchpad.createContent(/* body */)
const content = await launchpad.getContent(/* contentId */) 
const contents = await launchpad.getContents() 

// royalties
const royalties = await launchpad.contracts.treasury.calculateRoyalties(/* contentId */)
await launchpad.contracts.treasury.claimRoyalties(/* contentId */)

// nfts 
const serieDetails = await launchpad.contracts.series.getSeriesDetails(/* serieId */)
const ownedNftSeries = await launchpad.contracts.series.nftSeriesForOwner()
await launchpad.contracts.series.mint(/* serieId */)
```
