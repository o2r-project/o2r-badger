const fs = require("pn/fs");
const svg2png = require("svg2png");
var express = require('express');
var request = require('request');
var app = express();

var server = process.env.SERVER_IP || "http://localhost:";//-e
console.log(server);
var base = '/api/1.0/badge';


app.get(base, function (req, res) {
	res.setHeader('Content-Type', 'application/json');
	res.send(JSON.stringify({
		"type": [
			"executable",
			"peerreview",
			"licence"
		],
		"services": [
			"o2r",
			"doaj"
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
		default:
			console.log("No such type, please check the URL");
			break;
	}

	console.log("type: " + type + " and port: " + port);

	// Redirection to requested badge api
	if (port == 3001 || port == 3002 || port == 3003) {
		console.log("request: " + server + port + req.path);
		request(server + port + req.path, function (error, response, body) {
			if (!error) {
				// convert svg to png and send the result
				if (format == "png") {
					result = convert(format, width, body);
					var img = new Buffer(result, "base64");
					res.writeHead(200, {
						'Content-Type': 'image/png',
						'Content-Length': img.length
					});
					res.end(img);
				}
				//send svg
				else {
					res.writeHead(200, {
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
function convert(format, width, response) {
	// convert image from svg to png
	if (width != null) {

		//todo: check svg for toolbox, if false add

		const output = svg2png.sync(response, { width: width });
		console.log("return resized png");
		return output;
	}
	else {
		const output = svg2png.sync(response);
		console.log("return png");
		return output;
	}
}


app.listen(3000, function () {
	console.log('Server listening...')
});

module.exports = app;