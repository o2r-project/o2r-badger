const fs = require("pn/fs");
const svg2png = require("svg2png");
var express = require('express');
var app = express();

var base = '/api/1.0/badge';

/**
* Receive the request for a Badge
*/
app.get(base + '/doaj/:doi', function(req, res) {
	var doi = req.params.doi;
	var picwidth = req.query.width;
	var type = req.query.type;
	
	//needs to be the absolute path to the location of the badge
	var path = "C:/Users/User/Documents/Uni/Master/2. Semester/Project Badgets/Gitlab/BadgesProject/badge/";
	var badgename = "svg"
	
	if (type == "png")
	{
		// convert image from svg to png
		if(picwidth != null){
			/**
			console.log("parse badge from svg to png with width "+ picwidth);
			fs.readFile(path+badgename+".svg")
			.then(svg2png({ width: picwidth}))
			.then(buffer => fs.writeFile( path+badgename+".png", buffer))
			.catch(e => console.error(e));
			
			//return png
			console.log("return png");
			res.sendFile(path+badgename+".png");
			**/
		}
		else{
			console.log("parse badge from svg to png");
			//source path+doi+".svg"
			fs.readFile(path+badgename+".svg") 
			.then(svg2png)
			.then(buffer => fs.writeFile(path+badgename+".png", buffer))
			.catch(e => console.error(e));
			
			//return png
			console.log("return png");
			res.sendFile(path+badgename+".png");
			
		}
		
	}
	else{
		
		// return svg
		console.log("return svg");
		res.sendFile(path+badgename+".svg");
	}
});


app.listen(3000, function () {
  console.log('Server listening')
})

module.exports = app;