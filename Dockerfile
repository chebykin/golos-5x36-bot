FROM node:8-alpine

RUN mkdir -p /var/player
WORKDIR /var/player

COPY . /var/player
RUN npm install

CMD ["npm", "start"]