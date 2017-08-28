// piwik tracking middleware, from https://piwik.org/blog/2014/06/track-api-calls-node-js-piwik/

var PiwikTracker = require('piwik-tracker');

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
        piwik.track({
            url: options.baseUrl + req.url,
            action_name: 'API call',
            ua: req.header('User-Agent'),
            lang: req.header('Accept-Language'),
            cvar: JSON.stringify({
              '1': ['API version', 'v1'],
              '2': ['HTTP method', req.method]
            }),
            token_auth: options.piwikToken,
            cip: getRemoteAddr(req)

        });
        next();
    }
}
