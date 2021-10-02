# Build stage
FROM node:16.10.0-alpine3.14 as build-stage

# Prepare workdir
COPY --chown=node:node package*.json /app/

RUN mkdir -p /app/node_modules && chown -R node:node /app/node_modules

USER node
WORKDIR /app

# Install modules
RUN npm ci

# Install sources
COPY --chown=node:node srcs/ .

RUN npm run build

# Server stage
FROM alpine:3.14.0 as production

# Install dependencies
RUN apk add --update --no-cache nginx

# Setup Nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy build-stage files
COPY --from=build-stage /app/public /usr/share/nginx/html

EXPOSE 3000

CMD nginx -g 'daemon off;'
