# O2R-Badger

API for retrieving scalable badges on reproducibility. 

Based on the following microservices (part of the "Badges for computational geoscience containers" study project at ifgi):

- [geocontainer-badges/scalability](https://zivgitlab.uni-muenster.de/geocontainer-badges/scalability)
- [geocontainer-badges/spatial-information](https://zivgitlab.uni-muenster.de/geocontainer-badges/spatial-information)
- [geocontainer-badges/executable-code](https://zivgitlab.uni-muenster.de/geocontainer-badges/executable-code)
- [geocontainer-badges/licencing](https://zivgitlab.uni-muenster.de/geocontainer-badges/licencing)
- [geocontainer-badges/release](https://zivgitlab.uni-muenster.de/geocontainer-badges/release)
- [geocontainer-badges/peer-review](https://zivgitlab.uni-muenster.de/geocontainer-badges/peer-review)
- [geocontainer-badges/testservers](https://zivgitlab.uni-muenster.de/geocontainer-badges/testservers)

## _Work in progress_

## Installation

In order to use this API, make sure that you have installed [Docker](https://www.docker.com/) and [Node.js] (https://nodejs.org/en/).

Then clone our repository:

`git clone git@zivgitlab.uni-muenster.de:geocontainer-badges/scalability.git`

### with Docker

Navigate to the downloaded folder and build a docker image:  
`docker build -t scalability .`

Then run the image:  
`docker run -p 3000:3000 scalability`
Finally test the API with the localhost.

### with Node

You can also run the API without Docker.
Navigate to the downloaded folder and type:  
`npm install && npm start`  
Afterward you can test the API in the browser or run the testfile:  
`npm test`  

## License

[Apache License 2.0](https://zivgitlab.uni-muenster.de/geocontainer-badges/scalability/blob/master/LICENSE)