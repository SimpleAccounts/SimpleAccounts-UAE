# ------------------------------------------------------
# Build Stage - Node.js build
# ------------------------------------------------------
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build the React app with Vite (increase Node memory limit for large builds)
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npm run build

# ------------------------------------------------------
# Production Build - Nginx
# ------------------------------------------------------
FROM nginx:stable-alpine-perl
WORKDIR /usr/share/nginx/html

# Copy built assets from builder stage (Vite outputs to 'dist' instead of 'build')
COPY --from=builder /app/dist .
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
# Create .env file from environment variables if it doesn't exist, then run env.sh
CMD ["/bin/bash", "-c", "if [ ! -f /usr/share/nginx/html/.env ]; then echo \"SIMPLEACCOUNTS_HOST=$SIMPLEACCOUNTS_HOST\" > /usr/share/nginx/html/.env && echo \"SIMPLEACCOUNTS_RELEASE=$SIMPLEACCOUNTS_RELEASE\" >> /usr/share/nginx/html/.env && echo \"SIMPLE_SERVICES_HOST=$SIMPLE_SERVICES_HOST\" >> /usr/share/nginx/html/.env && echo \"SIMPLE_SERVICES_GET_SUBSCRIPTION_KEY=$SIMPLE_SERVICES_GET_SUBSCRIPTION_KEY\" >> /usr/share/nginx/html/.env; fi && /usr/share/nginx/html/env.sh && nginx -g \"daemon off;\""]
