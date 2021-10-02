# Build stage
FROM node:14.18.0-alpine3.11 as build-stage

# Install dependencies
RUN apk add --update --no-cache ca-certificates yarn python3 make g++

# Prepare workdir
COPY --chown=node:node package*.json /app/

RUN mkdir -p /app/node_modules && chown -R node:node /app/node_modules

USER node
WORKDIR /app

# Install modules
RUN yarn install

# Install sources
COPY --chown=node:node . .

RUN yarn build

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
