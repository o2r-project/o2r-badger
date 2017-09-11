/*
 * (C) Copyright 2017 o2r project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
var c = {};
c.net = {};
c.ext = {};
c.timeout = {};
c.badge = {};
c.executable = {};
c.peerreview = {};
c.licence = {};
c.spatial = {};
c.releasetime = {};
c.tracking = {};
var env = process.env;

// Information about badger
c.api_version = '1.0';
c.version = require('../package.json').version;

// network
c.net.port = env.BADGER_PORT || 8089;
c.net.testEndpoint = env.BADGER_ENDPOINT || 'http://localhost';
c.net.proxy = '';

//piwik tracking options
c.tracking.disableTracking = env.DISABLE_TRACKING || 'false';
c.tracking.piwikToken = env.PIWIK_TOKEN;
c.tracking.piwikURL = 'https://o2r.uni-muenster.de/piwik/piwik.php';
c.tracking.piwikBaseURL = 'https://o2r.uni-muenster.de';
c.tracking.piwikSiteID = 4;

//external resources/APIs
c.ext.crossref = 'https://api.crossref.org/works/';
c.ext.o2r = env.BADGER_O2R_HOST || 'https://o2r.uni-muenster.de';
c.ext.doajArticles = 'https://doaj.org/api/v1/search/articles/';
c.ext.doajJournals = 'https://doaj.org/api/v1/search/journals/';
c.ext.geonames = 'http://api.geonames.org/countrySubdivisionJSON';

//timeouts
c.timeout.crossref = 2500;
c.timeout.o2r  = 2500;
c.timeout.doaj  = 2500;
c.timeout.geonames  = 2500;

//badge settings
c.badge.baseURL = 'https://img.shields.io/badge/';
c.badge.options = '?style=flat-square';

//badges
c.executable.services = ['o2r'];
c.executable.mainService = 'o2r';
c.executable.badgeNASmall = 'https://img.shields.io/badge/executable-n%2Fa-9f9f9f.svg' + c.badge.options;
c.executable.badgeNABig = 'badges/Executable_noInfo.svg';

c.licence.services = ['o2r'];
c.licence.mainService = 'o2r';
c.licence.badgeNASmall = 'https://img.shields.io/badge/licence-n%2Fa-9f9f9f.svg' + c.badge.options;
c.licence.badgeNABig = 'badges/license_noInformation.svg';

c.spatial.services = ['o2r'];
c.spatial.mainService = 'o2r';
c.spatial.badgeNASmall = 'https://img.shields.io/badge/location-n%2Fa-lightgrey.svg' + c.badge.options;
c.spatial.badgeNABig = 'indexNoMap.html';
c.spatial.bboxPath = 'metadata.o2r.spatial.spatial.union.geojson.bbox';

c.releasetime.services = ['crossref'];
c.releasetime.mainService = 'crossref';
c.releasetime.badgeNASmall = 'https://img.shields.io/badge/release%20time-n%2Fa-lightgrey.svg' + c.badge.options;
c.releasetime.badgeNABig = 'badges/released_no_information.svg';

c.peerreview.services = ['doaj'];
c.peerreview.mainService = 'doaj';
c.peerreview.badgeNASmall = 'https://img.shields.io/badge/peer%20review-n%2Fa-lightgrey.svg' + c.badge.options;
c.peerreview.badgeNABig = '';

module.exports = c;
