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
RUN npm install && npm run build
CMD ["/bin/sh", "-c", "npx knex migrate:latest  && npm start"]