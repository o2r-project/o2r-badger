/**
* Include services used for the application 
*/
const debug = require('debug')('badger');
const config = require('../../config/config');
const request = require('request');
const fs = require ('fs');
const path = require('path');
const scaling = require('../scaling/scaling');

let server = config.ext.testserver;
let badgeNASmall = 'https://img.shields.io/badge/research%20location-n%2Fa-lightgrey.svg';
let badgeNABig = 'indexNoMap.html';

exports.getBadgeFromData = (req, res) => {

    let passon = {
        body: req.body,
        extended: req.params.extended,
        req: req,
        res: res
    };

    let getBadge;

    if (passon.extended === 'extended') {
        getBadge = sendBigBadge(passon)
    } else {
        getBadge = getCenterFromData(passon)
            .then(getGeoName)
            .then(sendSmallBadge)
    }

    return getBadge
        .then((passon) => {
            debug('Completed generating badge');
        })
        .catch(err => {
            if (err.badgeNA === true) { // Send 'N/A' badge
                debug("No badge information found: %s", err);
                if (passon.extended === 'extended') {
                    passon.req.filePath = path.join(__dirname, badgeNABig);
                    scaling.resizeAndSend(passon.req, passon.res);
                } else if (passon.extended === undefined) {
                    res.redirect(badgeNASmall);
                } else {
                    res.status(404).send('not allowed');
                }
            } else { // Send error response
                debug("Error generating badge: %s", err);
                let status = 500;
                if (err.status) {
                    status = err.status;
                }
                let msg = 'Internal error';
                if (err.msg) {
                    msg = err.msg;
                }
                res.status(status).send(JSON.stringify({ error: msg }));
            }
        });
};

exports.getBadgeFromReference = (req, res) => {

    let id = req.params.id;
    let extended;

    debug('Handling badge generation for id %s', req.params.id);

    //extract doi from the id parameter (e.g. doi:11.999/asdf.jkl)
    if(id.substring(0, 4) === "doi:") {
        id = id.substring(4);
    } else {
        debug('doi is invalid');
        res.redirect(badgeNASmall); //todo move this in all services
        return;
    }

    if (typeof req.query.extended !== 'undefined') {
        extended = req.query.extended;
    }

    let passon = {
        id: id,
        extended: extended,
        req: req,
        res: res
    };

    let getBadge;

    if (passon.extended === 'extended') {
        getBadge = getCompendiumID(passon)
            .then(getCompendium)
            .then(sendBigBadge)
    } else {
        getBadge = getCompendiumID(passon)
            .then(getCompendium)
            .then(getCenterFromData)
            .then(getGeoName)
            .then(sendSmallBadge)
    }

    return getBadge
        .then((passon) => {
            debug('Completed generating badge');
        })
        .catch(err => {
            if (err.badgeNA === true) { // Send 'N/A' badge
                debug('No badge information found', err);
                if (passon.extended === 'extended') {
                    passon.req.filePath = path.join(__dirname, badgeNABig);
                    scaling.resizeAndSend(passon.req, passon.res);
                } else if (passon.extended === undefined) {
                    res.redirect(badgeNASmall);
                } else {
                    res.status(404).send('not allowed');
                }
            } else { // Send error response
                debug('Error generating badge:', err);
                let status = 500;
                if (err.status) {
                    status = err.status;
                }
                let msg = 'Internal error';
                if (err.msg) {
                    msg = err.msg;
                }
                res.status(status).send(JSON.stringify({ error: msg }));
            }
        });
};

function getCompendiumID(passon) {
    return new Promise((fulfill, reject) => {
        let requestURL = config.ext.o2r + '/api/v1/compendium?doi=' + passon.id;
        debug('Fetching compendium ID from %s with URL', config.ext.o2r, requestURL);

        request(requestURL, function(error, response, body) {

            // no job for the given id available
            if(error) {
                debug(error);
                reject(error);
                return;
            }
            // status responses
            if(response.statusCode === 404 || !body.results) {
                let error = new Error();
                error.msg = 'no compendium found';
                error.status = 404;
                error.badgeNA = true;
                reject(error);
            }
            else if(response.statusCode === 500 || response.status === 500) {
                let error = new Error();
                error.msg = 'error filtering for doi';
                error.status = 500;
                reject(error);
            }

            let data = JSON.parse(body);

            // If exactly one compendium was found, contiune. Otherwise, redirect to the 'N/A badge'
            if (data.results && data.results.length === 1) {
                passon.compendiumID = data.results[0];
                fulfill(passon);
            } else {
                debug('Found more than one compendium for DOI %s', passon.id);
                let error = new Error();
                error.msg = 'no compendium found';
                error.status = 404;
                error.badgeNA = true;
                reject(error);
            }
        });
    });
}

