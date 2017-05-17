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
peerReview = require('./controllers/review-status/review-status');
//Misc services
scaling = require('./controllers/scaling/scaling');
server = require('./controllers/server/server');

var server = config.net.endpoint;
debug('Server: ', server);
var base = '/api/1.0/badge';

/*
* configure routes
*/

//Scalability:
app.get('/api/1.0/badge', scaling.getBase);
app.get('/api/1.0/badge/:type', scaling.getType);
//app.get('/api/1.0/badge/:type/:service', scaling.getService); //todo addt his to other controllers
//app.get('/api/1.0/badge/:type/:service/:id', controllers.scaling.getBadge/*FromReference*/);
// app.post('/api/1.0/badge/:type/:service', controllers.scaling.getBadgeFromData);

//Executing
//app.get('/api/1.0/badge/executable/:o2r/:id/:extended?', executability.getExecutabilityBadge);

app.get('/api/1.0/badge/executable/:o2r/:id', executability.getBadgeFromReference);
app.get('/api/1.0/badge/executable/:o2r', executability.getBadgeFromData);


//Licensing
//app.get('/api/1.0/badge/licence/o2r/:id/:extended?', license.getLicenseBadge);

// app.get('/api/1.0/badge/licence/o2r/:id', license.getBadgeFromReference);
// app.get('/api/1.0/badge/licence/o2r', license.getBadgeFromData);

//Locating
//app.get('/api/1.0/badge/spatial/o2r/:id', location.getSmallSpatialBadge);
//app.get('/api/1.0/badge/spatial/o2r/:id/extended', location.getBigSpatialBadge);

// app.get('/api/1.0/badge/spatial/o2r/:id', location.getBadgeFromReference);
// app.get('/api/1.0/badge/spatial/o2r', location.getBadgeFromData);

//Release date
//app.get('/api/1.0/badge/releasetime/crossref/:doi/:extended?', release.getReleaseDateBadge);

// app.get('/api/1.0/badge/releasetime/crossref/:doi', release.getBadgeFromReference);
// app.get('/api/1.0/badge/releasetime/crossref', release.getBadgeFromData);

//Peer review:
// app.get('/api/1.0/badge/peerreview/doaj/:id/:extended?', peerReview.getPeerReviewBadge);

// app.get('/api/1.0/badge/peerreview/doaj/:id', peerReview.getBadgeFromReference);
// app.get('/api/1.0/badge/peerreview/doaj', peerReview.getBadgeFromData);

app.listen(config.net.port, () => {
	debug('badger with API version %s waiting for requests on port %s',
	config.api_version,
	config.net.port);
});

module.exports = app;