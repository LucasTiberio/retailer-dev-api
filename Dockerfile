FROM node:10.16.0-alpine
WORKDIR /app
COPY . /app
ARG dbuser
ENV DB_USER=$dbuser
ARG dbpassword
ENV DB_PASSWORD=$dbpassword
ARG dbdatabase
ENV DB_DATABASE=$dbdatabase
ARG dbport
ENV DB_PORT=$dbport
ARG dbhost
ENV DB_HOST=$dbhost
ARG jwtsecret
ENV JWT_SECRET=$jwtsecret
ARG nodeenv
ENV NODE_ENV=$nodeenv
ARG mailhost
ENV MAIL_HOST=$mailhost
ARG mailport
ENV MAIL_PORT=$mailport
ARG mailuser
ENV MAIL_USER=$mailuser
ARG MAIL_PASS
ENV MAIL_PASS=$MAIL_PASS
ARG digitaloceanawsaccesskeyid
ENV DIGITAL_OCEAN_AWS_ACCESS_KEY_ID=$digitaloceanawsaccesskeyid
ARG digitaloceanawssecretaccesskey
ENV DIGITAL_OCEAN_AWS_SECRET_ACCESS_KEY=$digitaloceanawssecretaccesskey
ARG digitaloceanspacesendpoint
ENV DIGITAL_OCEAN_SPACES_END_POINT=$digitaloceanspacesendpoint
ARG bucketname
ENV BUCKET_NAME=$bucketname
ARG fronturlstaging
ENV FRONT_URL_STAGING=$fronturlstaging
ARG rediscachekey
ENV REDIS_CACHEKEY=$rediscachekey
ARG redishost
ENV REDIS_HOST=$redishost
ARG redisport
ENV REDIS_PORT=$redisport
ARG ordersservicepassword
ENV ORDERS_SERVICE_PASSWORD=$ordersservicepassword
ARG REDIRECT_URL_STAGING
ENV REDIRECT_URL_STAGING=$REDIRECT_URL_STAGING
ARG PAYMENTS_URL
ENV PAYMENTS_URL=$PAYMENTS_URL
ARG VTEX_HOOK_URL
ENV VTEX_HOOK_URL=$VTEX_HOOK_URL
ARG ORDER_SERVICE_URL
ENV ORDER_SERVICE_URL=$ORDER_SERVICE_URL
ARG LOJA_INTEGRADA_APPLICATION_KEY
ENV LOJA_INTEGRADA_APPLICATION_KEY=$LOJA_INTEGRADA_APPLICATION_KEY
ARG ENTERPRISE_TOKEN
ENV ENTERPRISE_TOKEN=$ENTERPRISE_TOKEN
ARG BUCKET_URL
ENV BUCKET_URL=$BUCKET_URL
ARG BUCKET_AFFILIATE_INSIDE_SALES_PIXEL_PATH
ENV BUCKET_AFFILIATE_INSIDE_SALES_PIXEL_PATH=$BUCKET_AFFILIATE_INSIDE_SALES_PIXEL_PATH

RUN npm install && npm run build
CMD ["/bin/sh", "-c", "npx knex migrate:latest && npm start"]