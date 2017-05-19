const config = require('./config/config');
const svg2png = require("svg2png");
const debug = require('debug')('badger');
const request = require('request');

// Express modules and tools
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// load controllers
let controllers = {};
//Badge services
executability = require('./controllers/executability/executability');
license = require('./controllers/license/license');
review = require('./controllers/review-status/review-status');
release = require('./controllers/release-date/release-date');
location = require('./controllers/location/location');
peerReview = require('./controllers/review-status/review-status');
//Misc services
scaling = require('./controllers/scaling/scaling');

let server = config.net.endpoint;
debug('Server: ', server);

/*
* configure routes
*/

//Scalability:
app.get('/api/1.0/badge', scaling.getBase);
app.get('/api/1.0/badge/:type', scaling.getType);
app.get('/api/1.0/badge/:type/:service', scaling.getService);

//Executability
app.get('/api/1.0/badge/executable/:o2r/:id/:extended?', executability.getBadgeFromReference);
app.post('/api/1.0/badge/executable/:o2r/:extended?', executability.getBadgeFromData);

//Licensing
app.get('/api/1.0/badge/licence/o2r/:id/:extended?', license.getBadgeFromReference);
app.post('/api/1.0/badge/licence/o2r/:extended?', license.getBadgeFromData);

//Locating
app.get('/api/1.0/badge/spatial/o2r/:id/:extended?', location.getBadgeFromReference);
app.post('/api/1.0/badge/spatial/o2r/:extended?', location.getBadgeFromData);

//Release date
app.get('/api/1.0/badge/releasetime/crossref/:id/:extended?', release.getBadgeFromReference);
app.post('/api/1.0/badge/releasetime/crossref/:extended?', release.getBadgeFromData);

//Peer review:
app.get('/api/1.0/badge/peerreview/doaj/:id/:extended?', peerReview.getBadgeFromReference);
app.post('/api/1.0/badge/peerreview/doaj/:extended?', peerReview.getBadgeFromData);

app.listen(config.net.port, () => {
	debug('badger with API version %s waiting for requests on port %s',
	config.api_version,
	config.net.port);
});

module.exports = app;