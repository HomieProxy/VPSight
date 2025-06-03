
# --- Base Stage with Node.js ---
# Use a specific version of Node.js for consistency, Alpine for smaller size
FROM node:20-alpine AS base
LABEL authors="Your Name <your.email@example.com>"

# Set working directory
WORKDIR /app

# --- Dependencies Stage ---
# This stage is dedicated to installing dependencies and will be cached if package.json/lock changes.
FROM base AS deps
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package.json package-lock.json* ./

# Install dependencies using npm ci for cleaner installs if package-lock.json exists
RUN npm ci --omit=dev || npm install --omit=dev


# --- Builder Stage ---
# This stage builds the Next.js application.
FROM base AS builder
WORKDIR /app

# Copy dependencies from the 'deps' stage
COPY --from=deps /app/node_modules ./node_modules
# Copy all source code
COPY . .

# Build the Next.js application
# NEXT_PUBLIC_APP_URL is not strictly needed at build time unless used in getStaticProps/Paths without fallback
# It's more of a runtime concern for client-side code or server-side generation.
RUN npm run build


# --- Final Production Image ---
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Uncomment the next line if you want to disable "npm install --omit=dev" and install all dependencies.
# ENV NODE_ENV=development

# Create the non-root user and group
# Using -S for system user/group, -u and -g for specific IDs if needed for permissions consistency
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copy built artifacts from the builder stage
# These are organized for Next.js standalone output
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
# The standalone output copies server.js and .next/standalone properly
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Create the database directory for the application to use at runtime
# This directory should be mapped to a volume in docker-compose or docker run
# to persist the database.
RUN mkdir -p db && chown nextjs:nodejs db

# Set the user to the non-root user
USER nextjs

# Expose the port the app runs on
EXPOSE 3000

# Set the default port for the environment (Next.js will respect this)
ENV PORT=3000
# ENV HOSTNAME="0.0.0.0" # Not strictly necessary for Next.js `start` with standalone output as server.js handles binding

# The command to run the application using the standalone server.js
CMD ["node", "server.js"]
