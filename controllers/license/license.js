/**
 * Include services used for the application
 */
const debug = require('debug')('badger');
const config = require('../../config/config');
const express = require('express');
const request = require('request');
const fs = require('fs');
const scaling = require('../scaling/scaling');
const path = require('path');

let server = config.ext.testserver;
let badgeNASmall = 'https://img.shields.io/badge/licence-n%2Fa-9f9f9f.svg';
let badgeNABig = 'badges/license_noInformation.svg';

exports.getBadgeFromData = (req, res) => {

    let passon = {
        body: req.body,
        extended: req.query.extended,
        req: req,
        res: res
    };

    return getLicenseInformation(passon)
        .then(sendResponse)
        .then((passon) => {
            debug('Completed generating badge');
        })
        .catch(err => {
            if (err.badgeNA === true) { // Send 'N/A' badge
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
        .then(getCompendium)
        .then(getLicenseInformation)
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

function getCompendium(passon) {
    return new Promise((fulfill, reject) => {
        let requestURL = config.ext.o2r + '/api/v1/compendium/' + passon.compendiumID;
        debug('Fetching license status for compendium %s from %s', passon.compendiumID, requestURL);

        request(requestURL, function(error, response, body) {

            // no job for the given id available
            if(error) {
                reject(error);
            }
            // status responses
            if(response.status === 404 || !body.results) {
                let error = new Error();
                error.msg = 'no compendium found';
                error.status = 404;
                error.badgeNA = true;
                reject(error);
            }
            else if(response.status === 500) {
                let error = new Error();
                error.msg = 'Unable to access server';
                error.status = 500;
                reject(error);
            }

            // Continue with metadata
            passon.body = JSON.parse(body);
            fulfill(passon);
        });
    });
}

function getLicenseInformation(passon) {
    return new Promise((fulfill, reject) => {
        let compendiumJSON = passon.body;
        let osicode;
        let oddata;
        let odtext;
        let datalicence;
        let textlicence;
        let codelicence;

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

            // read json file osi.json and od.json to compare whether the licence of the compendia is in the list of licences
            let osi = JSON.parse(fs.readFileSync('./controllers/license/osi.json'));
            let od = JSON.parse(fs.readFileSync('./controllers/license/od.json'));

            //check for all licences if they are included in our list of compatible compendia
            if(datalicence === 'unknown') {
                oddata = 'unknown';
            }
            else {
                oddata = od.hasOwnProperty(datalicence);
            }

            if(textlicence === 'unknown') {
                odtext = 'unknown';
            }
            else {
                odtext = od.hasOwnProperty(textlicence);
            }

            if(codelicence === 'unknown') {
                osicode = 'unknown';
            }
            else {
                osicode = osi.hasOwnProperty(codelicence);
            }
        }
        passon.osiCode = osicode;
        passon.odData = oddata;
        passon.odText = odtext;
        fulfill(passon);
    });
}

function sendResponse(passon) {
    return new Promise((fulfill, reject) => {
        debug('Sending badge for review status %s', passon.reviewStatus);

        if (typeof passon.osiCode === 'undefined' ||
            typeof passon.odData === 'undefined' ||
            typeof passon.odText === 'undefined') {
            let error = new Error();
            error.msg = 'no review status provided';
            error.status = 404;
            error.badgeNA = true;
            reject(error);
        }

        let localPath;
        let osicode = passon.osiCode;
        let oddata = passon.odData;
        let odtext = passon.odText;

        let options = {
            //root: __dirname + '/badges/',
            dotfiles: 'deny',
            headers: {
                'x-timestamp': Date.now(),
                'x-sent': true
            }
        };

        // compare the boolean values of the code / data / text licences to determine the badge to send it to the client
        if(passon.extended === 'extended') {
            if(osicode===true && oddata===true && odtext===true){
                localPath ='badges/license_open.svg';
            }

            else if(osicode===false && oddata===true && odtext===true){
                localPath = 'badges/license_data_noCode_text.svg';
            }

            else if(osicode===true && oddata===false && odtext===true){
                localPath = 'badges/license_noData_code_text.svg';
            }

            else if(osicode===true && oddata===true && odtext===false){
                localPath = 'badges/license_data_code_noText.svg';
            }

            else if(osicode===false && oddata===false && odtext===true){
                localPath = 'badges/license_noData_noCode_text.svg';
            }

            else if(osicode===false && oddata===true && odtext===false){
                localPath = 'badges/license_data_noCode_noText.svg';
            }

            else if(osicode===true && oddata===false && odtext===false){
                localPath = 'badges/license_noData_code_noText.svg';
            }

            else if(osicode===false && oddata===false && odtext===false){
                localPath = 'badges/license_closed.svg';
            }
            //cases for unknown licences for one tag
            else if(osicode === 'unknown') {
                if(oddata === true && odtext === true) {
                    localPath = 'badges/license_data_text.svg';
                }
                else if(oddata === true && odtext === false) {
                    localPath = 'badges/license_data_noText.svg';
                }
                else if(oddata === false && odtext === true) {
                    localPath = 'badges/license_noData_text.svg';
                }
                else if(oddata === false && odtext === false) {
                    localPath = 'badges/license_noData_noText.svg';
                }
                else if(oddata === 'unknown' && odtext === false) {
                    localPath = 'badges/license_noText.svg';
                }
                else if(oddata === 'unknown' && odtext === true) {
                    localPath = 'badges/license_text.svg';
                }
                else if(oddata === false && odtext === 'unknown') {
                    localPath = 'badges/license_noData.svg';
                }
                else if(oddata === true && odtext === 'unknown') {
                    localPath = 'badges/license_data.svg';
                }
            }
            else if(oddata === 'unknown') {
                if(osicode === true && odtext === true) {
                    localPath = 'badges/license_code_text.svg';
                }
                else if(osicode === true && odtext === false) {
                    localPath = 'badges/license_code_noText.svg';
                }
                else if(osicode === false && odtext === true) {
                    localPath = 'badges/license_noCode_text.svg';
                }
                else if(osicode === false && odtext === false) {
                    localPath = 'badges/license_noCode_noText.svg';

                }
                else if(osicode === false && odtext === 'unknown') {
                    localPath = 'badges/license_noCode.svg';
                }
                else if(osicode === true && odtext === 'unknown') {
                    localPath = 'badges/license_code.svg';
                }
            }
            else if(odtext === 'unknown') {
                if(osicode === true && oddata === true) {
                    localPath = 'badges/license_data_code.svg';
                }
                else if(osicode === true && oddata === false) {
                    localPath = 'badges/license_noData_code.svg';
                }
                else if(osicode === false && oddata === true) {
                    localPath = 'badges/license_data_noCode.svg';
                }
                else if(osicode === false && oddata === false) {
                    localPath = 'badges/license_noData_noCode.svg';
                }
            }
            // Send the request (+ scaling)
            passon.req.filePath = path.join(__dirname, localPath);
            passon.req.options = options;
            debug('Sending SVG %s to scaling service', passon.req.filePath);
            scaling.resizeAndSend(passon.req, passon.res);
        }
        else {
            if(osicode===true && oddata===true && odtext===true){
                passon.res.redirect('https://img.shields.io/badge/licence-open-44cc11.svg');
            }
            else if(osicode===false && oddata===true && odtext===true || osicode===true && oddata===false && odtext===true || osicode===true && oddata===true && odtext===false){
                passon.res.redirect('https://img.shields.io/badge/licence-mostly%20open-yellow.svg');
            }
            else if(osicode===false && oddata===false && odtext===true || osicode===false && oddata===true && odtext===false || osicode===true && oddata===false && odtext===false){
                passon.res.redirect('https://img.shields.io/badge/licence-partially%20open-fe7d00.svg');
            }
            else if(osicode===false && oddata===false && odtext===false){
                passon.res.redirect('https://img.shields.io/badge/licence-closed-ff0000.svg');
            }
            //cases for unknown licences for one tag
            else if(osicode === 'unknown') {
                if(oddata === true && odtext === true) {
                    passon.res.redirect('https://img.shields.io/badge/licence-mostly%20open-yellow.svg');
                }
                else if(oddata === true && odtext === false) {
                    passon.res.redirect('https://img.shields.io/badge/licence-partially%20open-fe7d00.svg');
                }
                else if(oddata === false && odtext === true) {
                    passon.res.redirect('https://img.shields.io/badge/licence-partially%20open-fe7d00.svg');
                }
                else if(oddata === false && odtext === false) {
                    passon.res.redirect('https://img.shields.io/badge/licence-closed-ff0000.svg');
                }
                else if(oddata === 'unknown' && odtext === false) {
                    passon.res.redirect('https://img.shields.io/badge/licence-closed-ff0000.svg');
                }
                else if(oddata === 'unknown' && odtext === true) {
                    passon.res.redirect('https://img.shields.io/badge/licence-partially%20open-fe7d00.svg');
                }
                else if(oddata === false && odtext === 'unknown') {
                    passon.res.redirect('https://img.shields.io/badge/licence-closed-ff0000.svg');
                }
                else if(oddata === true && odtext === 'unknown') {
                    passon.res.redirect('https://img.shields.io/badge/licence-partially%20open-fe7d00.svg');
                }
            }
            else if(oddata === 'unknown') {
                if(osicode === true && odtext === true) {
                    passon.res.redirect('https://img.shields.io/badge/licence-mostly%20open-yellow.svg');
                }
                else if(osicode === true && odtext === false) {
                    passon.res.redirect('https://img.shields.io/badge/licence-partially%20open-fe7d00.svg');
                }
                else if(osicode === false && odtext === true) {
                    passon.res.redirect('https://img.shields.io/badge/licence-partially%20open-fe7d00.svg');
                }
                else if(osicode === false && odtext === false) {
                    passon.res.redirect('https://img.shields.io/badge/licence-closed-ff0000.svg');
                }
                else if(osicode === false && odtext === 'unknown') {
                    passon.res.redirect('https://img.shields.io/badge/licence-closed-ff0000.svg');
                }
                else if(osicode === true && odtext === 'unknown') {
                    passon.res.redirect('https://img.shields.io/badge/licence-partially%20open-fe7d00.svg');
                }
            }
            else if(odtext === 'unknown') {
                if(osicode === true && oddata === true) {
                    passon.res.redirect('https://img.shields.io/badge/licence-mostly%20open-yellow.svg');
                }
                else if(osicode === true && oddata === false) {
                    passon.res.redirect('https://img.shields.io/badge/licence-partially%20open-fe7d00.svg');
                }
                else if(osicode === false && oddata === true) {
                    passon.res.redirect('https://img.shields.io/badge/licence-partially%20open-fe7d00.svg');
                }
                else if(osicode === false && oddata === false) {
                    passon.res.redirect('https://img.shields.io/badge/licence-closed-ff0000.svg');
                }
            }
        }
        fulfill(passon);
    });
}