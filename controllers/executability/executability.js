const debug = require('debug')('badger');
const request = require('request');
const path = require('path');

const config = require('../../config/config');
const base = require('../base/base');
const steps = require('../base/commonSteps');

let badgeNASmall = config.executable.badgeNASmall;
let badgeNABig = config.executable.badgeNABig;

exports.getBadgeFromData = (req, res) => {

    let passon = {
        body: req.body,
        extended: req.params.extended,
        req: req,
        res: res
    };

    // check if there is a service for "executable"
    if (base.hasSupportedService(config.executable) === false) {
        debug('No service for badge %s found', passon.id);
        res.status(404).send('{"error":"no service for this type found"}');
        return;
    }

    return sendResponse(passon)
        .then((passon) => {
            debug('Completed generating badge');
        })
        .catch(err => {
            if (err.badgeNA === true) { // Send "N/A" badge
                debug("No badge information found: %s", err.msg);
                if (passon.extended === 'extended') {
                    passon.req.filePath = path.join(__dirname, badgeNABig);
                    base.resizeAndSend(passon.req, passon.res);
                } else if (passon.extended === undefined) {
                    if (passon.service) {
                        res.redirect(badgeNASmall + '?service=' + passon.service)
                    } else {
                        res.redirect(badgeNASmall);
                    }
                } else {
                    res.status(404).send('not allowed');
                }
            } else { // Send error response
                debug('Error generating badge: "%s" Original request: "%s"', err, passon.req.url);
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

    if (typeof req.params.extended !== 'undefined') {
        extended = req.params.extended;
    }

    let passon = {
        id: id,
        extended: extended,
        req: req,
        res: res
    };

    // check if there is a service for "executable"
    if (base.hasSupportedService(config.executable) === false) {
        debug('No service for badge %s found', passon.id);
        res.status(404).send('{"error":"no service for this type found"}');
        return;
    }

    return steps.getCompendiumID(passon)
        .then(steps.getJobID)
        .then(steps.getJob)
        .then(sendResponse)
        .then((passon) => {
            debug('Completed generating badge for %s', passon.id);
        })
        .catch(err => {
            if (err.badgeNA === true) { // Send "N/A" badge
                debug("No badge information found: %s", err.msg);
                if (passon.extended === 'extended') {
                    passon.req.filePath = path.join(__dirname, badgeNABig);
                    base.resizeAndSend(passon.req, passon.res);
                } else if (passon.extended === undefined) {
                    if (passon.service) {
                        res.redirect(badgeNASmall + '?service=' + passon.service)
                    } else {
                        res.redirect(badgeNASmall);
                    }
                } else {
                    res.status(404).send('not allowed');
                }
            } else { // Send error response
                debug('Error generating badge: "%s" Original request: "%s"', err, passon.req.url);
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

function sendResponse(passon) {
    return new Promise((fulfill, reject) => {
        debug('Sending response for status %s', passon.jobStatus);

        try {
            passon.jobStatus = passon.body.status;
        } catch (err) {
            err.badgeNA = true;
            err.msg = 'error reading job status';
            reject(err);
            return;
        }

        let redirectURL;
        // request options
        let options = {
            //root: __dirname + '/badges/',
            dotfiles: 'deny',
            headers: {
                'x-timestamp': Date.now(),
                'x-sent': true,
                'x-badger-service': passon.service
            }
        };
        if (passon.service === undefined) {
            passon.service = 'unknown';
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
            passon.req.service = passon.service;
            passon.req.options = options;
            debug('Sending SVG %s to scaling service', passon.req.filePath);
            base.resizeAndSend(passon.req, passon.res);
            fulfill(passon);

        } else if (passon.extended === undefined) {
            //if the status is 'success' the green badge is sent to the client
            if (passon.jobStatus === 'success') {
                // send the reponse from our server
                redirectURL = 'https://img.shields.io/badge/executable-yes-44cc11.svg';
            }
            // for a 'fail' the red badge is sent
            else if (passon.jobStatus === 'failure') {
                redirectURL = 'https://img.shields.io/badge/executable-no-ff0000.svg';
            }
            // and for the running status the yellow badge is sent to the client
            else if (passon.jobStatus === 'running') {
                redirectURL = 'https://img.shields.io/badge/executable-running-yellow.svg';
            }
            else {
                redirectURL = 'https://img.shields.io/badge/executable-n%2Fa-9f9f9f.svg';
            }
            passon.res.redirect(redirectURL + '?service=' + passon.service);
            fulfill(passon);
        } else {
            let error = new Error();
            error.msg = 'value for parameter extended not allowed';
            error.status = 404;
            reject(error);
            return;
        }
    });
}
