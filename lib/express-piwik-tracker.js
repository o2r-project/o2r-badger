// Piwik tracking middleware, from https://piwik.org/blog/2014/06/track-api-calls-node-js-piwik/

const PiwikTracker = require('piwik-tracker');
const config = require('../config/config');
const url = require('url');

function getRemoteAddr(req) {
    if (req.ip) return req.ip;
    if (req._remoteAddress) return req._remoteAddress;
    var sock = req.socket;
    if (sock.socket) return sock.socket.remoteAddress;
    return sock.remoteAddress;
}

exports = module.exports = function analytics(options) {
    var piwik = new PiwikTracker(options.siteId, options.piwikUrl);

    return function track(req, res, next) {
        let parsedURL = url.parse(config.tracking.piwikBaseURL + req.url);
        let extended = false;
        let splitURL = parsedURL.pathname.split('/');
        let action = splitURL[4];
        let doi;
        if (splitURL[splitURL.length - 1] === 'extended') {
            action = 'bigBadge / ' + action;
            doi = splitURL[splitURL.length - 2];
            extended = true;
        } else {
            action = 'smallBadge / ' + action;
            doi = splitURL[splitURL.length - 1];
        }
        piwik.track({
            url: options.baseUrl + req.url,
            action_name: action,
            ua: req.header('User-Agent'),
            lang: req.header('Accept-Language'),
            cvar: JSON.stringify({
                '1': ['API version', config.api_version],
                '2': ['HTTP method', req.method],
                '3': ['extended', extended],
                '4': ['doi', doi]
            }),
            token_auth: options.piwikToken,
            cip: getRemoteAddr(req),
            urlref: req.header('referer')
        });
        next(); 
    }
}
