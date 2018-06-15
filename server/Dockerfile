FROM node:10

WORKDIR /usr/src/app
COPY package*.json ./

RUN npm install

COPY . .
RUN npm run generate-cert

RUN npm prune --production
RUN npm cache clean --force

EXPOSE 8000
EXPOSE 8001

CMD [ "npm", "start" ]
