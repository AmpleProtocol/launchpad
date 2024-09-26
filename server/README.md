# Ample Launchpad | Server
Auxiliar server for CRON tasks, tokengating and analytics management for the launchpad.

## Overview
### Responsabilities
- Upload analytics to the treasury contract every 24 hours (CRON @ tasks/analytics.ts)
- Issue JWT to allow streaming of tokengated contents (api/sign-jwt.ts)
- Keep track of launched contents

## Quick start
### Prerequisites
- Install a container management tool such as [docker](https://docker.com) or [podman](https://podman.io)

### Pull docker image
```sh
docker pull menurivera/ample-launchpad-server
```

### Create .env file
```sh 
# for jwt signing, (see https://docs.livepeer.org/api-reference/signing-key/create for reference)
NITRO_PRIVATE_KEY=
NITRO_PUBLIC_KEY=

# for livepeer provider
NITRO_LIVEPEER_API_KEY=

# to create a near signer 
NITRO_NEAR_NETWORK=
NITRO_NEAR_ACCOUNT_ID=
NITRO_NEAR_PRIVATE_KEY=

NITRO_TREASURY_ADDRESS=
NITRO_SERIES_ADDRESS=
```

### Start server
```sh
docker run -d -p 5000:5000 --env-file .env docker.io/menurivera/ample-launchpad-server
```

## API reference
### GET /api/analytics
Retrieve analytics for a given contentId in the choosen period of time
#### Query 
```typescript 
interface Query {
    range: 'day' | 'week' | 'month' | 'year',
    contentId: string
}
```

#### Response
```typescript 
interface Response {
    success: boolean,
    message?: string,
    data?: {
        totalGenerated: number,
        royaltyGenerated: number,
        rentalGenerated: number,
        streamsCount: number,
        analytics: {
            streams: number,
            timestamp: number
        }[]
    }
}
```

### GET /api/content
Get all contents available in DB
#### Response 
```typescript 
interface Response {
    success: boolean,
    message?: string,
    data?: {
        id: string,
        title: string,
        media: string,
        royaltyCollectionId: number,
        rentalCollectionId: number,
        playbackId: string,
        assetId: string
    }[]
}
```

### GET /api/content/:id
Get the content associated with the given `id` param
#### Response
```typescript 
interface Response {
    success: boolean,
    message?: string,
    data?: {
        id: string,
        title: string,
        media: string,
        royaltyCollectionId: number,
        rentalCollectionId: number,
        playbackId: string,
        assetId: string
    }
}
```

### POST /api/content
Create a new content, this endpoint will deploy the rental and royalty NFT collections, store the content info in DB and create the asset in the provider (livepeer)
#### Body
```typescript 
interface Body {
    owner: string,
    title: string,
    description: string,
    mediaUrl: string,
    royaltyCollection: {
        price: string,
        royalty?: {
            [accountId: string]: number
        },
        totalSupply: number,
        treasuryRoyalty: {
            owner: number,
            holders: number,
        }
    },
    rentalCollection: {
        price: string,
        royalty?: {
            [accountId: string]: number
        },
        validPeriodMs: number
    },
}
```

#### Response 
```typescript 
interface Response {
    success: boolean,
    message?: string,
    data?: {
        contentId: string,
        royaltyCollectionId: number,
        rentalCollectionId: number,
        tusEndpoint: string,
        uploadEndpoint: string,
    }
}
```

### POST /api/sig-jwt
This endpoint will expect a payload to validate a given signature, if it is valid, then it will issue a `jwt` for streaming tokengated contents. See [NEP-0413](https://github.com/near/NEPs/blob/master/neps/nep-0413.md) for reference
#### Body 
```typescript
interface Body {
    contentId: string,
    accountId: string,
    payload:  {
        publicKey: string,
        message: string,
        signature: string,
        nonce: string, // base64 encoded buffer 
        recipient: string, // the name of the app requesting the access
        callbackUrl?: string 
    }
}
```

#### Response 
```typescript 
interface Response {
    success: boolean,
    message?: string,
    data?: {
        jwt: string,
        streamingUrl: string
    }
}
```

### GET /api/analytics-task 
> Not available in production environments

This will trigger the CRON task responsible for uploading analytics to the treasury SC.
