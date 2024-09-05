# Ample Launchpad | Server
Auxiliar server for CRON tasks, tokengating and analytics management for the launchpad.

## Overview
### Responsabilities
- Upload analytics to the treasury contract every 24 hours (CRON @ tasks/analytics.ts)
- Issue JWT to allow streaming of tokengated contents (api/sign-jwt.ts)
- Keep track of launched contents

## Deploy
### Prerequisites
- Install a container management tool such as [docker](https://docker.com) or [podman](https://podman.io)

### Pull docker image
```sh
docker pull menurivera/ample-launchpad-server
```

### Start server
```sh
docker run -d -p 5000:5000 docker.io/menurivera/ample-launchpad-server
```
