# Ample Launchpad | Core Package
Core functionality for the launchpad

> For an Ample Launchpad base integration, please check [the UI package](https://github.com/AmpleProtocol/launchpad/tree/master/ui).

## Usage
1. Install the package
```sh
npm install @ample-launchpad/core
```
or
```sh
yarn add @ample-launchpad/core
```

2. Get signer
```ts
// server side example
import { IServerSideProps, Treasury, Series, getSignerFromPrivateKey } from '@ample-launchpad/core'

const config: IServerSideProps = {
	network: process.env.NEAR_NETWORK, 
	accountId: process.env.NEAR_ACCOUNT_ID,
	privateKey: process.env.NEAR_PRIVATE_KEY,
}

const signer = await getSignerFromPrivateKey(config)
```

```ts
// client side example using @near-wallet-selector
import { IWalletSelectorProps, Treasury, Series, getSignerFromWalletSelector } from '@ample-launchpad/core'
import { setupWalletSelector } from "@near-wallet-selector/core";
import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet";

const network =  process.env.NEAR_NETWORK;

const selector = await setupWalletSelector({
    network,
    modules: [
        setupWalletSelector()
    ]
})

const wallet = await selector.wallet()

const config: IWalletSelectorProps = {
    network, 
    wallet
}

const signer = await getSignerFromWalletSelector(config)
```

3. Instantiate contracts
```ts
const treasury = new Treasury(signer, process.env.TREASURY_ADDRESS)
const series = new Series(signer, process.env.SERIES_ADDRESS)
```

4. Use contracts accordingly 
```ts
const generatedRoyalties = await treasury.calculateRoyalties('some_content_id')
```
