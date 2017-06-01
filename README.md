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

## Requirements

- Node.js `>= 6.2`
- npm
- Docker
- Access to the following services:
    - o2r (https://o2r.uni-muenster.de)
    - crossref (https://www.crossref.org/)
    - DOAJ (https://doaj.org/)
    
Note that the badger will only find results if the respective service has the publication listed.

Services and what they are used for:

o2r:

    - executability
    - license
    - location
    
crossref:

    - release time
    
DOAJ: 

    - peer review status

## Remote installation

```bash
docker pull o2rproject/o2r-badger

## Start the badger:
DEBUG=* docker run -it -e -p 8089:8089 o2rproject/o2r-badger
```

## Local installation

First, clone the repository:

```bash
git clone https://github.com/o2r-project/o2r-badger
```

This project includes a `Dockerfile` which can be built with:

```bash
docker build -t badger -f Dockerfile.local .

## Start the badger:
DEBUG=* docker run -it -e -p 8089:8089 badger
```

The badger is running and can be accessed via `http://localhost:8089/`. To display badges for common research aggregators, install the o2r-extender, a chrome extension. More info [here](https://github.com/o2r-project/o2r-extender/)

### Examples:

1) GET (peer review badge):

`curl http://…/api/1.0/badge/peerreview/doaj/10.5194%2Fgmdd-8-3905-2015`

`GET /api/1.0/badge/peerreview/doaj/10.5194%2Fgmdd-8-3905-2015`

Will return a small badge for the DOI `10.5194/gmdd-8-3905-2015`.

2) POST (license badge):

```bash
curl -o output.svg -H "Content-Type: application/json" --data '{  
   "id":"opxYU",
   "created":"2016-08-19T13:59:13.134Z",
   "metadata":{  
      "licence":{  
         "data":"Against-DRM",
         "text":"CC-BY-4.0",
         "code":"AAL"
      }
   }
}' http://.../api/1.0/badge/licence/o2r/extended
```

Will return a big badge for the license data contained in the json document (o2r compendium).


## API Documentation

### Routes

### URL parameters

## Configuration

Environment variables:

You can override these environment variables (configured in `config/config.js`) when starting the service.

- `BADGER_PORT`
  Defines the port the badger is listening to. Defaults to `8089`.
- `BADGER_O2R_HOST`
  The address used to query the o2r [API](http://o2r.info/o2r-web-api/) . Defaults to `https://o2r.uni-muenster.de`.
- `BADGER_TEST_ENDPOINT`
  The address used for tests. Defaults to `http://localhost`

config.js:

- `c.net.proxy` 
  Proxy used for all outgoing requests (o2r, crossref, doaj). Not tested.
- `c.ext.crossref`
  Crossref API endpoint for works.
- `c.ext.o2r`
  o2r endpoint. Can be modified `BADGER_O2R_HOST`.
- `c.ext.doajArticles` and `c.ext.doajJournals`
  DOAJ search endpoint for articles and journals.

## Tests

First start the badger locally, then run:

`npm test`

# Study project documentation
 
**May be outdated!**

## 1 Scalable badges (geocontainer-badges/scalability)

This project provides an API for retrieving a scalable badge as svg or png.

### Installation

In order to use this API, make sure that you have installed [Docker](https://www.docker.com/) and [Node.js] (https://nodejs.org/en/).

Then clone our repository:

`git clone git@zivgitlab.uni-muenster.de:geocontainer-badges/scalability.git`

#### with Docker

Navigate to the downloaded folder and build a docker image:  
`docker build -t scalability .`

Then run the image:  
`docker run -p 3000:3000 scalability`  
Finally test the API with the localhost.

#### with Node

You can also run the API without Docker.  
Navigate to the downloaded folder and type:  
`npm install && npm start`  
Afterward you can test the API in the browser or run the testfile:  
`npm test`  

### License

[Apache License 2.0](https://zivgitlab.uni-muenster.de/geocontainer-badges/scalability/blob/master/LICENSE)

## 2 Spatial information badges (geocontainer-badges/spatial-information)

This badge will provide the user information about where a research took place. 
The base for receiving those information is a bounding box in json format.
For the small badge, the mean center of the bounding box is calculated and sended via reverse geocoding to the geocoding service geonames.org. This service sends back
the country and if available also the district. 
For the extended badge, the spatial information can be requested via the o2r API /spatial/o2r/:id/extended. When requesting the API, the user receives a Leaflet Map 
where the bounding box of the research location is highlighted.

### Usage


#### shields.io badge

First clone the repository of the chrome extension:

`git clone git@zivgitlab.uni-muenster.de:geocontainer-badges/reproducability.git`

Afterwards open your Chrome browser and go to 'chrome://extension'. There you have to upload the folder you have just cloned.
Now the extension is ready to use. Go to one of the supported websites, like Google Scholar, Mendeley, PLOS, Microsoft Academic or Science Direct and search
for your prefered research topic. Try "air quality". Submit the search and wait until the shields.io badges appear. The spatial information badge is called
"reasearch location" and will provide you the location where the paper was published.

#### extended badge

First clone the spatial information repository:

`git clone git@zivgitlab.uni-muenster.de:geocontainer-badges/spatial-information.git`

You will receive the extended badge as follows:

 * Change line 6 in the index.js to: var server = 'http://localhost:8080'
 * Run the index.js
 * Run the server.js
 * Test URL: 'localhost:3005/api/1.0/badge/spatial/o2r/1/extended'



## 3 Executability badges (geocontainer-badges/executable-code)

The project developed an API for retrieving information on the executability of compendia. 
It was established in the context of the [o2R project](http://o2r.info/page2/). 
The information about the executablility of a compendia are requested from the o2R API. 

API to recieve a executable-badge for a compendium: <http://localhost:3001/api/1.0/badge/executable/o2r/:id/extended> 

with id beeing an o2R compendium id. 
It is also possible to receive a badge using an DOI as id, but right now the API will not return any information (just for a few test DOIs). It that case the doi has to start with "doi:" and must be URL encoded.
The parameter "extended" is optimal; is it given a extended badge is provided, otherwise a badge with reduced complexity.

### Try yourself
The project is based on [Docker](https://www.docker.com/), thus you have to install Docker.

Next download the project files from [GitLab](https://zivgitlab.uni-muenster.de/geocontainer-badges/executable-code).
In Docker: Build the image and run it:

    cd <projektfolder>
    docker build -t executable .
    docker run -p 3001:3001  executable

### Mocha tests

You can run pre-implemented mocha-tests to test the api for extended badges. 
To run the implemented mocha-tests [Node](https://nodejs.org/en/) must be installed (globally) on your computer.
You can run the following comands in Docker. Change to the parent directory and install the required packages:

    cd <projektfolder>
    npm install

To start the test type (while both servers are running):

    npm test

### License

Apache License 2.0

## 4 License badges (geocontainer-badges/licencing)

The project's aim is to provide an API, which gives information about the licencing of a research compendium.

The API is specified as: ```/api/1.0/badge/o2r/licence/:id/:extended?```. With ```:id``` specifying the ID of the research compendium and ```:extended``` is optional. If ```extended``` is given in the URL, the big badges are sent to the client. Otherwise, small badges from [shields.io](https://shields.io/) are the response.
For licences of code (software) the list of licences available at [Open Definition Licenses Service](http://licenses.opendefinition.org/#all-licenses)
with this ```json``` [file](http://licenses.opendefinition.org/licenses/groups/osi.json) is provided.
For licences of data and text of the research compendia the licences from [Open Definition](http://opendefinition.org/licenses/) is used
with the list in this ```json``` [file](http://licenses.opendefinition.org/licenses/groups/od.json).

### Run the project

To run the project on your machine do the following:
- clone the repository from the [project's page](https://zivgitlab.uni-muenster.de/geocontainer-badges/licencing)
- navigate to the directory where you cloned it and into ```/testserver```
- Build the [Docker](www.docker.com) images from it:
`docker build -t licencetest .` (don't forget the "." at the end)
- go back to the directory ```/licencing``` and build the second image
`docker build -t licencing .`
- run the Docker image in a container with:
  * ```docker run -d -p 8080:8080 licencetest``` 
  * ```docker run -p 3003:3003 licencing``` 
The project script was developed for windows user using the Docker Toolbox.
If your are working with another system you will maybe have to set environment variables to run the server on the correct ip:
`docker run -p 8081:8081 -d licencetest`
`docker run -p 3001:3001 -e "TESTSERVER=http://<your_docker_ip>:8080" -e "NODE_SERVER=http://<your_docker_ip>:3003" licencing`
(ascertain IP in Docker Toolbox: docker-machine ip)

### Licence

The licence for the projct is licenced under [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0).

## 5 Release date badges (geocontainer-badges/release)

The overall project aims to create badges that helps making research reproducible. That is, the badges will explain the state of any material (for example data, code and articles) in a research so that it can be understood by others when they have a look at it later and possibly even build upon it.

### Release Badges
In this project we developed an API for retrieving badges which provide information about the release date of a compendium.

**API** to receive a release-badge for a compendium with a specific DOI (testing locally):
**http://localhost:3004/api/1.0/badge/releasetime/crossref/doi:<value>/**

with **value** being an URL-encoded DOI of an published compendium. To receive a "big badge" for a paper page, "extended" has to be added at the end of the API.

This project is based on **Docker**, thus you can run it in a docker container:

```
cd <project_folder>
docker build -t release .
docker run -p 3004:3004 release
``` 

The information about the release date are requested through the [crossref API](https://github.com/CrossRef/rest-api-doc/blob/master/rest_api.md). 
## License
This project is licenced under Apache License 2.0.

## 6 Peer-review badges (geocontainer-badges/peer-review)

### Our Task
Creating badges to check if a journel is peer reviewed or not. 

Components of our task:
* Application Sever (Badge API)
* API for DOAJ (Directory of Open Access Journals)
* API for Shields.io (A platform that serves fast and scalable information images a s badges)
* Web Client
* Docker Container

### Architecture
The architecture can be roughly split into web client, PHP application server, [Shields.io](https://shields.io/) and [DOAJ API](https://doaj.org/api/v1/docs).

The client sends a request to the server. The server then contacts DOAJ and Shields.io through their APIs. From DOAJ it accesses different journals that are assigned different DOIs, through which additional information about the journals can be brought out. Here it gets to know whether a journel is peer reviewed or not. From the shields.io it get a badge which displays the state of a particular journal along with the colour in order to add more meaning to the badge. All the code that is responisible for this is then copied into a Dockerfile and that file a Docker image is created and finally run as a Docker container.

So to sum it up, the server is the central part of the whole process:

* serving the client's request
* providing the public API
* communicating with DOAJ and Shields.io

### Installation
We used [Docker](https://www.docker.com/) to create a consistent environment. Docker is a software containerization platform that allows the users to run their projects in containers. Instead of virtual machines being created there are containers that are much more lightweight as compared to virtual machines. Basically you first make a Dockerfile, from which you then create a Docker image and then finally you run that image in the form of containers to check out the results of the project. Make sure that you have installed Docker [Docker installation](https://docs.docker.com/engine/installation/) and all the dependencies according to the operating system you use.

Just clone the project from Gitlab using the following command:

```
  git clone git@zivgitlab.uni-muenster.de:geocontainer-badges/peer-review.git
```
Once you are done with it navigate to the folder where you see three files:
```
  src          Dockerfile         README.md
```
From this Dockerfile you can then create a Docker image and then run it as a container. Here are the commands to execute these tasks:
```
 docker build -t peer-review .    //creates an image (please donot forget the "." in the end
 docker run -p 3002:80 peer-review   //runs the image as container
```
Finally have a look at the results on the localhost:3002. 

You can configure the program using docker environment variables.

* ```HTTP_PROXY``` can be a proxy server to use for the PHP file requests.
* ```PHP_DEBUG``` with any value can be used to turn on error reporting / debug mode.

If you don't want to use Docker you can also publish the code in the src/ directory to any webspace that supports PHP 5.6 or newer with default modules and Apache with mod_rewrite. Configuration variables can be set in the config.php file.

### Usage

The following API calls are supported (localhost might need to be replaced by a custom host name or IP address):

* Get a list of supported services: http://localhost:3002/api/1.0/badge/
* Get a badge for the service $SERVICE with the identifier $ID: http://localhost:3002/api/1.0/badge/peerreview/$SERVICE/$ID

As you will notice currently the only service supported is DOAJ, with a DOI as identifier. An example request would be:

* http://localhost:3002/api/1.0/badge/peerreview/doaj/doi:10.3389/fpsyg.2013.00478

### Known issues and limitations

* There are only 'peer-reviewed' journals in the DOAJ so we just get a green badge in return having no case of 'non peer-reviewed'
 
### License
Apache License 2.0