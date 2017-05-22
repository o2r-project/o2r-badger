const debug = require('debug')('badger');
const config = require('../../config/config');
const request = require('request');
const scaling = require('../scaling/scaling');
const path = require('path');

let badgeNASmall = 'https://img.shields.io/badge/executable-n%2Fa-9f9f9f.svg';
let badgeNABig = 'badges/Executable_noInfo.svg';


exports.getBadgeFromData = (req, res) => {

    let passon = {
        body: req.body,
        extended: req.query.extended,
        req: req,
        res: res
    };

    return sendResponse(passon)
        .then((passon) => {
            debug('Completed generating badge');
        })
        .catch(err => {
            if (err.badgeNA === true) { // Send "N/A" badge
                debug("No badge information found", err);
                if (passon.extended === 'extended') {
                    passon.req.filePath = path.join(__dirname, badgeNABig);
                    scaling.resizeAndSend(passon.req, passon.res);
                } else if (passon.extended === undefined) {
                    res.redirect(badgeNASmall);
                } else {
                    res.status(404).send('not allowed');
                }
            } else { // Send error response
                debug("Error generating badge:", err);
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
    //read the params from the URL
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

    return getCompendiumID(passon)
        .then(getJobID)
        .then(getJob)
        .then(sendResponse)
        .then((passon) => {
            debug('Completed generating badge for %s', passon.id);
        })
        .catch(err => {
            if (err.badgeNA === true) { // Send "N/A" badge
                debug("No badge information found: %s", err);
                if (passon.extended === 'extended') {
                    passon.req.filePath = path.join(__dirname, badgeNABig);
                    scaling.resizeAndSend(passon.req, passon.res);
                } else if (passon.extended === undefined) {
                    res.redirect(badgeNASmall);
                } else {
                    res.status(404).send('not allowed');
                }
            } else { // Send error response
                debug("Error generating badge: %s", err);
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


function getCompendiumID(passon) {
    return new Promise((fulfill, reject) => {
        let requestURL = config.ext.o2r + '/api/v1/compendium?doi=' + passon.id;
        debug('Fetching compendium ID from %s with URL', config.ext.o2r, requestURL);

        request(requestURL, function(error, response, body) {

            // no job for the given id available
            if(error) {
                debug(error);
                reject(error);
                return;
            }
            // status responses
            if(response.statusCode === 404 || !body.results) {
                let error = new Error();
                error.msg = 'no compendium found';
                error.status = 404;
                error.badgeNA = true;
                reject(error);
            }
            else if(response.statusCode === 500 || response.status === 500) {
                let error = new Error();
                error.msg = 'error filtering for doi';
                error.status = 500;
                reject(error);
            }

            let data = JSON.parse(body);

            // If exactly one compendium was found, contiune. Otherwise, redirect to the 'N/A badge'
            if (data.results && data.results.length === 1) {
                passon.compendiumID = data.results[0];
                fulfill(passon);
            } else {
                debug('Found more than one compendium for DOI %s', passon.id);
                let error = new Error();
                error.msg = 'no compendium found';
                error.status = 404;
                error.badgeNA = true;
                reject(error);
            }

        });

    });
}

function getJobID(passon) {
    return new Promise((fulfill, reject) => {
        let requestURL = config.ext.o2r + '/api/v1/job?compendium_id=' + passon.compendiumID;
        debug('Fetching job ID for compendium %s from %s', passon.compendiumID, requestURL);

        request(requestURL, function(error, response, body) {

            // no job for the given id available
            if(error) {
                debug(error);
                reject(error);
                return;
            }
            // status responses
            if(response.status === 404 || !body.results) {
                let error = new Error();
                error.msg = 'no job found';
                error.status = 404;
                error.badgeNA = true;
                reject(error);
            }
            else if(response.status === 500) {
                let error = new Error();
                error.msg = 'Unable to find data on server';
                error.status = 500;
                reject(error);
            }

            // Continue with jobID
            let data = JSON.parse(body);
            passon.jobID = data.results[0];
            fulfill(passon);
        });
    });
}

function getJob(passon) {
    return new Promise((fulfill, reject) => {
        let requestURL = config.ext.o2r + '/api/v1/job/' + passon.jobID;
        debug('Fetching job status for job %s from %s', passon.jobID, requestURL);

        request(requestURL, function(error, response, body) {

            // no job for the given id available
            if(error) {
                debug(error);
                reject(error);
                return;
            }
            // status responses
            if(response.status === 404 || !body.results) {
                let error = new Error();
                error.msg = 'no job data found';
                error.status = 404;
                error.badgeNA = true;
                reject(error);
            }
            else if(response.status === 500) {
                let error = new Error();
                error.msg = 'Unable to find data on server';
                error.status = 500;
                reject(error);
            }

            // Continue with jobID
            passon.body = JSON.parse(body);
            fulfill(passon);
        });
    });
}

function sendResponse(passon) {
    return new Promise((fulfill, reject) => {
        debug('Sending response for status %s', passon.jobStatus);

        try {
            let data = JSON.parse(passon.body);
            passon.jobStatus = data.status;
        } catch (err) {
            err.badgeNA = true;
            err.msg = 'error reading job status';
            reject(err);
        }

        if(passon.extended === 'extended') {
            //if the status is 'success' the green badge is sent to the client
            if (passon.jobStatus === 'success') {
                passon.req.filePath = path.join(__dirname, 'badges/Executable_Green.svg');
            }
            // for a 'fail' the red badge is sent
            else if (passon.jobStatus === 'failure') {
                passon.req.filePath = path.join(__dirname, 'badges/Executable_Red.svg');
            }
            // and for the running status the yellow badge is sent to the client
            else if (passon.jobStatus === 'running') {
                passon.req.filePath = path.join(__dirname, 'badges/Executable_Running.svg');
            }
            else {
                passon.req.filePath = path.join(__dirname, 'badges/Executable_noInfo.svg');
            }

            // Send the request
            scaling.resizeAndSend(passon.req, passon.res);
            fulfill(passon);

        } else if (passon.extended === undefined) {
            //if the status is 'success' the green badge is sent to the client
            if (passon.jobStatus === 'success') {
                // send the reponse from our server
                passon.res.redirect('https://img.shields.io/badge/executable-yes-44cc11.svg');
                fulfill(passon);
            }
            // for a 'fail' the red badge is sent
            else if (passon.jobStatus === 'failure') {
                passon.res.redirect('https://img.shields.io/badge/executable-no-ff0000.svg');
                fulfill(passon);
            }
            // and for the running status the yellow badge is sent to the client
            else if (passon.jobStatus === 'running') {
                passon.res.redirect('https://img.shields.io/badge/executable-running-yellow.svg');
                fulfill(passon);
            }
            else {
                passon.res.redirect('https://img.shields.io/badge/executable-n%2Fa-9f9f9f.svg');
                fulfill(passon);
            }
        } else {
            let error = new Error();
            error.msg = 'value for parameter extended not allowed';
            error.status = 404;
            reject(error);
        }
    });
}
