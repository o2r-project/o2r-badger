/**
* Include services used for the application 
*/
var server = process.env.TESTSERVER || "http://192.168.99.100:8080";
var request = require ('request');
var fs = require ('fs')


exports.getSmallSpatialBadge = (req, res) => {
	var id = req.params.id;
	var coordinates;

	// map the doi to the fake id for test server
	if(id.substring(0, 4) == "doi:") {
        id = id.substring(4);

        switch(encodeURIComponent(id)) {
            case '10.1006%2Fjeem.1994.1031':
                id = 1;
                break;
            case '10.1115%2F1.2128636':
                id = 2;
                break;
            case '10.1029%2Fjd095id10p16343':
                id = 3;
                break;
            case '10.1126%2Fscience.1092666':
                id = 4;
                break;
			default: break;
		}
	};
	// call the test server with fake id
	request(server + '/spatial/' + id, function(error, response, body) {
		//response is valid
		if(response.statusCode == 200) {
			coordinates = JSON.parse(body);			
		
			//calculate the center of the polygon
			var result = calculateMeanCenter(coordinates);
			//and get the reversed geocoding for it
			request({url: 'http://api.geonames.org/countrySubdivisionJSON?lat='+result[0]+'&lng='+result[1]+'&username=badges', 
				proxy: "http://wwwproxy.uni-muenster.de:80/"}, function (error,response,body){
					if(response.statusCode == 200) {
						var geoname = JSON.parse(body);
						var geoname_ocean;
						// send the badge with the geocoded information to client
						if (geoname.status) {
							request({url: 'http://api.geonames.org/oceanJSON?lat=' + result[0] + '&lng=' + result[1] + '&username=badges&username=badges', 
								proxy: "http://wwwproxy.uni-muenster.de:80/"}, function (error,response,body){
									if(response.statusCode == 200) {
										geoname_ocean = JSON.parse(body);
										res.redirect("https://img.shields.io/badge/research%20location-" + geoname_ocean.ocean.name + "-blue.svg");
									}
									else res.redirect("https://img.shields.io/badge/research%20location-n%2Fa-lightgrey.svg");
							});
						} else if(geoname.codes) {
							if (geoname.adminName1) {
								res.redirect("https://img.shields.io/badge/research%20location-"+geoname.adminName1+"%2C%20"+geoname.countryName+"-blue.svg");
							} else {
								res.redirect("https://img.shields.io/badge/research%20location-"+geoname.countryName+"-blue.svg");
							}
						}
					}
					else {
						res.redirect("https://img.shields.io/badge/research%20location-n%2Fa-lightgrey.svg");
					}
			})
		}
		else {
			res.redirect("https://img.shields.io/badge/research%20location-n%2Fa-lightgrey.svg");
		}
	});
}

/**
 * @desc retrieve a big badge in form of an html file containing a leaflet map
 */
exports.getBigSpatialBadge = (req, res) => {
	var id = req.params.id;
	var coordinates;
	//map doi to fake id for test server
	if(id.substring(0, 4) == "doi:") {
        id = id.substring(4);

        switch(encodeURIComponent(id)) {
            case '10.1006%2Fjeem.1994.1031':
                id = 1;
                break;
            case '10.1115%2F1.2128636':
                id = 2;
                break;
            case '10.1029%2Fjd095id10p16343':
                id = 3;
                break;
            case '10.1126%2Fscience.1092666':
                id = 4;
                break;
			default: break;
		}
	};

	var options = {
        root: __dirname,
        dotfiles: 'deny',
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true
        }
    };
	// request the metadata from testserver
	request(server + '/spatial/' + id, function(error, response, body) {
		if(response.statusCode == 200) {
			coordinates = JSON.parse(body);
			var html = fs.readFileSync('index_template.html', 'utf-8')
			html.replace('bbox', "Hello");
			//insert the locations into the html file / leaflet
			var file = html.replace('var bbox;', 'var bbox = ' + JSON.stringify(coordinates.metadata.spatial.union.geojson.bbox) + ';');
			fs.writeFileSync('index.html', file);
			res.sendFile('index.html', options, function(err) {
                    if(err) {
                        console.log(err);
                        res.status(err.status).end();
                    }
                    else console.log('Sent file: ', 'index.html');
            });
		}
		else {
			res.sendFile('indexNoMap.html', options, function(err) {
                    if(err) {
                        console.log(err);
                        res.status(err.status).end();
                    }
                    else console.log('Sent file: ', 'indexNoMap.html');
            });
		}
	});    
}

/**
 * @desc calculate the mean center of a polygon
 * @param json geojson file containing the bbox of an area
 */
function calculateMeanCenter(json) {
	var bbox = json.metadata.spatial.union.geojson.bbox

	var x1 = bbox[1];
	var y1 = bbox[0];
	var x2 = bbox[3];
	var y2 = bbox[2];
	var centerX= x1+((x2 - x1) / 2);
	var centerY= y1+((y2 - y1) / 2);
	return [centerX,centerY];
}