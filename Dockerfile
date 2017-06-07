FROM node:6
MAINTAINER o2r-project <https://o2r.info>
RUN mkdir -p /usr/src/app \
  && git clone --depth 1 -b master https://github.com/o2r-project/o2r-badger /usr/src/app

WORKDIR /usr/src/app

RUN npm install --production
EXPOSE 8089

# Metadata params provided with docker build command
ARG VERSION=dev
ARG VCS_URL
ARG VCS_REF
ARG BUILD_DATE

# Metadata http://label-schema.org/rc1/
LABEL org.label-schema.vendor="o2r project" \
      org.label-schema.url="http://o2r.info" \
      org.label-schema.name="o2r badger" \
      org.label-schema.description="Badge creation for science" \    
      org.label-schema.version=$VERSION \
      org.label-schema.vcs-url=$VCS_URL \
      org.label-schema.vcs-ref=$VCS_REF \
      org.label-schema.build-date=$BUILD_DATE \
      org.label-schema.docker.schema-version="rc1"

# run the app and the testserver 
CMD ["npm", "start"]