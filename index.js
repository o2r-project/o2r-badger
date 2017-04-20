const svg2png = require("svg2png");
var express = require('express');
var request = require('request');
var app = express();
var DOMParser = require('xmldom').DOMParser;
var XMLSerializer = require('xmldom').XMLSerializer;
var StringDecoder = require('string_decoder').StringDecoder;
var decoder = new StringDecoder('utf8');

// load controllers
var controllers = {};
//Badge services
controllers.executability = require('./controllers/executability/executability');
controllers.license = require('./controllers/license/license');
controllers.review = require('./controllers/review-status/review-status');
controllers.release = require('./controllers/release-date/release-date');
controllers.location = require('./controllers/location/location');
//Misc services
controllers.scaling = require('./controllers/scaling/scaling');
controllers.server = require('./controllers/server/server');

var server = process.env.SERVER_IP || "http://giv-project6.uni-muenster.de:";//-e
console.log(server);
var base = '/api/1.0/badge';

/*
* configure routes
*/

//Scalability:
app.get('/api/1.0/badge', controllers.scaling.getBase);
app.get('/api/1.0/badge/:type', controllers.scaling.getType);
app.get('/api/1.0/badge/:type/:service', controllers.scaling.getService);
app.get('/api/1.0/badge/:type/:service/:id', controllers.scaling.getBadge);

//Executing: 3001
app.get('/api/1.0/badge/:executable/:o2r/:id/:extended?', controllers.executability.getExecutabilityBadge);

//Licensing 3003
app.get('/api/1.0/badge/licence/o2r/:id/:extended?', controllers.license.getLicenseBadge);

//Locating: 3005
app.get('/api/1.0/badge/spatial/o2r/:id', controllers.location.getSmallSpatialBadge);
app.get('/api/1.0/badge/spatial/o2r/:id/extended', controllers.location.getBigSpatialBadge);

//Release date: 3004
app.get('/api/1.0/badge/:releasetime/:crossref/:doi/:extended?', controllers.release.getReleaseDateBadge);

//Peer review:

//Serving:





app.listen(3000, function () {
	console.log('Server listening...')
});

module.exports = app;