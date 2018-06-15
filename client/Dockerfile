FROM node:alpine

WORKDIR /usr/src/app
COPY package*.json ./

RUN npm install

COPY . .
RUN npm run build

RUN npm prune --production
RUN npm cache clean --force

EXPOSE 8080

CMD [ "npm", "start" ]
