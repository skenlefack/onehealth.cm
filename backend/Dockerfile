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

# Install su-exec for dropping privileges in entrypoint
RUN apk add --no-cache su-exec

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressjs

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application code
COPY --chown=expressjs:nodejs . .

# Create all upload directories with correct permissions
RUN mkdir -p uploads/experts \
    uploads/organizations \
    uploads/materials \
    uploads/documents/files \
    uploads/thumbnails \
    uploads/elearning/videos \
    uploads/elearning/thumbnails \
    uploads/elearning/pdfs \
    uploads/elearning/attachments \
    uploads/elearning/presentations \
    && chown -R expressjs:nodejs uploads

# Copy entrypoint script
COPY --chown=expressjs:nodejs docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

EXPOSE 5000

ENV PORT=5000

# Use entrypoint to ensure upload dirs exist in mounted volumes
ENTRYPOINT ["/app/docker-entrypoint.sh"]
