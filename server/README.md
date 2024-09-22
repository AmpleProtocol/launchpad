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
