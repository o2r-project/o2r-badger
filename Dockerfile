FROM node:6
MAINTAINER o2r-project <https://o2r.info>
RUN mkdir -p /usr/src/app \
  && git clone --depth 1 -b master https://github.com/o2r-project/o2r-badger /usr/src/app

WORKDIR /usr/src/app

RUN npm install --production
EXPOSE 8089 

# run the app and the testserver 
CMD ["npm", "start"]