function getCompendium(passon) {
    return new Promise((fulfill, reject) => {
        let requestURL = config.ext.o2r + '/api/v1/compendium/' + passon.compendiumID;
        // example compendium: https://o2r.uni-muenster.de/api/v1/compendium/cUgvE
        debug('Fetching location for compendium %s from %s', passon.compendiumID, requestURL);

        // request to the o2r server
        request(requestURL, function(error, response, body) {
            if (error) {
                reject(error);
            }

            if (response.statusCode !== 200) {
                let error = new Error();
                error.msg = 'error accessing o2r metadata';
                error.status = 404;
                error.badgeNA = true;
                reject(error);
            }

            passon.body = JSON.parse(body);
            fulfill(passon);
        });
    });
}

// from o2r json to bbox
function getCenterFromData(passon) {
    return new Promise((fulfill, reject) => {
        debug('Reading spatial information from o2r data');

        if (typeof passon.body === 'undefined') {
            let error = new Error();
            error.msg = 'no geo name provided';
            error.status = 404;
            error.badgeNA = true;
            reject(error);
        }

        let coordinates = passon.body;

        try {
            let coords = coordinates.metadata.spatial.union.geojson.bbox;
            debug('Bounding box is %s, %s, %s, %s', coords[0], coords[1], coords[2], coords[3]);
        } catch (err) {
            err.badgeNA = true;
            err.msg = 'o2r compendium does not contain spatial information (bbox)';
            reject(err);
        }

        //calculate the center of the polygon
        let result = calculateMeanCenter(coordinates);
        passon.latitude = result[0];
        passon.longitude = result[1];
        fulfill(passon)
    });
}

function getGeoName(passon) {
    return new Promise((fulfill, reject) => {
        let requestURL = 'http://api.geonames.org/countrySubdivisionJSON?lat=' + passon.latitude + '&lng=' + passon.longitude +'&username=badges';
        debug('Fetching geoname for compendium %s from %s', passon.compendiumID, requestURL);

        //and get the reversed geocoding for it
        request({url: requestURL,
            proxy: config.net.proxy}, function (error,response,body){
            if(response.statusCode === 200) {
                let geoname = JSON.parse(body);
                let geoname_ocean;
                // send the badge with the geocoded information to client
                if (geoname.status) {
                    request({url: 'http://api.geonames.org/oceanJSON?lat=' + passon.latitude + '&lng=' + passon.longitude + '&username=badges&username=badges',
                        proxy: config.net.proxy}, function (error,response,body){
                        if(response.statusCode === 200) {
                            geoname_ocean = JSON.parse(body);
                            try {
                                passon.geoName = geoname_ocean.ocean.name;
                            } catch (err) {
                                err.badgeNA = true;
                                err.msg = 'no ocean name found';
                                reject(err);
                            }
                            fulfill(passon);
                        } else {
                            let error = new Error();
                            error.msg = 'could not get geoname ocean';
                            error.status = 404;
                            error.badgeNA = true;
                            reject(error);
                        }
                    });
                } else if(geoname.codes) {
                    if (geoname.adminName1) {
                        passon.geoName = geoname.adminName1+"%2C%20"+geoname.countryName;
                        fulfill(passon);
                    } else {
                        passon.geoName = geoname.countryName;
                        fulfill(passon);
                    }
                }
            } else {
                let error = new Error();
                error.msg = 'could not get geoname';
                error.status = 404;
                error.badgeNA = true;
                reject(error);
            }
        });
    });
}

function sendSmallBadge(passon) {
    return new Promise((fulfill, reject) => {
        debug('Sending badge for geo name %s', passon.geoName);

        if (typeof passon.geoName === 'undefined') {
            let error = new Error();
            error.msg = 'no geo name provided';
            error.status = 404;
            error.badgeNA = true;
            reject(error);
        }
        passon.res.redirect("https://img.shields.io/badge/research%20location-" + passon.geoName + "-blue.svg");
        fulfill(passon);
    });
}

function sendBigBadge(passon) {
    return new Promise((fulfill, reject) => {
        debug('Sending map');

        function sendNA(text)  {
            passon.req.type = 'location';
            let error = new Error();
            error.msg = text;
            error.status = 404;
            error.badgeNA = true;
            reject(error);
        }

        let options = {
            dotfiles: 'deny',
            headers: {
                'x-timestamp': Date.now(),
                'x-sent': true
            }
        };

        let bbox;

        try {
            bbox = passon.body.metadata.spatial.union.geojson.bbox;
        } catch (err) {
            sendNA('could not read bbox of compendium');
        }

        //Generate map
        let html = fs.readFileSync('./controllers/location/index_template.html', 'utf-8');
        html.replace('bbox', "Hello");
        //insert the locations into the html file / leaflet
        let file = html.replace('var bbox;', 'var bbox = ' + JSON.stringify(bbox) + ';');
        let indexHTMLPath = './controllers/location/index.html';
        fs.writeFile(indexHTMLPath, file, (err) => {
            if (err) {
                debug('Error writing index.html file to %s', indexHTMLPath);
                reject(err);
            } else {
                passon.req.filePath = path.join(__dirname, 'index.html');
                passon.req.type = 'location';
                passon.req.options = options;
                debug('Sending map %s', passon.req.filePath);
                scaling.resizeAndSend(passon.req, passon.res);
                fulfill(passon);
            }
        });
    });
}

