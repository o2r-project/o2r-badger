const debug = require('debug')('badger');
const config = require('../../config/config');
const request = require('request');
const scaling = require('../scaling/scaling');
const path = require('path');

let badgeNASmall = 'https://img.shields.io/badge/Peer%20Review-n%2Fa-lightgrey.svg';
let badgeNABig = '';

exports.getBadgeFromData = (req, res) => {

    let passon = {
        reviewStatus: req.query.reviewStatus,
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

    debug('Handling badge generation for id %s', req.params.id);

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

    return getISSN(passon)
        .then(getReviewStatus)
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

function getISSN(passon) {
    return new Promise((fulfill, reject) => {
        debug('Fetching ISSN ID from %s for DOI %s', config.ext.DOAJ, passon.id);

        let requestURL = config.ext.DOAJ + encodeURIComponent(passon.id);

        //request DOAJ API to get ISSN
        //e.g. https://doaj.org/api/v1/search/articles/doi%3A10.3389%2Ffpsyg.2013.00479
        request(requestURL, function(error, response, body) {

            if (error) {
                debug('DOAJ API not accessible: %s', error);
                reject(error);
            }

            let data = JSON.parse(body);

            if (typeof data.results === 'undefined') {
                let error = new Error();
                error.msg = 'error accessing doaj';
                error.status = 404;
                error.badgeNA = true;
                reject(error);
            }

            if (data.results.length === 0) {
                let error = new Error();
                error.msg = 'no results found';
                error.status = 404;
                error.badgeNA = true;
                reject(error);
            }

            passon.issn = data.results[0].bibjson.journal.issns[0];
            if (!passon.issn) {
                debug('no issn found for DOI %s', passon.id);
                let error = new Error();
                error.msg = 'no issn found';
                error.status = 404;
                error.badgeNA = true;
                reject(error);
            }
            fulfill(passon);
        });

    });
}

function getReviewStatus(passon) {
    return new Promise((fulfill, reject) => {
        debug('Fetching review status from %s for DOI %s', config.ext.DOAJ, passon.id);

        //request DOIJ API to find out if journal with ISSN is peer reviewed
        //e.g. https://doaj.org/api/v1/search/journals/issn%3A1664-1078
        request('https://doaj.org/api/v1/search/journals/' + encodeURIComponent('issn:' + passon.issn), function(error, response, body) {
            if (error) {
                debug('DOAJ API not accessible: %s', error);
                reject(error);
            }

            let data = JSON.parse(body);
            if (typeof data.results === 'undefined' || data.results.length === 0) {
                let error = new Error();
                error.msg = 'error accessing doaj';
                error.status = 404;
                error.badgeNA = true;
                reject(error);
            }
            let process = data.results[0].bibjson.editorial_review.process;
            if (typeof process === 'undefined') {
                let error = new Error();
                error.msg = 'no review status found';
                error.status = 404;
                error.badgeNA = true;
                reject(error);
            } else {
                if (process.startsWith('Blind')) {
                    passon.reviewStatus = 'Blind';
                } else {
                    passon.reviewStatus = 'Yes';
                }
                fulfill(passon);
            }
        });
    });
}

function sendResponse(passon) {
    return new Promise((fulfill, reject) => {
        debug('Sending badge for review status %s', passon.reviewStatus);

        if (typeof passon.reviewStatus === 'undefined') {
            let error = new Error();
            error.msg = 'no review status provided';
            error.status = 404;
            error.badgeNA = true;
            reject(error);
        }
        passon.res.redirect(generateBadge(passon.reviewStatus));
        fulfill(passon);
    });
}

function generateBadge(text) {
    let shieldsIO = 'https://img.shields.io/badge/Peer%20Review-';
    let color = '-green.svg';
    return shieldsIO + encodeURIComponent(text) + color;
}