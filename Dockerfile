

FROM node:boron 
RUN mkdir -p /usr/src/app 
WORKDIR /usr/src/app 

# Install app dependencies 
COPY package.json /usr/src/app/ 
# Bundle app source 
RUN npm install
COPY . /usr/src/app 
EXPOSE 3000 

# run the app and the testserver 
CMD ["npm", "start"]

