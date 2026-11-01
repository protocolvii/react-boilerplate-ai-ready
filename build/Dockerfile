FROM node:22-alpine

ENV appdir /usr/src/app
ARG port=8080

RUN mkdir -p $appdir
WORKDIR $appdir

ADD package.json package-lock.json ./
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.tuna.tsinghua.edu.cn/g' /etc/apk/repositories \
    && npm config set registry https://registry.npmmirror.com/ \
    && npm ci --omit=dev \
    && npm install pm2 -g

ADD ./static ./static
ADD ./server.js .
ADD process.prod.json .

EXPOSE $port
