FROM node:6.2.2-slim

# Enviroments
ENV PORT=80
ENV MAIN_SCRIPT=/opt/app/server.js

# Pre-install
COPY opt/ /opt/
WORKDIR /opt

# Install
RUN apt-get update \
 && apt-get -y install vim git --no-install-recommends \
 && rm -rf /var/lib/apt/lists/* \
 && npm install --production \
 && npm cache clean

CMD node ${MAIN_SCRIPT}
