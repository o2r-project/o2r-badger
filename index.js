var svg2png = require("svg2png");
var express = require('express');
var request = require('request');
var sslApp = require('letsencrypt-express');
var app = express();
var DOMParser = require('xmldom').DOMParser;
var XMLSerializer = require('xmldom').XMLSerializer;

var sslServer = process.env.LE_SERVER || "https://acme-v01.api.letsencrypt.org/director";
var proxy = process.env.HTTP_PROXY || "http://wwwproxy.uni-muenster.de:80/";
var host = process.env.HOST || 'giv-project6.uni-muenster.de';
var email = process.env.LE_EMAIL || "letsencrypt-badges@mailinator.com";
var server = "http://" + host + ":";
var base = '/api/1.0/badge';

app.get(base, function (req, res) {
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
});

app.get(base + '/:type', function (req, res) {
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
			console.log("Please insert a valid type parameter");
			res.send("Please insert a valid type parameter");
			break;
	}

});

app.get(base + '/:type/:service', function (req, res) {
	res.setHeader('Content-Type', 'application/json');
	res.send();
});

//Receive the request for a Badge, redirect to requested badge api and send the result
app.get(base + '/:type/:service/:id*', function (req, res) {
	var type = req.params.type;
	var width = req.query.width;
	var format = req.query.format;
	var port;

	console.log("path= " + req.path);

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
			console.log("No such type, please check the URL");
			break;
	}

	console.log("type: " + type + " and port: " + port);

	// Redirection to requested badge api
	if (port >= 3001 && port <= 3005) {
		console.log("request: " + server + port + req.path);

		request({
			url: server + port + req.path,
			proxy: proxy
		},
			function (error, response, body) {

				if (!error) {
					// convert svg to png and send the result
					if (format == "png") {
						result = convert(format, width, body);
						if (!result) {
							res.status(500).send('Converting of svg to png not possible!')
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
				else {
					console.log(error);
					return;
				}
			});
	}
	else {
		console.log("wrong url");
	}
});


// Convert SVG to scaled PNG
function convert(format, width, file) {

	var doc = new DOMParser().parseFromString(file, 'text/xml');
	var viewBox = doc.documentElement.getAttribute('viewBox');
	var svgwidth = doc.documentElement.getAttribute('width');
	var svgheight = doc.documentElement.getAttribute('height');

	if (!svgwidth || !svgheight) {
		if (!viewBox) {
			console.log("SVG has no attributes width, height and viewBox");
			return;
		}
		values = viewBox.split(" ");
		svgwidth = values[2];
		svgheight = values[3];
		console.log("width: " + svgwidth + " height:" + svgheight);
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
			console.log("add viewBox");
			var svgwidth = doc.documentElement.getAttribute('width');
			var svgheight = doc.documentElement.getAttribute('height');
			if (svgwidth > 0 && svgheight > 0) {
				doc.documentElement.setAttribute('viewBox', '0 0 ' + svgwidth + ' ' + svgheight);
			}
			var serializer = new XMLSerializer();
			file = serializer.serializeToString(doc);
		}

		var output = svg2png.sync(file, { width: width });
		console.log("return resized png");
		return output;
	}
	else {
		var output = svg2png.sync(file);
		console.log("return png");
		return output;
	}
}

sslApp.create({
	server: sslServer,
	email: email,
	agreeTos: true,
	approveDomains: [host],
	app: app
}).listen(3000, 4000);

module.exports = sslApp;