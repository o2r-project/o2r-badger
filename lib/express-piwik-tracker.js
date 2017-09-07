// Piwik tracking middleware, from https://piwik.org/blog/2014/06/track-api-calls-node-js-piwik/

const PiwikTracker = require('piwik-tracker');
const config = require('../config/config');
const url = require('url');
const debug = require('debug')('badger');

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
        // handle requests after they have finished
        res.on('finish', function(){    
            if (req.header('dnt') === '1') {
                // do not track
                return;
            }
            debug('piwik tracking info for request %s', req.url);

            // get parameters from URL
            try {
                let action,
                    doi,
                    extended = false,
                    parsedURL = url.parse(config.tracking.piwikBaseURL + req.url, true),
                    splitURL = parsedURL.pathname.split('/'),
                    type = splitURL[4],
                    service = null,
                    size = (parsedURL.query === undefined) ? null : parsedURL.query.width,
                    format = (parsedURL.query === undefined) ? null : parsedURL.query.format,
                    referrer = req.header('referer');

                if (req.res._headers['x-badger-service'] !== undefined) {
                    service = req.res._headers['x-badger-service'];
                } else if (this._headers.location !== undefined) {
                    let locationArray = this._headers.location.split('service=');
                    service = locationArray[locationArray.length - 1];
                }             

                if (splitURL[splitURL.length - 1] === 'extended') {
                    action = 'bigBadge / ' + type;
                    doi = decodeURIComponent(splitURL[splitURL.length - 2]);
                    extended = true;
                } else {
                    type = 'smallBadge / ' + type;
                    doi = splitURL[splitURL.length - 1];
                }
            } catch (err) {
                debug('Error parsing tracking data:');
                debug(err);
                return;
            }

            // send information to piwik server
            piwik.track({
                url: options.baseUrl + req.url,
                action_name: action,
                ua: req.header('User-Agent'),
                lang: req.header('Accept-Language'),
                cvar: JSON.stringify({
                    '1': ['API version', config.api_version],
                    '2': ['Badger version', config.version],
                    '3': ['Extender version', req.header('x-extender-version')],
                    '4': ['HTTP method', req.method],
                    '5': ['type', type],
                    '6': ['service', service],
                    '7': ['format', format],
                    '8': ['extended', extended],
                    '9': ['doi', doi],
                    '10': ['size', size]
                }),
                token_auth: options.piwikToken,
                cip: getRemoteAddr(req),
                urlref: referrer
            });  
        });
        next();
    }
}
