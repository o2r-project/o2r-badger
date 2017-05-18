const debug = require('debug')('badger');
const config = require('../../config/config');
const path = require('path');
const request = require('request');
const scaling = require('../scaling/scaling');

let crossref = config.ext.crossref;
let badgeNASmall = 'https://img.shields.io/badge/release%20time-n%2Fa-lightgrey.svg';
let badgeNABig = 'badges/released_no_information.svg';

exports.getBadgeFromData = (req, res) => {

    let passon = {
        releaseDay: req.query.releaseDay,
        releaseMonth : req.query.releaseMonth,
        releaseYear : req.query.releaseYear,
        extended: req.query.extended,
        req: req,
        res: res
    };

    return sendResponse(passon)
        .then((passon) => {
            debug('Completed generating badge');
        })
        .catch(err => {
            debug("Error generating badge:", err);

            if (err.badgeNA === true) { // Send "N/A" badge
                if (passon.extended === 'extended') {
                    passon.req.filePath = path.join(__dirname, badgeNABig);
                    scaling.resizeAndSend(passon.req, passon.res);
                } else if (passon.extended === undefined) {
                    res.redirect(badgeNASmall);
                } else {
                    res.status(404).send('not allowed');
                }
            } else { // Send error response
                let status = 500;
                if (err.status) {
                    status = err.status;
                }
                let msg = 'Internal error';
                if (err.msg) {
                    msg = err.msg;
                }
                res.status(status).send(JSON.stringify({ error: msg }));
            }
        });
};

exports.getBadgeFromReference = (req, res) => {

    let id = req.params.id;
    let extended;

    debug('Handling %s badge generation for id %s', req.params.type, req.params.id);

    //extract doi from the id parameter (e.g. doi:11.999/asdf.jkl)
    if(id.substring(0, 4) === "doi:") {
        id = id.substring(4);
    } else {
        debug('doi is invalid');
        res.redirect("https://img.shields.io/badge/executable-n%2Fa-9f9f9f.svg");
        return;
    }

    if (typeof req.query.extended !== 'undefined') {
        extended = req.query.extended;
    }

    let passon = {
        id: id,
        extended: extended,
        req: req,
        res: res
    };

    return getReleaseTime(passon)
        .then(sendResponse)
        .then((passon) => {
            debug('Completed generating release-time badge for %s', passon.id);
            //done(passon.id, null);
        })
        .catch(err => {
            debug("Error generating badge:", err);

            if (err.badgeNA === true) { // Send "N/A" badge
                if (passon.extended === 'extended') {
                    passon.req.filePath = path.join(__dirname, badgeNABig);
                    scaling.resizeAndSend(passon.req, passon.res);
                } else if (passon.extended === undefined) {
                    res.redirect(badgeNASmall);
                } else {
                    res.status(404).send('not allowed');
                }
            } else { // Send error response
                let status = 500;
                if (err.status) {
                    status = err.status;
                }
                let msg = 'Internal error';
                if (err.msg) {
                    msg = err.msg;
                }
                res.status(status).send(JSON.stringify({ error: msg }));
            }
        });
};

function getReleaseTime(passon) {
    return new Promise((fulfill, reject) => {
        debug('Fetching release time from %s for DOI %s', config.ext.crossref, passon.id);

        // Request to crossref to get information for the paper with the given doi
        request(
            {
                url: crossref + passon.id,
                proxy: config.net.proxy,
            },
            function (error, response, body) {

                // error handling of request to crossref
                if (error) {
                    debug(error);
                    reject(error);
                }
                if (!response || response.status === 404 || response.statusCode === 404) {
                    let error = new Error();
                    error.msg = 'crossref api call failed';
                    error.status = 500;
                    reject(error);
                } else if (response.status === 500 || response.statusCode === 500) {
                    let error = new Error();
                    error.msg = 'Unable to find data on server';
                    error.status = 500;
                    reject(error);
                }

                // get the created date (if available)
                if(response.body !== undefined) {
                    // parse the response to json
                    let jsonResponse = JSON.parse(response.body);
                    if(jsonResponse.message.issued !== undefined){
                        // get the issued parameter
                        let issued = jsonResponse.message.issued;
                        if(issued["date-parts"] !== undefined || issued["date-parts"] !== ""){
                            // get the date part (containing the release date)
                            let date = issued["date-parts"][0];
                            if (isNaN(date[0]) || isNaN(date[0]) || isNaN(date[0])) {
                                let error = new Error();
                                error.msg = 'date is not a number';
                                error.status = 403;
                                error.badgeNA = true;
                                reject(error);
                            }

                            passon.releaseDay = date[2];
                            passon.releaseMonth = date[1];
                            passon.releaseYear = date[0];
                            debug("Release date is %s", date);
                            fulfill(passon);
                        } else {
                            let error = new Error();
                            error.msg = 'crossref entry does not contain release time';
                            error.badgeNA = true;
                            reject(error);
                        }
                    } else {
                        let error = new Error();
                        error.msg = 'crossref entry does not contain "issued" data';
                        error.badgeNA = true;
                        reject(error);
                    }
                } else {
                    let error = new Error();
                    error.msg = 'could not fetch crossref data';
                    error.badgeNA = true;
                    reject(error);
                }
            });
    });
}

function sendResponse(passon) {
    return new Promise((fulfill, reject) => {
        debug('Sending response for release date %s/%s/%s',
            passon.releaseYear,
            passon.releaseMonth,
            passon.releaseDay);

        if (isNaN(passon.releaseYear) || isNaN(passon.releaseMonth) || isNaN(passon.releaseDay)) {
            let error = new Error();
            error.msg = 'date is not a number';
            error.status = 403;
            error.badgeNA = true;
            reject(error);
        }

        /*************** send big badges *************/
        // todo take leapyears into account
        if (passon.extended === 'extended') {
            let currentDate = new Date().getTime();
            let releaseDate = new Date(passon.releaseYear, passon.releaseMonth, passon.releaseDay, 0, 0, 0, 0).getTime();

            if (releaseDate > currentDate-31536000000) {
                passon.req.filePath = path.join(__dirname, 'badges/released_year.svg');
            }
            else if (releaseDate > currentDate-157680000000) {
                passon.req.filePath = path.join(__dirname, 'badges/released_5_year.svg');
            }
            else if (releaseDate > currentDate-315360000000) {
                passon.req.filePath = path.join(__dirname, 'badges/released_10_years.svg');
            }
            else if (releaseDate > currentDate-630720000000) {
                passon.req.filePath = path.join(__dirname, 'badges/released_20_years.svg');
            }
            else if (releaseDate > currentDate-946080000000) {
                passon.req.filePath = path.join(__dirname, 'badges/released_30_years.svg');
            }
            else if (releaseDate > currentDate-1261440000000) {
                passon.req.filePath = path.join(__dirname, 'badges/released_40_years.svg');
            }
            else if (releaseDate < currentDate-1261440000000) {
                // todo insert new badge
                passon.req.filePath = path.join(__dirname, 'badges/released_over_50_years.svg');
            }
            // Scale the file and send the request
            scaling.resizeAndSend(passon.req, passon.res);
            fulfill(passon);
        }

        /************* send small badges ********************/
        else {
            // send a badge showing the created date
            passon.res.redirect('https://img.shields.io/badge/release%20time-' + passon.releaseYear + '-blue.svg');
            fulfill(passon);
        }
    });
}