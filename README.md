# o2r badger

[![](https://images.microbadger.com/badges/image/o2rproject/o2r-badger.svg)](https://microbadger.com/images/o2rproject/o2r-badger "Get your own image badge on microbadger.com") 

API for retrieving scalable badges for scientific publications.
 Used by the [o2r-extender](https://github.com/o2r-project/o2r-extender), which is a Chrome extension that integrates these badges into several research aggregators.

Based on the [_Badges for computational geoscience containers_](https://zivgitlab.uni-muenster.de/geocontainer-badges) study project at [ifgi](https://www.uni-muenster.de/Geoinformatics/en/index.html).
We thank the [project team](#contributors) for their contributions for this project.

## Badges

- `executable`: Information about executability and reproducibility of a publication.
- `licence`: The license type.
- `spatial`: Where research took place. 
- `releasetime`: The publication date. 
- `peerreview`: If and by which process the publication was peer reviewed.

Services and what they are used for:

- [o2r](https://o2r.uni-muenster.de): `executable`, `licence`, `location`
- [crossref](https://www.crossref.org/): `releasetime`
- [DOAJ](https://doaj.org/):  `peerreview`

Note that the badger will only find results if the respective service has the publication listed.

## Requirements

- Node.js `>= 6.2` and npm (optional; for development)
- Docker
- Access to the following services:
    - o2r API (https://o2r.uni-muenster.de)
    - Crossref API (https://www.crossref.org/)
    - DOAJ API (https://doaj.org/)
    - GeoNames API (http://geonames.org)

## Installation

There are three options to get the badger running on your system.

### 1) with Docker, via Docker Hub

```bash
docker run -it -e DEBUG=* -p 8089:8089 o2rproject/o2r-badger
```

### 2) with Docker, locally build image

First, clone the repository: `git clone https://github.com/o2r-project/o2r-badger`

This project includes a `Dockerfile` which can be built and started with:

```bash
docker build -t badger .

docker run -it -e DEBUG=* -p 8089:8089 badger
```

### 3) with Node.js

```bash
git clone https://github.com/o2r-project/o2r-badger
cd o2r-badger
npm install --production

DEBUG=* npm start
```

The badger is running and can be accessed via `http://localhost:8089/`.
 To display badges for common research aggregators, install the o2r-extender, a chrome extension.
  More info [here](https://github.com/o2r-project/o2r-extender/).

### Examples

1) **GET** (peer review badge, small):

`curl http://localhost:8089/api/1.0/badge/peerreview/10.5194%2Fgmdd-8-3905-2015`

Returns a small badge for the DOI `10.5194/gmdd-8-3905-2015`:

![small-badge-yes](https://img.shields.io/badge/peer%20review-yes-green.svg)

2) **POST** (license badge, extended):

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
}' http://localhost:8089/api/1.0/badge/licence/extended
```

Will return a big badge for the license data contained in the json document (o2r compendium):

![big-badge-open](https://cdn.rawgit.com/o2r-project/o2r-badger/2d50423e/controllers/license/badges/license_open.svg)

## API Documentation (Version 0.2)

**Small badges:**

`GET /api/1.0/badge/:type/:doi`

The badger can also create a badge for information that is sent via a POST request (see the [example](#Examples) above):

`POST /api/1.0/badge/:type`

**Extended badges:**

`GET /api/1.0/badge/:type/:doi/extended`

`POST /api/1.0/badge/:type/extended`

### Path paramters

- `:type`: Badge type, one of `executable`, `spatial`, `licence`, `releasetime` or `peerreview`
- `:doi`: A [DOI](https://doi.org) to identify the publication, in the form `10.999/test`

The DOI **must** be URL encoded!

### Body parameters (for extended badges only)

- `format` - The image format for extended badges. May be `svg` or `png`
- `width` - The image width for extended badges

### Error responses

If the badger finds no data for a given DOI a grey "n/a" badge is returned: 

![na badge](https://img.shields.io/badge/research%20location-n%2Fa-lightgrey.svg)

If there is an unexpected error during execution, or if the services are not accessible, an error will be returned:

```bash
404 Not found
{"error":"error accessing crossref API"}
```

## Configuration

Most relevant configuration can be done via the following environment variables when starting the service.
They are picked up in the file `config/config.js` where all configuration settings can be changed.

- `BADGER_PORT`
  Defines the port the badger is listening to. Defaults to `8089`.
- `BADGER_O2R_HOST`
  The address used to query the o2r [API](http://o2r.info/o2r-web-api/) . Defaults to `https://o2r.uni-muenster.de`.
- `BADGER_TEST_ENDPOINT`
  The address used for tests. Defaults to `http://localhost`
- `DISABLE_TRACKING`
  Disables [Piwik](https://piwik.org/) API tracking when set to `true`. Defaults to `false`.
- `PIWIK_TOKEN`
  The secret piwik token used to access the Piwik tracking server.

Other settings in `config.js` without corresponding environment variable:

- `c.net.proxy` 
  Proxy used for all outgoing requests (o2r, crossref, doaj). _Not tested._
- `c.ext.crossref`
  Crossref API endpoint.
- `c.ext.o2r`
  o2r endpoint. Can be modified via `BADGER_O2R_HOST`.
- `c.ext.doajArticles` and `c.ext.doajJournals`
  DOAJ search endpoint for articles and journals.

Additional Piwik API tracking settings:

- `c.tracking.piwikURL`
  Piwik server address.
- `c.tracking.piwikBaseURL`
  Piwik base URL which is prepended to all API routes.
- `c.tracking.piwikSiteID`
  Piwik site ID. Can be found in the [piwik tracking code](https://developer.piwik.org/guides/tracking-javascript-guide#finding-the-piwik-tracking-code).

## Piwik

The badger tracks API requests using [Piwik](https://piwik.org/) except for requests with a "do not track" header.

A (local) piwik server can be set up [manually](https://piwik.org/docs/installation/) or [using Docker Compose](http://www.bauerspace.com/set-up-piwik-in-docker/).

## Development

First install the badger locally:

```bash
npm install
```
Then start it with `npm start` or in your development environment.

For tests run `npm test`.

# Study project documentation (shortened)

This work is based on the study project "Badges for computational geoscience containers", see [here](https://studium.uni-muenster.de/qisserver/rds?state=verpublish&status=init&vmfile=no&publishid=230703&moduleCall=webInfo&publishConfFile=webInfo&publishSubDir=veranstaltung) and the [original code repositories](https://zivgitlab.uni-muenster.de/groups/geocontainer-badges).

## 1 Scalable badges (geocontainer-badges/scalability)

This project provides an API for retrieving a scalable badge as svg or png.

## 2 Spatial information badges (geocontainer-badges/spatial-information)

This badge will provide the user information about where a research took place. 
The base for receiving those information is a bounding box in json format.
For the small badge, the mean center of the bounding box is calculated and sent via reverse geocoding to the geocoding service [GeoNames](https://geonames.org).
This service sends back
the country and if available also the district. 
For the extended badge, the spatial information can be requested via the o2r API /spatial/o2r/:id/extended.
When requesting the API, the user receives a Leaflet Map 
where the bounding box of the research location is highlighted.

## 3 Executability badges (geocontainer-badges/executable-code)

The project developed an API for retrieving information on the executability of compendia. 
It was established in the context of the [o2r project](http://o2r.info/). 
The information about the executablility of a compendia are requested from the [o2r API](http://o2r.info/o2r-web-api/). 

## 4 License badges (geocontainer-badges/licencing)

The project's aim is to provide an API, which gives information about the licencing of a research compendium.

The API is specified as: ```/api/1.0/badge/licence/:id/:extended?```. With ```:id``` specifying the ID of the research compendium and ```:extended``` is optional.
If ```extended``` is given in the URL, the big badges are sent to the client. Otherwise, small badges from [shields.io](https://shields.io/) are the response.
For licences of code (software) the list of licences available at [Open Definition Licenses Service](http://licenses.opendefinition.org/#all-licenses)
with this ```json``` [file](http://licenses.opendefinition.org/licenses/groups/osi.json) is provided.
For licences of data and text of the research compendia the licences from [Open Definition](http://opendefinition.org/licenses/) is used
with the list in this ```json``` [file](http://licenses.opendefinition.org/licenses/groups/od.json).

## 5 Release date badges (geocontainer-badges/release)

In this project we developed an API for retrieving badges which provide information about the release date of a compendium.

**API** to receive a release-badge for a compendium with a specific DOI (testing locally):
**http://localhost:8089/api/1.0/badge/releasetime/:id/**

with **id** being an URL-encoded DOI of an published compendium.
To receive a "big badge" for a paper page, "extended" has to be added at the end of the API.

The information about the release date are requested through the [crossref API](https://github.com/CrossRef/rest-api-doc/blob/master/rest_api.md). 

## 6 Peer-review badges (geocontainer-badges/peer-review)

### Our Task
Creating badges to check if a journel is peer reviewed or not. 

Components of our task:
* Application Sever (Badge API)
* API for [DOAJ](http://doaj.org/) (Directory of Open Access Journals)
* API for Shields.io (A platform that serves fast and scalable information images a s badges)
* Web Client
* Docker Container

### Usage

The following API calls are supported (localhost might need to be replaced by a custom host name or IP address):

* Get a list of supported services: http://localhost:8089/api/1.0/badge/
* Get a badge for the service $SERVICE with the identifier $ID: http://localhost:8089/api/1.0/badge/peerreview/$ID

As you will notice currently the only service supported is DOAJ, with a DOI as identifier. An example request would be:

* http://localhost:8089/api/1.0/badge/peerreview/10.3389%2Ffpsyg.2013.00478

### Known issues and limitations

* There are only 'peer-reviewed' journals in the DOAJ so we just get a green badge in return having no case of 'non peer-reviewed'.

## Contributors

- Antonia van Eek
- Clara Rendel
- Lasse Einfeldt
- Laura Meierkort
- Marlena Götza
- Salman Khalid
- Shahzeib Tariq Jaswal
- Nimrod Gavish
- Matthias Mohr
- Daniel Nüst
- Lukas Lohoff

## How to cite

If you reference this project in scholarly communication, please use the citations provided on EarthArxiv: https://doi.org/10.31223/osf.io/xtsqh

```
Nüst, Daniel, Lukas Lohoff, Lasse Einfeldt, Nimrod Gavish, Marlena Götza, Shahzeib T. Jaswal, Salman Khalid, et al. 2019. “Guerrilla Badges for Reproducible Geospatial Data Science (AGILE 2019 Short Paper).” EarthArXiv. June 19. doi:10.31223/osf.io/xtsqh.
```

Code archive: [![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.1199272.svg)](https://doi.org/10.5281/zenodo.1199272)

## Licence

This project is licensed under [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0).
