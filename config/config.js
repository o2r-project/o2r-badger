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
c.version = {};
c.fs = {};
c.net = {};
c.ext = {};
var env = process.env;

// Information about badger
c.api_version = 1;

// network
c.net.port = env.BADGER_PORT || 8089;
c.net.endpoint = env.BADGER_ENDPOINT || 'http://localhost';
c.net.proxy = '';

//external resources/APIs
c.ext.license = 'http://localhost:8080';
c.ext.crossref = 'http://api.crossref.org/works/';

// fs paths
c.fs.base = env.BADGER_BASEPATH || '/tmp/o2r/';

// session secret
c.sessionsecret = env.SESSION_SECRET || 'o2r';

module.exports = c;
