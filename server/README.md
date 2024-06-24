# Ample Launchpad | Server
Auxiliar server for CRON tasks, tokengating and analytics management for the launchpad.

## Responsabilities
- Upload analytics to the treasury contract every 24 hours (CRON @ tasks/analytics.ts)
- Issue JWT to allow streaming of tokengated contents (api/sign-jwt.ts)
- Keep track of launched contents
