FROM node:7.9-alpine

# Enviroments
ENV PORT=80
ENV MAIN_SCRIPT=/opt/app/server.js

# Pre-install
COPY opt/ /opt/
WORKDIR /opt

# Install
RUN apk update \
 && apk add --no-cache --virtual .build-dependecies git openssh \
 && apk del .build-dependecies \
 && yarn install \
 && yarn cache clean

CMD node ${MAIN_SCRIPT}
