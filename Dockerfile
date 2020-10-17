FROM node:alpine

RUN apk upgrade --no-cache
RUN apk add --no-cache python make g++ sox
RUN apk add --no-cache linux-headers eudev-dev libusb-dev
#RUN apk add --no-cache --virtual  pkgconfig libusb

WORKDIR /opt/app

COPY package.json package-lock.json ./

RUN npm cache clean --force && npm install --only=prod

# Each command / line in this file makes up a 'layer'. The result of each is cached.

# copy app source to image _after_ npm install so that
# application code changes don't bust the docker cache of npm install step
COPY . ./

# set application PORT and expose docker PORT, 80 is what Elastic Beanstalk expects
ENV PORT 3001
EXPOSE 3001

CMD [ "npm", "run", "start" ]
