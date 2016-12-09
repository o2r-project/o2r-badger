const fs = require("pn/fs");
const svg2png = require("svg2png");
var express = require('express');
var request = require('request');
var app = express();

var base = '/api/1.0/badge';

// todo: set environment variables for the ip adresses

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
		console.log("request: " + 'localhost:' + port + req.path);
		myurl = 'http://localhost:' + port + req.path;
		request('http://localhost:' + port + req.path, function (error, response, body) {
			if (!error) {
				// send svg
				if (format == "svg") {
					res.send(body);
				}
				// convert svg to png and send the result
				else {
					result = convert(format, width, body);
					res.setHeader('Content-Type', 'image/png');
					res.send(result);
				}
			}
			else {
				// todo: error handling
				console.log("error: " + error);
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
		const output = svg2png.sync(response, { width: width });
		console.log("return resized png");
		return output;
	}
	else {
		const output = svg2png.sync(response);
		console.log("Output: "+output);
		console.log("return resized png");
		return output;
	}
}


app.listen(3000, function () {
	console.log('Server listening...')
});

module.exports = app;