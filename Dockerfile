# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Prevent messages about new major versions of npm
ENV npm_config_update_notifier false

COPY package.json package-lock.json* ./
# Ensure clean installs based on lockfile
RUN npm ci

# Stage 2: Build the application
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Disable Next.js telemetry during build
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Generate the production build
RUN npm run build

# Stage 3: Production image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
# Disable Next.js telemetry during runtime
ENV NEXT_TELEMETRY_DISABLED 1

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from the builder stage
# Ensure correct ownership for the non-root user
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/db ./db # Copy the database directory

# Set the user to the non-root user
USER nextjs

EXPOSE 3000
# Set default port, Next.js will use this if PORT env var is not set by the platform
ENV PORT 3000

# Environment variables for initial admin user (db.ts)
# It's recommended to set these at runtime via `docker run -e VAR=value`
# ENV INITIAL_ADMIN_USERNAME admin
# ENV INITIAL_ADMIN_PASSWORD changeme

CMD ["node", "server.js"]
