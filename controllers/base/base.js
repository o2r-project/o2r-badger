const debug = require('debug')('badger');
const config = require('../../config/config');
const svg2png = require("svg2png");
const request = require('request');
const DOMParser = require('xmldom').DOMParser;
const XMLSerializer = require('xmldom').XMLSerializer;
const path = require('path');
const fs = require('fs');

let server = config.net.testEndpoint + ':';

exports.getBase = (req, res) => {
	res.setHeader('Content-Type', 'application/json');
	res.send(JSON.stringify({
		"type": [
			"executable",
			"peerreview",
			"licence",
			"spatial",
			"releasetime"
		]
	}));
};

exports.getType = (req, res) => {
	let type = req.params.type;
	switch (type) {
		case "executable":
            res.status(404).send('{"error":"no id provided"}');
			break;
		case "peerreview":
            res.status(404).send('{"error":"no id provided"}');
			break;
		case "licence":
            res.status(404).send('{"error":"no id provided"}');;
			break;
		case "spatial":
            res.status(404).send('{"error":"no id provided"}');
			break;
		case "releasetime":
            res.status(404).send('{"error":"no id provided"}');
			break;
		default:
			debug("Please insert a valid type parameter");
			res.status(404).send('{"error":"type not found"}');
			break;
	}    
};

exports.getAllServices = (req, res) => {
	res.setHeader('Content-Type', 'application/json');
	res.send(JSON.stringify({
		"services": [
			"o2r",
			"doaj",
			"crossref"
		]
	}));
};

exports.resizeAndSend = (req, res) => {
	if (req.query.format === "png" && req.type !== 'location') {
		fs.readFile(req.filePath, 'utf8', (err, data) => {
			if (err) {
				debug(err);
				res.status(500).send('Error reading svg file');
			} else {
				let result = convert(req.query.format, req.query.width, data);
				if (!result) {
					res.status(500).send('Converting of svg to png not possible!');
				} else {
					let img = new Buffer(result, "base64");
					res.writeHead(200, {
						'Access-Control-Allow-Origin': '*',
						'Content-Type': 'image/png',
						'Content-Length': img.length
					});
					res.end(img);
				}
			}
		});
	} else {
		if (typeof req.options !== 'undefined') {
			res.sendFile(req.filePath);
		} else {
			res.sendFile(req.filePath, req.options, function(err) {
				if(err) {
					debug(err);
					res.status(err.status).end();
				}
				else debug('Sent file');
			});  
		}

	}
};

// Convert SVG to scaled PNG
function convert(format, width, file) {

	let doc = new DOMParser().parseFromString(file, 'text/xml');
	let viewBox = doc.documentElement.getAttribute('viewBox');
	let svgwidth = doc.documentElement.getAttribute('width');
	let svgheight = doc.documentElement.getAttribute('height');

	if (!svgwidth || !svgheight) {
		if (!viewBox) {
			debug("SVG has no attributes width, height and viewBox");
			return;
		}
		let values = viewBox.split(" ");
		svgwidth = values[2];
		svgheight = values[3];
		debug("width: " + svgwidth + " height:" + svgheight);
		doc.documentElement.setAttribute('width', svgwidth);
		doc.documentElement.setAttribute('heigth', svgheight);
		let serializer = new XMLSerializer();
		file = serializer.serializeToString(doc);
	}
	// convert image from svg to png
	if (width !== null) {
		//check if svg has a viewBox

		if (!viewBox || viewBox.length === 0) {
			//if not add one
			debug("add viewBox");
			let svgwidth = doc.documentElement.getAttribute('width');
			let svgheight = doc.documentElement.getAttribute('height');
			if (svgwidth > 0 && svgheight > 0) {
				doc.documentElement.setAttribute('viewBox', '0 0 ' + svgwidth + ' ' + svgheight);
			}
			let serializer = new XMLSerializer();
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

function hasSupportedService(service) {
	//ToDo: Implement multiple services and a fallback when there is no result
	let service = service.mainService;
	let allServices = service.services;
	//ToDo: Return a different promise based on the service
	if (allServices.indexOf(service) === -1) {
		return false;
	} else {
		return true;
	}
}

