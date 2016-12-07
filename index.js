const fs = require("pn/fs");
const svg2png = require("svg2png");
var express = require('express');
var request = require('request');
var app = express();

var base = '/api/1.0/badge';
var badgename = "whale";


//Receive the request for a Badge
app.get(base + '/:type/:service/:id', function (req, res) {
	var type = req.params.type;
	var width = req.query.width;
	var format = req.query.format;
	var port;

	// test URLs
	// localhost:3000/api/1.0/badge/executable/o2r/id?format=png&width=100
	// localhost:3000/api/1.0/badge/licence/o2r/id?format=svg
	// localhost:3000/api/1.0/badge/peerreviewed/o2r/id?format=png

	//without queries
	console.log("path= " + req.path);

	switch (type) {
		case "executable":
			port = 3001;
			break;
		case "peerreviewed":
			port = 3002;
			break;
		case "licence":
			port = 3003;
			break;
		default:
			console.log("No such type, please check the URL");
			break;
	};

	console.log("type: " + type + " and port: " + port);

	if (port == 3001 || port == 3002 || port == 3003) {
		/*
		// missing server in Url
		request(port + base + req.path, function (error, response, body) {
			//todo: error handling
			if (!error) {
				//todo: read body
				convert(format, width);
			}
		});
		*/
		result = convert(format, width);
		res.sendFile(result);

	}
	else {
		console.log("wrong url");
	}
});

function convert(format, width) {

	//todo: don't load badge but load it from url, in case of png save somewhere

	if (format == "png") {
		// convert image from svg to png
		if (width != null) {

			console.log("parse badge from svg to png with width " + width);

			filename = __dirname + '/svg/' + badgename + ".svg"
			const input = fs.readFileSync(filename)
			const output = svg2png.sync(input, { width: width, filename: filename }); //OPTIONAL HEIGHT ARGUMENT: (input, { width: picwidth, height: picheight, filename: filename}) 
			const outputFilename = './png/' + badgename + width + ".png";
			fs.writeFileSync(outputFilename, output, { flag: "w" });
			console.log("return resized png");
			return __dirname + '/png/' + badgename + width + ".png";
		}
		else {
			// convert svg to png
			console.log("parse badge from svg to png");

			filename = __dirname + '/svg/' + badgename + ".svg"
			const input = fs.readFileSync(filename)
			console.log(input);
			const output = svg2png.sync(input);
			const outputFilename = './png/' + badgename + ".png";
			fs.writeFileSync(outputFilename, output, { flag: "w" });
			console.log("return original size png");
			return __dirname + '/png/' + badgename + ".png";
		}
	}
	else {
		// return svg
		console.log("return svg");
		return __dirname + '/svg/' + badgename + ".svg";
	}
}


app.listen(3000, function () {
	console.log('Server listening...')
})

module.exports = app;