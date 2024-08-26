# Install dependencies and build
FROM node:20-alpine 

# Set working directory
WORKDIR /app

# Copy all workspace files
COPY . .
RUN ls

# Install pnpm
RUN npm install -g pnpm && pnpm install --frozen-lockfile
RUN ls

# Build everything
RUN pnpm build

# Set entrypoint or command
CMD ["pnpm", "start:server"]
