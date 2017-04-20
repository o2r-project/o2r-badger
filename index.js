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
controllers.execute = require('./controllers/execute');
controllers.license = require('./controllers/license');
controllers.review = require('./controllers/review');
controllers.release = require('./controllers/release');
controllers.scale = require('./controllers/scale');
controllers.serve = require('./controllers/serve');
controllers.locate = require('./controllers/locate');

var server = process.env.SERVER_IP || "http://giv-project6.uni-muenster.de:";//-e
console.log(server);
var base = '/api/1.0/badge';

/*
* configure routes
*/

//Scalability:
app.get('/api/1.0/badge', controllers.scale.getBase);
app.get('/api/1.0/badge/:type', controllers.scale.getType);
app.get('/api/1.0/badge/:type/:service', controllers.scale.getService);
app.get('/api/1.0/badge/:type/:service/:id', controllers.scale.getBadge);

//Executing: 3001
app.get('/api/1.0/badge/:executable/:o2r/:id/:extended?', controllers.execute.getExecutabilityBadge);

//Licensing:

//Locating: 3005
app.get('/api/1.0/badge/spatial/o2r/:id', controllers.locate.getSmallSpatialBadge);
app.get('/api/1.0/badge/spatial/o2r/:id/extended', controllers.locate.getBigSpatialBadge);

//Release date:

//Peer review:

//Serving:





app.listen(3000, function () {
	console.log('Server listening...')
});

module.exports = app;