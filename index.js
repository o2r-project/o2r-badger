var express = require('express');
var app = express();

var base = '/api/1.0/badge';

/**
* Receive the request for a badge
*/
app.get(base + '/doaj/:doi', function(req, res) {
	var doi = req.params.doi;
	var width = req.query.width;
	var type = req.query.type;
	console.log(width);
	console.log(type);
	console.log(doi);
	console.log(req.baseUrl);
});


app.listen(3000, function () {
  console.log('Server listening')
})