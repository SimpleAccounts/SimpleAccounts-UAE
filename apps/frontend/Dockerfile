# ------------------------------------------------------
# Production Build
# ------------------------------------------------------
FROM nginx:stable-alpine-perl
WORKDIR /usr/share/nginx/html

COPY ./build .
RUN rm -rf /etc/nginx/conf.d
COPY nginx /etc/nginx
EXPOSE 80
# Copy .env file and shell script to container
COPY ./env.sh .
COPY ./.env .
# Make our shell script executable
RUN chmod +x env.sh

# Add bash
RUN apk add --no-cache bash

# Start Nginx server
CMD ["/bin/bash", "-c", "/usr/share/nginx/html/env.sh && nginx -g \"daemon off;\""]
