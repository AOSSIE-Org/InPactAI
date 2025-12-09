FROM node:slim AS builder

# Set working directory
WORKDIR /app

# Install dependencies first
COPY package.json package-lock.json* yarn.lock* ./

# Install deps (uses npm if lockfile available)
RUN npm ci --only=production || npm install

# Copy everything else
COPY . .

# Copy env file into container at build time
# For private env vars, use ARG instead
COPY .env .env

# Build Next.js app
RUN npm run build


FROM node:slim AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy only necessary output from build stage
COPY --from=builder /app/package.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

# Copy env so Next.js server has access
COPY .env .env

# Expose Next.js port
EXPOSE 3000

# Start app
CMD ["npm", "start"]
