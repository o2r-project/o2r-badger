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
                    doi = res.tracking.doi,
                    extended = res.tracking.extended,
                    type = res.tracking.type,
                    service = res.tracking.service,
                    size = res.tracking.size,
                    format = res.tracking.format,
                    researchWebsite = req.header('x-research-website'),
                    na = res.na;
  
                if (extended) {
                    action = 'bigBadge / ' + type;
                } else {
                    action = 'smallBadge / ' + type;
                }

                // send information to piwik server
                piwik.track({
                    url: options.baseUrl + req.url,
                    action_name: action,
                    ua: req.header('User-Agent'),
                    lang: req.header('Accept-Language'),
                    cvar: JSON.stringify({
                        '1': ['NA Badge', na],
                        '2': ['Badger version', config.version],
                        '3': ['Extender version', req.header('x-extender-version')],
                        '4': ['Research website', researchWebsite],
                        '5': ['type', type],
                        '6': ['service', service],
                        '7': ['format', format],
                        '8': ['extended', extended],
                        '9': ['doi', doi],
                        '10': ['size', size]
                    }),
                    token_auth: options.piwikToken,
                    cip: getRemoteAddr(req),
                    urlref: req.header('referer')
                });  
            } catch (err) {
                debug('Error parsing tracking data:');
                debug(err);
                return;
            }
        });
        next();
    }
}
