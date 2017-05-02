const config = require('./config/config');
const svg2png = require("svg2png");
const debug = require('debug')('badger');
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
executability = require('./controllers/executability/executability');
license = require('./controllers/license/license');
review = require('./controllers/review-status/review-status');
release = require('./controllers/release-date/release-date');
location = require('./controllers/location/location');
//Misc services
controllers.scaling = require('./controllers/scaling/scaling');
controllers.server = require('./controllers/server/server');

var server = /*process.env.SERVER_IP*/ config.net.endpoint || "http://giv-project6.uni-muenster.de:";//-e // todo remove
debug('Server: ', server);
var base = '/api/1.0/badge';

/*
* configure routes
*/

//Scalability:
app.get('/api/1.0/badge', scaling.getBase);
app.get('/api/1.0/badge/:type', scaling.getType);
app.get('/api/1.0/badge/:type/:service', scaling.getService);
//app.get('/api/1.0/badge/:type/:service/:id', controllers.scaling.getBadge/*FromReference*/);
// app.post('/api/1.0/badge/:type/:service', controllers.scaling.getBadgeFromData);

//Executing
app.get('/api/1.0/badge/:executable/:o2r/:id/:extended?', executability.getExecutabilityBadge);

//Licensing
app.get('/api/1.0/badge/licence/o2r/:id/:extended?', license.getLicenseBadge);

//Locating
app.get('/api/1.0/badge/spatial/o2r/:id', location.getSmallSpatialBadge);
app.get('/api/1.0/badge/spatial/o2r/:id/extended', location.getBigSpatialBadge);

//Release date
app.get('/api/1.0/badge/:releasetime/:crossref/:doi/:extended?', release.getReleaseDateBadge);

//Peer review:
//TODO (PHP)

app.listen(config.net.port, () => {
	debug('badger with API version %s waiting for requests on port %s',
	config.api_version,
	config.net.port);
});

module.exports = app;