/**
 * Include services used for the application
 */
var server = process.env.TESTSERVER || "http://192.168.99.100:8080";
var express = require('express');
var request = require('request');
var fs = require('fs');

exports.getLicenseBadge = (req, res) => {

    var id = req.params.id;
    var extended = req.params.extended;

    //map the dois for testing to compendium ids
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
            case '10.1016%2Fs0038-092x(00)00089-x':
                id = 5;
                break;
            case '10.1016%2F0095-0696(78)90006-2':
                id = 6;
                break;
        }
    }

    var options = {
        root: __dirname + '/badges/',
        dotfiles: 'deny',
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true
        }
    };

    //real request would go to
    /*request('http://o2r.uni-muenster.de/api/v1/compendium' + id, function(error, reponse, body) {
    })*/

    // send a request to the fake server to retrieve information about licencing 
    request(server + '/licence/' + id, function(error, response, body) {
        if(error || response.statusCode != 404){
            var compendiumJSON = JSON.parse(body);
            var badge;
            var osicode;
            var oddata;
            var odtext;
            var datalicence;
            var textlicence;
            var codelicence;

            // those values are in the json then
            //json validation
            if(compendiumJSON.hasOwnProperty('metadata') && compendiumJSON.metadata.hasOwnProperty('licence')) {
                if(compendiumJSON.metadata.licence.hasOwnProperty('data')) {
                    datalicence = compendiumJSON.metadata.licence.data;
                }
                else datalicence = 'unknown';
                if(compendiumJSON.metadata.licence.hasOwnProperty('text')) {
                    textlicence = compendiumJSON.metadata.licence.text;
                }
                else textlicence = 'unknown';
                if(compendiumJSON.metadata.licence.hasOwnProperty('code')) {
                    codelicence = compendiumJSON.metadata.licence.code;
                }
                else codelicence = 'unknown';

                // read json file osi.json and od.json to compare wheather the licence of the compendia is in the list of licences
                var osi = JSON.parse(fs.readFileSync('osi.json'));
                var od = JSON.parse(fs.readFileSync('od.json'));

                //check for all licences if they are included in our list of compatible compendia 
                if(datalicence == 'unknown') {
                    oddata = 'unknown';
                }
                else {
                    if(od.hasOwnProperty(datalicence)) {
                        oddata = true;
                    }
                    else oddata = false;
                }

                if(textlicence == 'unknown') {
                    odtext = 'unknown';
                }
                else {
                    if(od.hasOwnProperty(textlicence)) {
                        odtext = true;
                    }
                    else odtext = false;
                }
                
                if(codelicence == 'unknown') {
                    osicode = 'unknown';
                }
                else {
                    if(osi.hasOwnProperty(codelicence)) {
                        osicode = true;
                    }
                    else osicode = false;
                }
            }
            else {
                badge = 'license_noInformation.svg'
                res.sendFile(badge, options, function(err) {
                    if(err) {
                        console.log(err);
                        res.status(err.status).end();
                    }
                    else console.log('Sent file: ', badge);
                });
            }

            // compare the boolean values of the code / data / text licences to determine the badge to send it to the client
            if(extended == 'extended') {
                if(osicode==true && oddata==true && odtext==true){
                    badge = 'license_open.svg';
                    res.sendFile(badge, options, function(err) {
                        if(err) {
                            console.log(err);
                            res.status(err.status).end();
                        }
                        else console.log('Sent file: ', badge);
                    });            
                }
                    
                else if(osicode==false && oddata==true && odtext==true){
                    badge = 'license_data_noCode_text.svg';
                    res.sendFile(badge, options, function(err) {
                        if(err) {
                            console.log(err);
                            res.status(err.status).end();
                        }
                        else console.log('Sent file: ', badge);
                    });            
                }
                
                else if(osicode==true && oddata==false && odtext==true){
                    badge = 'license_noData_code_text.svg';
                    res.sendFile(badge, options, function(err) {
                        if(err) {
                            console.log(err);
                            res.status(err.status).end();
                        }
                        else console.log('Sent file: ', badge);
                    });            
                }
                    
                else if(osicode==true && oddata==true && odtext==false){
                    badge = 'license_data_code_noText.svg';
                    res.sendFile(badge, options, function(err) {
                        if(err) {
                            console.log(err);
                            res.status(err.status).end();
                        }
                        else console.log('Sent file: ', badge);
                    });            
                }
                    
                else if(osicode==false && oddata==false && odtext==true){
                    badge = 'license_noData_noCode_text.svg';
                    res.sendFile(badge, options, function(err) {
                        if(err) {
                            console.log(err);
                            res.status(err.status).end();
                        }
                        else console.log('Sent file: ', badge);
                    });            
                }
                
                else if(osicode==false && oddata==true && odtext==false){
                    badge = 'license_data_noCode_noText.svg';
                    res.sendFile(badge, options, function(err) {
                        if(err) {
                            console.log(err);
                            res.status(err.status).end();
                        }
                        else console.log('Sent file: ', badge);
                    });            
                }
                    
                else if(osicode==true && oddata==false && odtext==false){
                    badge = 'license_noData_code_noText.svg';
                    res.sendFile(badge, options, function(err) {
                        if(err) {
                            console.log(err);
                            res.status(err.status).end();
                        }
                        else console.log('Sent file: ', badge);
                    });            
                }
                    
                else if(osicode==false && oddata==false && odtext==false){
                    badge = 'license_closed.svg';
                    res.sendFile(badge, options, function(err) {
                        if(err) {
                            console.log(err);
                            res.status(err.status).end();
                        }
                        else console.log('Sent file: ', badge);
                    });            
                }
                //cases for unknown licences for one tag
                else if(osicode == 'unknown') {
                    if(oddata == true && odtext == true) {
                        badge = 'License_data_text.svg';
                        res.sendFile(badge, options, function(err) {
                            if(err) {
                                console.log(err);
                                res.status(err.status).end();
                            }
                            else console.log('Sent file: ', badge);
                        });                
                    }
                    else if(oddata == true && odtext == false) {
                        badge = 'license_data_noText.svg';
                        res.sendFile(badge, options, function(err) {
                            if(err) {
                                console.log(err);
                                res.status(err.status).end();
                            }
                            else console.log('Sent file: ', badge);
                        });                
                    }
                    else if(oddata == false && odtext == true) {
                        badge = 'license_noData_text.svg';
                        res.sendFile(badge, options, function(err) {
                            if(err) {
                                console.log(err);
                                res.status(err.status).end();
                            }
                            else console.log('Sent file: ', badge);
                        });                
                    }
                    else if(oddata == false && odtext == false) {
                        badge = 'license_noData_noText.svg';
                        res.sendFile(badge, options, function(err) {
                            if(err) {
                                console.log(err);
                                res.status(err.status).end();
                            }
                            else console.log('Sent file: ', badge);
                        });                
                    }
                    else if(oddata == 'unknown' && odtext == false) {
                        badge = 'license_noText.svg';
                        res.sendFile(badge, options, function(err) {
                            if(err) {
                                console.log(err);
                                res.status(err.status).end();
                            }
                            else console.log('Sent file: ', badge);
                        });                
                    }
                    else if(oddata == 'unknown' && odtext == true) {
                        badge = 'license_text.svg';
                        res.sendFile(badge, options, function(err) {
                            if(err) {
                                console.log(err);
                                res.status(err.status).end();
                            }
                            else console.log('Sent file: ', badge);
                        });                
                    }
                    else if(oddata == false && odtext == 'unknown') {
                        badge = 'license_noData.svg';
                        res.sendFile(badge, options, function(err) {
                            if(err) {
                                console.log(err);
                                res.status(err.status).end();
                            }
                            else console.log('Sent file: ', badge);
                        });                
                    }
                    else if(oddata == true && odtext == 'unknown') {
                        badge = 'license_data.svg';
                        res.sendFile(badge, options, function(err) {
                            if(err) {
                                console.log(err);
                                res.status(err.status).end();
                            }
                            else console.log('Sent file: ', badge);
                        });                
                    }
                }
                else if(oddata == 'unknown') {
                    if(osicode == true && odtext == true) {
                        badge = 'license_code_text.svg';
                        res.sendFile(badge, options, function(err) {
                            if(err) {
                                console.log(err);
                                res.status(err.status).end();
                            }
                            else console.log('Sent file: ', badge);
                        });                
                    }
                    else if(osicode == true && odtext == false) {
                        badge = 'license_code_noText.svg';
                        res.sendFile(badge, options, function(err) {
                            if(err) {
                                console.log(err);
                                res.status(err.status).end();
                            }
                            else console.log('Sent file: ', badge);
                        });                
                    }
                    else if(osicode == false && odtext == true) {
                        badge = 'license_noCode_text.svg';
                        res.sendFile(badge, options, function(err) {
                            if(err) {
                                console.log(err);
                                res.status(err.status).end();
                            }
                            else console.log('Sent file: ', badge);
                        });                
                    }
                    else if(osicode == false && odtext == false) {
                        badge = 'license_noCode_noText.svg';
                        res.sendFile(badge, options, function(err) {
                            if(err) {
                                console.log(err);
                                res.status(err.status).end();
                            }
                            else console.log('Sent file: ', badge);
                        });                
                    }
                    else if(osicode == false && odtext == 'unknown') {
                        badge = 'license_noCode.svg';
                        res.sendFile(badge, options, function(err) {
                            if(err) {
                                console.log(err);
                                res.status(err.status).end();
                            }
                            else console.log('Sent file: ', badge);
                        });                
                    }
                    else if(osicode == true && odtext == 'unknown') {
                        badge = 'license_code.svg';
                        res.sendFile(badge, options, function(err) {
                            if(err) {
                                console.log(err);
                                res.status(err.status).end();
                            }
                            else console.log('Sent file: ', badge);
                        });                
                    }
                }
                else if(odtext == 'unknown') {
                    if(osicode == true && oddata == true) {
                        badge = 'license_data_code.svg';
                        res.sendFile(badge, options, function(err) {
                            if(err) {
                                console.log(err);
                                res.status(err.status).end();
                            }
                            else console.log('Sent file: ', badge);
                        });                
                    }
                    else if(osicode == true && oddata == false) {
                        badge = 'license_noData_code.svg';
                        res.sendFile(badge, options, function(err) {
                            if(err) {
                                console.log(err);
                                res.status(err.status).end();
                            }
                            else console.log('Sent file: ', badge);
                        });                
                    }
                    else if(osicode == false && oddata == true) {
                        badge = 'license_data_noCode.svg';
                        res.sendFile(badge, options, function(err) {
                            if(err) {
                                console.log(err);
                                res.status(err.status).end();
                            }
                            else console.log('Sent file: ', badge);
                        });                
                    }
                    else if(osicode == false && oddata == false) {
                        badge = 'license_noData_noCode.svg';
                        res.sendFile(badge, options, function(err) {
                            if(err) {
                                console.log(err);
                                res.status(err.status).end();
                            }
                            else console.log('Sent file: ', badge);
                        });                
                    }
                }
            }
            else {
                if(osicode==true && oddata==true && odtext==true){
                    res.redirect('https://img.shields.io/badge/licence-open-44cc11.svg');           
                }    
                else if(osicode==false && oddata==true && odtext==true || osicode==true && oddata==false && odtext==true || osicode==true && oddata==true && odtext==false){
                    res.redirect('https://img.shields.io/badge/licence-mostly%20open-yellow.svg');       
                }
                else if(osicode==false && oddata==false && odtext==true || osicode==false && oddata==true && odtext==false || osicode==true && oddata==false && odtext==false){
                    res.redirect('https://img.shields.io/badge/licence-partially%20open-fe7d00.svg');          
                }
                else if(osicode==false && oddata==false && odtext==false){
                    res.redirect('https://img.shields.io/badge/licence-closed-ff0000.svg');            
                }
                //cases for unknown licences for one tag
                else if(osicode == 'unknown') {
                    if(oddata == true && odtext == true) {
                        res.redirect('https://img.shields.io/badge/licence-mostly%20open-yellow.svg');               
                    }
                    else if(oddata == true && odtext == false) {
                        res.redirect('https://img.shields.io/badge/licence-partially%20open-fe7d00.svg');                
                    }
                    else if(oddata == false && odtext == true) {
                        res.redirect('https://img.shields.io/badge/licence-partially%20open-fe7d00.svg');                
                    }
                    else if(oddata == false && odtext == false) {
                        res.redirect('https://img.shields.io/badge/licence-closed-ff0000.svg');               
                    }
                    else if(oddata == 'unknown' && odtext == false) {
                        res.redirect('https://img.shields.io/badge/licence-closed-ff0000.svg');                
                    }
                    else if(oddata == 'unknown' && odtext == true) {
                        res.redirect('https://img.shields.io/badge/licence-partially%20open-fe7d00.svg');               
                    }
                    else if(oddata == false && odtext == 'unknown') {
                        res.redirect('https://img.shields.io/badge/licence-closed-ff0000.svg');                
                    }
                    else if(oddata == true && odtext == 'unknown') {
                        res.redirect('https://img.shields.io/badge/licence-partially%20open-fe7d00.svg');                
                    }
                }
                else if(oddata == 'unknown') {
                    if(osicode == true && odtext == true) {
                        res.redirect('https://img.shields.io/badge/licence-mostly%20open-yellow.svg');               
                    }
                    else if(osicode == true && odtext == false) {
                        res.redirect('https://img.shields.io/badge/licence-partially%20open-fe7d00.svg');                
                    }
                    else if(osicode == false && odtext == true) {
                        res.redirect('https://img.shields.io/badge/licence-partially%20open-fe7d00.svg');                
                    }
                    else if(osicode == false && odtext == false) {
                        res.redirect('https://img.shields.io/badge/licence-closed-ff0000.svg');                
                    }
                    else if(osicode == false && odtext == 'unknown') {
                        res.redirect('https://img.shields.io/badge/licence-closed-ff0000.svg');                
                    }
                    else if(osicode == true && odtext == 'unknown') {
                        res.redirect('https://img.shields.io/badge/licence-partially%20open-fe7d00.svg');                
                    }
                }
                else if(odtext == 'unknown') {
                    if(osicode == true && oddata == true) {
                        res.redirect('https://img.shields.io/badge/licence-mostly%20open-yellow.svg');                
                    }
                    else if(osicode == true && oddata == false) {
                        res.redirect('https://img.shields.io/badge/licence-partially%20open-fe7d00.svg');                
                    }
                    else if(osicode == false && oddata == true) {
                        res.redirect('https://img.shields.io/badge/licence-partially%20open-fe7d00.svg');               
                    }
                    else if(osicode == false && oddata == false) {
                        res.redirect('https://img.shields.io/badge/licence-closed-ff0000.svg');                
                    }
                }
            }
        }
        else {
            if(extended == 'extended') {
                badge = 'license_noInformation.svg'
                res.sendFile(badge, options, function(err) {
                    if(err) {
                        console.log(err);
                        res.status(err.status).end();
                    }
                    else console.log('Sent file: ', badge);
                });
            }
            else {
                res.redirect('https://img.shields.io/badge/licence-n%2Fa-9f9f9f.svg');
            }       
        }
        
    })
}