# Ample Launchpad | Core Package
Core functionality for the launchpad\
(Work in progress...)

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
import { IServerSideProps, Treasury, getSignerFromPrivateKey } from '@ample-launchpad/core'

const config: IServerSideProps = {
	network: process.env.NEAR_NETWORK, 
	accountId: process.env.NEAR_ACCOUNT_ID,
	privateKey: process.env.NEAR_PRIVATE_KEY,
}

const signer = await getSignerFromPrivateKey(config)
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
