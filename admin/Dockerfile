# Admin Dockerfile - React (Create React App)
FROM node:20-alpine AS base

# Build stage
FROM base AS builder
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (legacy-peer-deps for react-leaflet compatibility)
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Set build-time environment variables
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Build the application
RUN npm run build

# Production stage - serve with nginx
FROM nginx:alpine AS runner

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
