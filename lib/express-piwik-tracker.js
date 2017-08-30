// Piwik tracking middleware, from https://piwik.org/blog/2014/06/track-api-calls-node-js-piwik/

var PiwikTracker = require('piwik-tracker');
const config = require('../config/config');

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
        let extended = false;
        let splitURL = req.url.split('/');
        let action = splitURL[4];
        if (splitURL[splitURL.length - 1] === 'extended') {
            action = 'smallBadge / ' + action;
            extended = true;
        } else {
            action = 'bigBadge / ' + action;
        }
        piwik.track({
            url: options.baseUrl + req.url,
            action_name: action,
            ua: req.header('User-Agent'),
            lang: req.header('Accept-Language'),
            cvar: JSON.stringify({
                '1': ['API version', config.api_version],
                '2': ['HTTP method', req.method],
                '3': ['extended', extended]
            }),
            token_auth: options.piwikToken,
            cip: getRemoteAddr(req),
            urlref: req.header('referer')
        });
        next(); 
    }
}
