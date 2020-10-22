FROM node:14-alpine

ENV NODE_ENV=production
ENV NODE_TLS_REJECT_UNAUTHORIZED=0
ENV PORT=80

WORKDIR /app

COPY package.json package.json
COPY yarn.lock yarn.lock

RUN yarn --production && yarn cache clean

COPY dist .

CMD ["/bin/sh", "-c", "yarn start"]
