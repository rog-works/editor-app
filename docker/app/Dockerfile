FROM node:7.9-alpine

RUN apk update \
 && apk add --no-cache git openssh

ENV PORT=8080
ENV MAIN_SCRIPT=/opt/app/dist/server/Index.js
ENV TZ=Asia/Tokyo

RUN mkdir /opt \
 && mkdir /var/log/app \
 && chown node:node /opt \
 && chown node:node /var/log/app

USER node
WORKDIR /opt
VOLUME /var/log/app

CMD node ${MAIN_SCRIPT}