exports.getSmallSpatialBadge = (req, res) => {
	let id = req.params.id;
	let coordinates;

	// map the doi to the fake id for test server
	if(id.substring(0, 4) === "doi:") {
        id = id.substring(4);

        switch(encodeURIComponent(id)) {
            case '10.1006%2Fjeem.1994.1031':
                id = 1;
                break;
            case '10.1115%2F1.2128636':
                id = 2;
                break;
            case '10.1029%2Fjd095id10p16343':
                id = 3;
                break;
            case '10.1126%2Fscience.1092666':
                id = 4;
                break;
			default: break;
		}
	}
	// call the test server with fake id
	request(server + '/spatial/' + id, function(error, response, body) {
		if (error) {
			debug(error);
			res.redirect("https://img.shields.io/badge/research%20location-n%2Fa-lightgrey.svg");
			return;
		}
		//response is valid
		if(response.statusCode === 200) {
			coordinates = JSON.parse(body);			
		
			//calculate the center of the polygon
			let result = calculateMeanCenter(coordinates);
			//and get the reversed geocoding for it
			request({url: 'http://api.geonames.org/countrySubdivisionJSON?lat='+result[0]+'&lng='+result[1]+'&username=badges', 
				proxy: config.net.proxy}, function (error,response,body){
					if(response.statusCode === 200) {
						let geoname = JSON.parse(body);
						let geoname_ocean;
						// send the badge with the geocoded information to client
						if (geoname.status) {
							request({url: 'http://api.geonames.org/oceanJSON?lat=' + result[0] + '&lng=' + result[1] + '&username=badges&username=badges', 
								proxy: config.net.proxy}, function (error,response,body){
									if(response.statusCode === 200) {
										geoname_ocean = JSON.parse(body);
										res.redirect("https://img.shields.io/badge/research%20location-" + geoname_ocean.ocean.name + "-blue.svg");
									}
									else res.redirect("https://img.shields.io/badge/research%20location-n%2Fa-lightgrey.svg");
							});
						} else if(geoname.codes) {
							if (geoname.adminName1) {
								res.redirect("https://img.shields.io/badge/research%20location-"+geoname.adminName1+"%2C%20"+geoname.countryName+"-blue.svg");
							} else {
								res.redirect("https://img.shields.io/badge/research%20location-"+geoname.countryName+"-blue.svg");
							}
						}
					}
					else {
						res.redirect("https://img.shields.io/badge/research%20location-n%2Fa-lightgrey.svg");
					}
			})
		}
		else {
			res.redirect("https://img.shields.io/badge/research%20location-n%2Fa-lightgrey.svg");
		}
	});
};

/**
 * @desc retrieve a big badge in form of an html file containing a leaflet map
 */
exports.getBigSpatialBadge = (req, res) => {
	let id = req.params.id;
	let coordinates;
	//map doi to fake id for test server
	if(id.substring(0, 4) === "doi:") {
        id = id.substring(4);

        switch(encodeURIComponent(id)) {
            case '10.1006%2Fjeem.1994.1031':
                id = 1;
                break;
            case '10.1115%2F1.2128636':
                id = 2;
                break;
            case '10.1029%2Fjd095id10p16343':
                id = 3;
                break;
            case '10.1126%2Fscience.1092666':
                id = 4;
                break;
			default: break;
		}
	}

	let options = {
        root: __dirname,
        dotfiles: 'deny',
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true
        }
    };
	// request the metadata from testserver
	request(server + '/spatial/' + id, function(error, response, body) {
		if (error) {
			debug(error);
			res.redirect("https://img.shields.io/badge/research%20location-n%2Fa-lightgrey.svg");
			return;
		}
		if(response.statusCode === 200) {
			coordinates = JSON.parse(body);
			let html = fs.readFileSync('./controllers/location/index_template.html', 'utf-8');
			html.replace('bbox', "Hello");
			//insert the locations into the html file / leaflet
			let file = html.replace('var bbox;', 'var bbox = ' + JSON.stringify(coordinates.metadata.spatial.union.geojson.bbox) + ';');
			fs.writeFileSync('./controllers/location/index.html', file);
			req.filePath = path.join(__dirname, 'index.html');
			req.type = 'location';
			req.options = options;
			debug('Sending map %s', req.filePath);
			scaling.resizeAndSend(req, res); 
		}
		else {
			req.filePath = path.join(__dirname, 'indexNoMap.html');
			req.type = 'location';
			req.options = options;
			debug('Sending map %s', req.filePath);
			scaling.resizeAndSend(req, res); 
		}
	});    
};

/**
 * @desc calculate the mean center of a polygon
 * @param json geojson file containing the bbox of an area
 */
function calculateMeanCenter(json) {
	let bbox = json.metadata.spatial.union.geojson.bbox;

	let x1 = parseFloat(bbox[1]);
	let y1 = parseFloat(bbox[0]);
	let x2 = parseFloat(bbox[3]);
	let y2 = parseFloat(bbox[2]);
	let centerX= x1 + ((x2 - x1) / 2);
	let centerY= y1 + ((y2 - y1) / 2);
	return [centerX,centerY];
}