FROM node:20

COPY . /usr/src/app

WORKDIR /usr/src/app/makeHuman_Exporter/public_html

RUN npm install

EXPOSE 3000

CMD [ "npm", "start" ]