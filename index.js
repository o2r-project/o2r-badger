const fs = require("pn/fs");
const svg2png = require("svg2png");
var express = require('express');
var app = express();
var base = '/api/1.0/badge';

//Receive the request for a Badge
app.get(base + '/doaj/:doi', function(req, res) {
	var doi = req.params.doi;
	var picwidth = req.query.width;
	//var picheight= req.query.height // OPTIONAL
	var type = req.query.type;
	var badgename = "whale"
	
	if (type == "png"){
		// convert image from svg to png
		if(picwidth != null){

			console.log("parse badge from svg to png with width "+ picwidth);

			filename=__dirname+'/'+badgename+".svg"
			const input = fs.readFileSync(filename)
			const output = svg2png.sync(input, { width: picwidth, filename: filename}); //OPTIONAL HEIGHT ARGUMENT: (input, { width: picwidth, height: picheight, filename: filename}) 
			const outputFilename = badgename+picwidth+".png";
			fs.writeFileSync(outputFilename, output, { flag: "wx" });
			console.log("return resized png");
			res.sendFile(__dirname+'/'+badgename+picwidth+".png");
		}	
		else{
		// convert svg to png
			console.log("parse badge from svg to png");

			filename=__dirname+'/'+badgename+".svg"
			const input = fs.readFileSync(filename)
			console.log(input);
			const output = svg2png.sync(input);
			const outputFilename = badgename+".png";
			fs.writeFileSync(outputFilename, output, { flag: "wx" });
			console.log("return original size png");
			res.sendFile(__dirname+'/'+badgename+".png");
		}
	}
	else{
		// return svg
		console.log("return svg");
		res.sendFile(__dirname+'/'+badgename+".svg");
	}
});


app.listen(3000, function () {
  console.log('Server listening...')
})