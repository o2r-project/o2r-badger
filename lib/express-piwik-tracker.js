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
        // get parameters from URL
        let doi,
            extended = false,
            parsedURL = url.parse(config.tracking.piwikBaseURL + req.url, true),
            splitURL = parsedURL.pathname.split('/'),
            type = splitURL[4],
            size = (parsedURL.query === undefined) ? null : parsedURL.query.width,
            format = (parsedURL.query === undefined) ? null : parsedURL.query.format;

        if (splitURL[splitURL.length - 1] === 'extended') {
            type = 'bigBadge / ' + type;
            doi = splitURL[splitURL.length - 2];
            extended = true;
        } else {
            type = 'smallBadge / ' + type;
            doi = splitURL[splitURL.length - 1];
        }

        // send information to piwik server
        piwik.track({
            url: options.baseUrl + req.url,
            action_name: type,
            ua: req.header('User-Agent'),
            lang: req.header('Accept-Language'),
            cvar: JSON.stringify({
                '1': ['API version', config.api_version],
                '2': ['Badger version', config.version],
                '3': ['Extender version', req.header('x-extender-version')],
                '4': ['HTTP method', req.method],
                '5': ['type', type],
                '6': ['format', format],
                '7': ['extended', extended],
                '8': ['doi', doi],
                '9': ['size', size]
            }),
            token_auth: options.piwikToken,
            cip: getRemoteAddr(req),
            urlref: req.header('referer')
        });
        next(); 
    }
}
