FROM fluent/fluentd:ubuntu-base

RUN fluent-gem install em-websocket fluent-plugin-websocket

USER root

RUN mkdir -p /var/log/app \
 && mkdir -p /var/log/fluentd

