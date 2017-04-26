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
var env = process.env;

// Information about badger
c.version.major = 0;
c.version.minor = 1;
c.version.bug = 0;
c.version.api = 1;

// network
c.net.port = env.BADGER_PORT || 8089;
c.net.endpoint = env.BADGER_ENDPOINT || 'localhost';

// fix mongo location if trailing slash was omitted
if (c.mongo.location[c.mongo.location.length - 1] !== '/') {
  c.mongo.location += '/';
}

// fs paths
c.fs.base = env.BADGER_BASEPATH || '/tmp/o2r/';

// session secret
c.sessionsecret = env.SESSION_SECRET || 'o2r';

// user levels
c.user = {};
c.user.level = {};
c.user.level.create_compendium = 100;
c.user.level.create_job = 0;
c.user.level.view_status = 500;

module.exports = c;
