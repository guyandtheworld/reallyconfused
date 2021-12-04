# Build stage
###
FROM node:12-alpine
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn --frozen-lockfile

COPY . .
RUN yarn build

CMD ["yarn", "start:production"]