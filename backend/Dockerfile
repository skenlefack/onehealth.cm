# Backend Dockerfile - Express.js API
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressjs

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application code
COPY --chown=expressjs:nodejs . .

# Create uploads directory with correct permissions
RUN mkdir -p uploads && chown -R expressjs:nodejs uploads

USER expressjs

EXPOSE 5000

ENV PORT=5000

CMD ["node", "server.js"]
