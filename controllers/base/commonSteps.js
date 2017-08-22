const debug = require('debug')('badger');
const request = require('request');
const fs = require('fs');

const config = require('../../config/config');

function getCompendiumID(passon) {
    return new Promise((fulfill, reject) => {
        let requestURL = config.ext.o2r + '/api/v1/compendium?doi=' + passon.id;
        debug('Fetching compendium ID from %s with URL', config.ext.o2r, requestURL);

        request({
            url: requestURL,
            timeout: config.timeout.o2r,
            proxy: config.net.proxy
        }, function(error, response, body) {

            // no job for the given id available
            if(error) {
                error.msg = 'error accessing o2r';
                error.status = 404;
                reject(error);
                return;
            }
            // status responses
            if(response.statusCode === 404) {
                let error = new Error();
                error.msg = 'no compendium found';
                error.status = 404;
                error.badgeNA = true;
                reject(error);
                return;
            }
            else if(response.statusCode === 500 || response.status === 500) {
                let error = new Error();
                error.msg = 'error filtering for doi';
                error.status = 404;
                reject(error);
                return;
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
                return;
            }

        });

    });
}

function getCompendium(passon) {
    return new Promise((fulfill, reject) => {
        let requestURL = config.ext.o2r + '/api/v1/compendium/' + passon.compendiumID;
        debug('Fetching license status for compendium %s from %s', passon.compendiumID, requestURL);

        request({
            url: requestURL,
            timeout: config.timeout.o2r,
            proxy: config.net.proxy
        },  function(error, response, body) {

            // no job for the given id available
            if(error) {
                error.msg = 'error accessing o2r';
                error.status = 404;
                reject(error);
                return;
            }
            // status responses
            if(response.status === 404) {
                let error = new Error();
                error.msg = 'no compendium found';
                error.status = 404;
                error.badgeNA = true;
                reject(error);
                return;
            }
            else if(response.status === 500) {
                let error = new Error();
                error.msg = 'Unable to access server';
                error.status = 500;
                reject(error);
                return;
            }

            // Continue with metadata
            passon.body = JSON.parse(body);
            fulfill(passon);
        });
    });
}

function getJobID(passon) {
    return new Promise((fulfill, reject) => {
        let requestURL = config.ext.o2r + '/api/v1/job?compendium_id=' + passon.compendiumID;
        debug('Fetching job ID for compendium %s from %s', passon.compendiumID, requestURL);

        request({
            url: requestURL,
            timeout: config.timeout.o2r,
            proxy: config.net.proxy
        }, function(error, response, body) {

            // no job for the given id available
            if(error) {
                error.msg = 'error accessing o2r';
                error.status = 404;
                reject(error);
                return;
            }
            // status responses
            if(response.status === 404) {
                let error = new Error();
                error.msg = 'no job found';
                error.status = 404;
                error.badgeNA = true;
                reject(error);
                return;
            }
            else if(response.status === 500) {
                let error = new Error();
                error.msg = 'Unable to find data on server';
                error.status = 404;
                reject(error);
                return;
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

        request({
            url: requestURL,
            timeout: config.timeout.o2r,
            proxy: config.net.proxy
        }, function(error, response, body) {

            // no job for the given id available
            if(error) {
                error.msg = 'error accessing o2r';
                error.status = 404;
                reject(error);
                return;
            }
            // status responses
            if(response.status === 404) {
                let error = new Error();
                error.msg = 'no job data found';
                error.status = 404;
                error.badgeNA = true;
                reject(error);
                return;
            }
            else if(response.status === 500) {
                let error = new Error();
                error.msg = 'Unable to find data on server';
                error.status = 404;
                reject(error);
                return;
            }

            // Continue with jobID
            passon.body = JSON.parse(body);
            fulfill(passon);
        });
    });
}

module.exports = {
    getCompendiumID: getCompendiumID,
    getCompendium: getCompendium,
    getJobID: getJobID,
    getJob: getJob
};