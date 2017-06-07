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
c.executable = {};
c.peerreview = {};
c.licence = {};
c.spatial = {};
c.releasetime = {};
var env = process.env;

// Information about badger
c.api_version = 1.1;
c.version = 0.2;

// network
c.net.port = env.BADGER_PORT || 8089;
c.net.testEndpoint = env.BADGER_ENDPOINT || 'http://localhost';
c.net.proxy = '';

//external resources/APIs
c.ext.crossref = 'https://api.crossref.org/works/';
c.ext.o2r = env.BADGER_O2R_HOST || 'https://o2r.uni-muenster.de';
c.ext.doajArticles = 'https://doaj.org/api/v1/search/articles/';
c.ext.doajJournals = 'https://doaj.org/api/v1/search/journals/';
c.ext.geonames = 'http://api.geonames.org/countrySubdivisionJSON';

//services
c.executable.services = ['o2r'];
c.executable.mainService = 'o2r';

c.peerreview.services = ['doaj'];
c.peerreview.mainService = 'doaj';

c.licence.services = ['o2r'];
c.licence.mainService = 'o2r';

c.spatial.services = ['o2r'];
c.spatial.mainService = 'o2r';

c.releasetime.services = ['crossref'];
c.releasetime.mainService = 'crossref';

module.exports = c;
