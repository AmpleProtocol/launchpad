FROM node:20-alpine 

WORKDIR /app

COPY . .
RUN ls

RUN npm install -g pnpm && pnpm install --frozen-lockfile
RUN ls

ENV NODE_ENV='production'

RUN pnpm build

CMD ["pnpm", "start:server"]
