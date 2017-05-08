const debug = require('debug')('badger');
const config = require('../../config/config');
const request = require('request');
const scaling = require('../scaling/scaling');
const path = require('path');

exports.getPeerReviewBadge = (req, res) => {
    //read the params from the URL
    let doaj = req.params.doaj;
    let extended = req.params.extended;

    // let doi;
    // doi = doaj.split(":");
    // doi = doi[1];

    if(extended === "extended"){
        //handle extended badge
    } else {
        //handle small badge
    }

    //request DOAJ API to get ISSN
    //e.g. https://doaj.org/api/v1/search/articles/doi%3A10.3389%2Ffpsyg.2013.00479
    request('https://doaj.org/api/v1/search/articles/' + encodeURIComponent(doaj), function(error, response, body) {

        //...
        let issn = body.results[0].bibjson.journal.issns[0];
        if (!issn) {
            res.redirect();
        }

        //request DOIJ API to find out if journal with ISSN is peer reviewed
        //e.g. https://doaj.org/api/v1/search/journals/issn%3A1664-1078
        request('https://doaj.org/api/v1/search/journals/' + encodeURIComponent('issn:' + issn), function(error, response, body) {
            let process = body.results[0].bibjson.editorial_review.process;
            if (typeof process === 'undefined') {
                // badge N/A
            } else {
                if (process.startsWith('Blind')) {
                    //badge blind
                    res.redirect(generateBadge('Blind'));
                } else {
                    //badge green (success)
                    res.redirect();
                }
            }
        });

    });

}

function generateBadge(text) {
    let shieldsIO = 'https:/...';
    let color = '';
    return shieldsIO + text + color;
}