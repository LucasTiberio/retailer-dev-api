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
ARG sendgridapikey
ENV SEND_GRID_API_KEY=$sendgridapikey
RUN npm install && npm run build
CMD ["/bin/sh", "-c", "npx knex migrate:latest && npm start"]