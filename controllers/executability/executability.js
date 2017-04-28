const debug = require('debug')('badger');
const config = require('../../config/config');
var request = require('request');

/**
 * Returns a badge on executability
 * @param {string} passon.id - The DOI
 * @param {string} passon.extended - Extended badge or small badge
 * @param {string} passon.body
 */
function getExecutabilityBadge (passon) {
    return new Promise((fulfill, reject) => {

        var id = passon.id;
        var jobID;
        var extended = passon.extended;

        // If the request was done with an doi: Find the corresponding o2r id
        // Doi has to start with "doi:" and has to be URL encoded
        // todo delete this when the o2r api supports a doi based search for compendia
        if(id.substring(0, 4) == "doi:") {
            id = id.substring(4);
            switch(encodeURIComponent(id)) {
                case '10.1006%2Fjeem.1994.1031':
                    id = 'yxsYu';
                    break;
                case '10.1115%2F1.2128636':
                    id = 'HcEeP';
                    break;
                case '10.1029%2Fjd095id10p16343':
                    id = 'Xa9Ir';
                    break;
                case '10.1126%2Fscience.1092666':
                    id = 'vAsoV';
                    break;
                case '10.1016%2Fs0038-092x(00)00089-x':
                    id = 'yxsYu';
                    break;
                case '10.1016%2F0095-0696(78)90006-2':
                    id = 'GTb0t';
                    break;
                default:
                    debug('doi not found');
                    // no information badge is send in this case (no job for the id can be found)
            }
        }

        /**
         * Get the jobIDs id for a compendium specified in the :id parameter.
         * The id of that job is then saved in jobID variable
         *
         */
        request('http://o2r.uni-muenster.de/api/v1/job?compendium_id=' + id, function(error, response, body) {

            // no job for the given id available
            if(error) {
                debug(error);
                error.status = 404;
                error.msg = 'no job for the given id available';
                reject(error);
            }
            // status responses
            if(response.status == 404) {
                if(compendiumJSON.error) {
                    if(extended == "extended"){
                        passon.badgeLocal = '../../badges/executability/Executable_noInfo.svg';
                        //res.sendFile('./Executable_noInfo.svg' , { root : __dirname} );
                    } else if (extended == undefined){
                        passon.badgeURL = 'https://img.shields.io/badge/executable-n%2Fa-9f9f9f.svg';
                        //res.redirect('https://img.shields.io/badge/executable-n%2Fa-9f9f9f.svg');
                    } else {
                        let error = new Error();
                        error.msg = 'not allowed';
                        error.status = 404;
                        reject(error);
                        //res.status(404).send('not allowed');
                    }
                }
                return;
            }
            else if(response.status == 500 || error) {
                debug(error);
                error.status = 500;
                error.msg = 'Unable to find data on server: ' + error;
                reject(error);
                return;
            }

            //body contains all jobIDs for this compendium
            var compendiumJSON = JSON.parse(passon.body);

            // no job found
            if(compendiumJSON.error) {
                if(extended == "extended"){
                    passon.badgeLocal = '../../badges/executability/Executable_noInfo.svg';
                    //res.sendFile('./Executable_noInfo.svg' , { root : __dirname} );
                } else if (extended == undefined){
                    passon.badgeURL = 'https://img.shields.io/badge/executable-n%2Fa-9f9f9f.svg';
                    //res.redirect('https://img.shields.io/badge/executable-n%2Fa-9f9f9f.svg');
                } else {
                    let error = new Error();
                    error.msg = 'not allowed';
                    error.status = 404;
                    reject(error);
                }
            }

            // information retrieved
            else {
                jobID = compendiumJSON.results[0];
                /**
                 *
                 *  send a request to the o2r api to get the status of the job selected from the compendium
                 *
                 */
                request('http://o2r.uni-muenster.de/api/v1/job/' + jobID, function(error, response, body) {
                    debug(jobID);

                    // no job with the given jobID found
                    if(error) {
                        debug(error);
                        return;
                    }

                    var bodyJSON = JSON.parse(body);

                    // send the correct badge due to
                    // the status of the compendium
                    if(extended == "extended") {
                        //if the status is "success" the green badge is sent to the client
                        if (bodyJSON.status == "success") {
                            passon.badgeLocal = '../../badges/executability/Executable_Green.svg';                    
                            //res.sendFile('./Executable_Green.svg' , { root : __dirname});
                        }
                        // for a "fail" the red badge is sent
                        else if (bodyJSON.status == "failure") {
                            passon.badgeLocal = '../../badges/executability/Executable_Red.svg';
                            //res.sendFile('./Executable_Red.svg' , { root : __dirname});
                        }
                        // and for the running status the yellow badge is sent to the client
                        else if (bodyJSON.status == "running") {
                            passon.badgeLocal = '../../badges/executability/Executable_Running.svg';
                            //res.sendFile('./Executable_Running.svg' , { root : __dirname});
                        }
                        else{
                            passon.badgeLocal = '../../badges/executability/Executable_noInfo.svg';
                            //res.sendFile('./Executable_noInfo.svg' , { root : __dirname});
                        }

                    } else if(extended == undefined){
                        //if the status is "success" the green badge is sent to the client
                        if (bodyJSON.status == "success") {
                            // send the reponse from our server
                            passon.badgeURL = 'https://img.shields.io/badge/executable-yes-44cc11.svg';
                            //res.redirect('https://img.shields.io/badge/executable-yes-44cc11.svg');
                        }
                        // for a "fail" the red badge is sent
                        else if (bodyJSON.status == "failure") {
                            passon.badgeURL = 'https://img.shields.io/badge/executable-no-ff0000.svg';
                            //res.redirect('https://img.shields.io/badge/executable-no-ff0000.svg');
                        }
                        // and for the running status the yellow badge is sent to the client
                        else if (bodyJSON.status == "running") {
                            passon.badgeURL = 'https://img.shields.io/badge/executable-running-yellow.svg';
                            //res.redirect('https://img.shields.io/badge/executable-running-yellow.svg');
                        }
                        else {
                            passon.badgeURL = 'https://img.shields.io/badge/executable-n%2Fa-9f9f9f.svg';
                            //res.redirect('https://img.shields.io/badge/executable-n%2Fa-9f9f9f.svg');
                        }
                    } else {
                        let error = new Error();
                        error.msg = 'not allowed';
                        error.status = 404;
                        reject(error);
                    }
                });
            }
        });

    });
}

module.exports = {
    getExecutabilityBadge: getExecutabilityBadge
};