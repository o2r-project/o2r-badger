const debug = require('debug')('badger');
const config = require('../../config/config');
const request = require('request');
const scaling = require('../scaling/scaling');
const path = require('path');

exports.getPeerReviewBadge = (req, res) => {
    //read the params from the URL
    let id = req.params.id;
    let extended = req.params.extended;

    if(extended === "extended"){
        //handle extended badge
    } else {
        //handle small badge
    }

    //request DOAJ API to get ISSN 
    //e.g. https://doaj.org/api/v1/search/articles/doi%3A10.3389%2Ffpsyg.2013.00479
    request('https://doaj.org/api/v1/search/articles/' + encodeURIComponent(id), function(error, response, body) {

        if (error) {
            debug(error);
            res.status(500).send('Error accessing DOAJ articles API');
        }

        let data = JSON.parse(body);

        if (data.results.length === 0) {
            res.redirect('https://img.shields.io/badge/Peer%20Review-n%2Fa-lightgrey.svg');
        }

        let issn = data.results[0].bibjson.journal.issns[0];
        if (!issn) {
            res.redirect('https://img.shields.io/badge/Peer%20Review-n%2Fa-lightgrey.svg');
        }

        //request DOIJ API to find out if journal with ISSN is peer reviewed
        //e.g. https://doaj.org/api/v1/search/journals/issn%3A1664-1078
        request('https://doaj.org/api/v1/search/journals/' + encodeURIComponent('issn:' + issn), function(error, response, body) {
            if (error) {
                debug(error);
                res.status(500).send('Error accessing DOAJ journals API');
            }

            let data = JSON.parse(body);
            if (data.results.length === 0) {
                res.redirect('https://img.shields.io/badge/Peer%20Review-n%2Fa-lightgrey.svg');
            }
            let process = data.results[0].bibjson.editorial_review.process;
            if (typeof process === 'undefined') {
                res.redirect('https://img.shields.io/badge/Peer%20Review-n%2Fa-lightgrey.svg');
            } else {
                if (process.startsWith('Blind')) {
                    //green badge (blind)
                    res.redirect(generateBadge(process));
                } else {
                    //green badge (success)
                    res.redirect(generateBadge('Success'));
                }
            }
        });

    });

}

function generateBadge(text) {
    let shieldsIO = 'https://img.shields.io/badge/Peer%20Review-';
    let color = '-green.svg';
    return shieldsIO + encodeURIComponent(text) + color;
}