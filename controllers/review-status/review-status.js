const debug = require('debug')('badger');
const config = require('../../config/config');
const request = require('request');
const scaling = require('../scaling/scaling');
const path = require('path');

let badgeNASmall = 'https://img.shields.io/badge/Peer%20Review-n%2Fa-lightgrey.svg';

exports.getBadgeFromData = (req, res) => {

    let passon = {
        body: req.body,
        extended: req.params.extended,
        req: req,
        res: res
    };

    return sendResponse(passon)
        .then((passon) => {
            debug('Completed generating badge');
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

    if (typeof req.params.extended !== 'undefined') {
        extended = req.params.extended;
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
            debug('Completed generating peer-review badge for %s', passon.id);
            //done(passon.id, null);
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

            let data;
            try {
                data = JSON.parse(body);
            } catch (err) {
                err.msg = 'error accessing doaj';
                err.badgeNA = true;
                reject(error);
            }

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

        let requestURL = 'https://doaj.org/api/v1/search/journals/' + encodeURIComponent('issn:' + passon.issn);
        debug('Fetching review status from %s with URL', config.ext.DOAJ, requestURL);

        //request DOIJ API to find out if journal with ISSN is peer reviewed
        //e.g. https://doaj.org/api/v1/search/journals/issn%3A1664-1078
        request(requestURL, function(error, response, body) {
            if (error) {
                debug('DOAJ API not accessible: %s', error);
                reject(error);
            }
            passon.body = JSON.parse(body);
            fulfill(passon);
        });
    });
}

function sendResponse(passon) {
    return new Promise((fulfill, reject) => {
        let data = passon.body;

        if (typeof data.results === 'undefined' || data.results.length === 0) {
            let error = new Error();
            error.msg = 'error accessing doaj';
            error.status = 404;
            error.badgeNA = true;
            reject(error);
        }
        let process;

        try {
            process = data.results[0].bibjson.editorial_review.process;
        } catch (error) {
            error.msg = 'error accessing doaj';
            error.badgeNA = true;
            reject(error);
        }

        if (typeof process === 'undefined') {
            let error = new Error();
            error.msg = 'no review status found';
            error.status = 404;
            error.badgeNA = true;
            reject(error);
        } else {
            if (process.startsWith('Blind')) {
                passon.reviewStatus = 'Blind';
            } else if (process.startsWith('Double blind')) {
                passon.reviewStatus = 'Double blind';
            } else {
                passon.reviewStatus = 'Yes';
            }
            debug('Sending badge for review status %s', passon.reviewStatus);
            passon.res.redirect(generateBadge(passon.reviewStatus));
            fulfill(passon);
        }
    });
}

function generateBadge(text) {
    let shieldsIO = 'https://img.shields.io/badge/Peer%20Review-';
    let color = '-green.svg';
    return shieldsIO + encodeURIComponent(text) + color;
}