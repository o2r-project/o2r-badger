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
base = require('./controllers/base/base');

let server = config.net.testEndpoint;
debug('Server: ', server);

/*
* configure routes
*/

//Scalability:
app.get('/api/1.0/badge', base.getBase);
app.get('/api/1.0/badge/:type', base.getType);
app.get('/api/1.0/badge/:type/?all_services', base.getAllServices);

//Executability
app.get('/api/1.0/badge/executable/:id/:extended?', executability.getBadgeFromReference);
app.post('/api/1.0/badge/executable/:extended?', executability.getBadgeFromData);

//Licensing
app.get('/api/1.0/badge/licence/:id/:extended?', license.getBadgeFromReference);
app.post('/api/1.0/badge/licence/:extended?', license.getBadgeFromData);

//Locating
app.get('/api/1.0/badge/spatial/:id/:extended?', location.getBadgeFromReference);
app.post('/api/1.0/badge/spatial/:extended?', location.getBadgeFromData);

//Release date
app.get('/api/1.0/badge/releasetime/:id/:extended?', release.getBadgeFromReference);
app.post('/api/1.0/badge/releasetime/:extended?', release.getBadgeFromData);

//Peer review:
app.get('/api/1.0/badge/peerreview/:id/:extended?', peerReview.getBadgeFromReference);
app.post('/api/1.0/badge/peerreview/:extended?', peerReview.getBadgeFromData);

app.listen(config.net.port, () => {
	debug('badger %s with API version %s waiting for requests on port %s',
	config.version,
	config.api_version,
	config.net.port);
});

module.exports = app;