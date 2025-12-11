# ------------------------------------------------------
# Build Stage - Node.js build
# ------------------------------------------------------
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build the React app (increase Node memory limit for large builds)
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npm run build

# ------------------------------------------------------
# Production Build - Nginx
# ------------------------------------------------------
FROM nginx:stable-alpine-perl
WORKDIR /usr/share/nginx/html

# Copy built assets from builder stage
COPY --from=builder /app/build .
RUN rm -rf /etc/nginx/conf.d
COPY nginx /etc/nginx
EXPOSE 80

# Copy env.sh script (not .env - that will be provided at runtime)
COPY ./env.sh .

# Make our shell script executable
RUN chmod +x env.sh

# Add bash
RUN apk add --no-cache bash

# Start Nginx server
CMD ["/bin/bash", "-c", "/usr/share/nginx/html/env.sh && nginx -g \"daemon off;\""]
