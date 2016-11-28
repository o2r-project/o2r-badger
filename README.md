## Scalable Badges
This project provides an API for retrieving a scalable badge as svg or png.

#### Installation
In order to use this API, make sure that you have installed [Docker](https://www.docker.com/) and [Node.js] (https://nodejs.org/en/).

Then clone our repository:    
`git clone git@zivgitlab.uni-muenster.de:geocontainer-badges/scalability.git`

##### with Docker
Navigate to the downloaded folder and build a docker image:  
`docker build -t scalability .`  
Then run the image:  
`docker run -p 30:3000 scalability`  
Finally test the API with the localhost.

##### with Node
You can also run the API without Docker.  
Navigate to the downloaded folder and type:  
`npm install && npm start`  
Afterward you can test the API in the browser or run the testfile:  
`npm install mocha && npm test`
  
  
You can test the API e.g. with the following URLs:
 * http://localhost:3000/api/1.0/badge/doaj/1234?type=png&width=1000
 * http://localhost:3000/api/1.0/badge/doaj/1234?type=svg
 * http://localhost:3000/api/1.0/badge/doaj/1234?type=png

#### License
SVG2PNG: [license](https://github.com/domenic/svg2png/blob/master/LICENSE.txt)  
Express: [license](https://github.com/expressjs/express/blob/master/LICENSE)  
Node-PN: [license](https://github.com/cscott/node-pn)

#### Known Limitations & Issues
The SVG file to be converted to PNG *must* have in its header the following attributes: Width, Height, and **Viewport**.   
In *index.js*, the variable "badgename" (line 13) must be set to the filename of the SVG (without the .svg extension). 

