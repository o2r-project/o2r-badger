const debug = require('debug')('badger');
const config = require('../../config/config');
const svg2png = require("svg2png");
var request = require('request');
var DOMParser = require('xmldom').DOMParser;
var XMLSerializer = require('xmldom').XMLSerializer;
var StringDecoder = require('string_decoder').StringDecoder;
var fs = require('fs');

var decoder = new StringDecoder('utf8');
var server = config.net.endpoint + ':';

const executability = require('../executability/executability');
const license = require('../license/license');
const review = require('../review-status/review-status');
const release = require('../release-date/release-date');
const location = require('../location/location');

exports.getBase = (req, res) => {
	res.setHeader('Content-Type', 'application/json');
	res.send(JSON.stringify({
		"type": [
			"executable",
			"peerreview",
			"licence",
			"spatial",
			"releasetime"
		],
		"services": [
			"o2r",
			"doaj",
			"crossref"
		]
	}));
};

exports.getType = (req, res) => {
	var type = req.params.type;
	switch (type) {
		case "executable":
			res.setHeader('Content-Type', 'application/json');
			res.send(JSON.stringify({
				"service": [
					"o2r"
				]
			}));
			break;
		case "peerreview":
			res.setHeader('Content-Type', 'application/json');
			res.send(JSON.stringify({
				"service": [
					"doaj"
				]
			}));
			break;
		case "licence":
			res.setHeader('Content-Type', 'application/json');
			res.send(JSON.stringify({
				"service": [
					"o2r"
				]
			}));
		case "spatial":
			res.setHeader('Content-Type', 'application/json');
			res.send(JSON.stringify({
				"service": [
					"o2r"
				]
			}));
		case "releasetime":
			res.setHeader('Content-Type', 'application/json');
			res.send(JSON.stringify({
				"service": [
					"crossref"
				]
			}));
			break;
		default:
			debug("Please insert a valid type parameter");
			res.send("Please insert a valid type parameter");
			break;
	}    
};

exports.getService = (req, res) => {
	res.setHeader('Content-Type', 'application/json');
	res.send();    
};


exports.getBadge = (req, res) => {
	// var type = req.params.type;
	// var width = req.query.width;
	// var format = req.query.format;
	// var port;
	// var result;

	let passon = {
		type: req.params.type,
		id: req.params.id,
		width: req.query.width,
		format: req.query.format,
		req: req,
		res: res
	};

	var port;
	var getBaseBadge;

	debug("path= " + req.path);

	switch (passon.type) {
		case "executable":
			getBaseBadge = executability.getExecutabilityBadge(passon);
			break;
		// case "peerreview": //todo implement
		// 	getBadge = peerReview.getPeerReviewBadge(passon);
		// 	break;
		case "licence":
			getBaseBadge = license.getLicenseBadge(passon);
			break;
		case "releasetime":
			getBaseBadge = release.getReleaseDateBadge(passon);
			break;
		case "spatial":
			getBaseBadge = location.getSmallSpatialBadge(passon);
			break;
		default:
			debug("No such type, please check the URL");
			getBaseBadge = Promise.resolve(undefined);
			break;
	}

	return getBaseBadge
		.then(function(passon) {
			//check if body is a svg
			if (passon.localBadge) {
				fs.readFile(__dirname + passon.localBadge, function(err, data) {
					if (err) {
						debug(err);
						res.status(500).send('File not found');
					} else {
						
					}

				});

				

				// convert svg to png and send the result
				if (format == "png") {
					result = convert(format, width, body);
					if (!result) {
						res.status(500).send('Converting of svg to png not possible!');
					}
					else {
						var img = new Buffer(result, "base64");
						res.writeHead(200, {
							'Access-Control-Allow-Origin': '*',
							'Content-Type': 'image/png',
							'Content-Length': img.length
						});
						res.end(img);
					}
				}
				//send svg
				else {
					res.writeHead(200, {
						'Access-Control-Allow-Origin': '*',
						'Content-Type': 'image/svg+xml'
					});
					res.end(body);
				}
			}
			//send forward
			else {
				res.send(body);
			}
		})
		.then((passon) => {
			debug('[%s] badge scaling complete', passon.id);
			done(passon.id, null);
		})
		.catch(err => {
			debug('Rejection or unhandled failure during execute: \n\t%s',
				JSON.stringify(err));
			let status = 500;
			if (err.status) {
				status = err.status;
			}
			let msg = 'Internal error';
			if (err.msg) {
				msg = err.msg;
			}
			done(null, err);
			res.status(status).send(JSON.stringify({ error: msg }));
		});
};
		

// function scaleBadge(passon) {

// }

// Convert SVG to scaled PNG
function convert(format, width, file) {

	var doc = new DOMParser().parseFromString(file, 'text/xml');
	var viewBox = doc.documentElement.getAttribute('viewBox');
	var svgwidth = doc.documentElement.getAttribute('width');
	var svgheight = doc.documentElement.getAttribute('height');

	if (!svgwidth || !svgheight) {
		if (!viewBox) {
			debug("SVG has no attributes width, height and viewBox");
			return;
		}
		values = viewBox.split(" ");
		svgwidth = values[2];
		svgheight = values[3];
		debug("width: " + svgwidth + " height:" + svgheight);
		doc.documentElement.setAttribute('width', svgwidth);
		doc.documentElement.setAttribute('heigth', svgheight);
		var serializer = new XMLSerializer();
		file = serializer.serializeToString(doc);
	}
	// convert image from svg to png
	if (width != null) {
		//check if svg has a viewBox

		if (!viewBox || viewBox.length == 0) {
			//if not add one
			debug("add viewBox");
			var svgwidth = doc.documentElement.getAttribute('width');
			var svgheight = doc.documentElement.getAttribute('height');
			if (svgwidth > 0 && svgheight > 0) {
				doc.documentElement.setAttribute('viewBox', '0 0 ' + svgwidth + ' ' + svgheight);
			}
			var serializer = new XMLSerializer();
			file = serializer.serializeToString(doc);
		}

		const output = svg2png.sync(file, { width: width });
		debug("return resized png");
		return output;
	}
	else {
		const output = svg2png.sync(file);
		debug("return png");
		return output;
	}
}