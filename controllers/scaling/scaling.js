const debug = require('debug')('badger');
const config = require('../../config/config');
const svg2png = require("svg2png");
const request = require('request');
const DOMParser = require('xmldom').DOMParser;
const XMLSerializer = require('xmldom').XMLSerializer;
const path = require('path');
const fs = require('fs');

let server = config.net.endpoint + ':';

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
			res.send();    
			break;
		case "peerreview":
			res.send();
		case "licence":
			res.send();
			break;
		case "spatial":
			res.send();
			break;
		case "releasetime":
			res.send();    
			break;
		default:
			debug("Please insert a valid type parameter");
			res.send("Please insert a valid type parameter");
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

exports.getBadge = (req, res) => {
	let type = req.params.type;
	let width = req.query.width;
	let format = req.query.format;
	let port;

	debug("path= " + req.path);

	switch (type) {
		case "executable":
			port = 3001;
			break;
		case "peerreview":
			port = 3002;
			break;
		case "licence":
			port = 3003;
			break;
		case "releasetime":
			port = 3004;
			break;
		case "spatial":
			port = 3005;
			break;
		default:
			debug("No such type, please check the URL");
			break;
	}

	debug("type: " + type + " and port: " + port);

	// Redirection to requested badge api
	if (port === 3001 || port === 3002 || port === 3003 || port === 3004 || port === 3005) {
		debug("request: " + server + port + req.path);

		request({
			//url: server + port + req.path, //
			url: server + config.net.port + req.path,
			//proxy: "http://wwwproxy.uni-muenster.de:80/"
			proxy: config.net.proxy
		},
			function (error, response, body) {

				if (!error) {
					//check if body is a svg
					if (body.includes('<svg')) {

						// convert svg to png and send the result
						if (format === "png") {
							result = convert(format, width, body);
							if (!result) {
								res.status(500).send('Converting of svg to png not possible!')
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
					else{
						res.send(body);
					}
				}
				else {
					debug(error);
				}
			});
	}
	else {
		debug("wrong url");
	}    
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