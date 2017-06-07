'use strict';
const debug = require('debug')('badger');
const config = require('../config/config');

const fs = require('fs');
const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const request = require('request');

const assert = require('chai').assert;

const jsdom = require("jsdom");
const { JSDOM } = jsdom;

chai.use(chaiHttp);

let baseURL = config.net.testEndpoint + ':' + config.net.port;
let form;
let requestLoadingTimeout = 10000;

describe('Location badge:', function () {


    describe('POST /api/1.0/badge/spatial/extended with json including spatial information', () => {
        before(function (done) {
            fs.readFile('./test/data/spatial/sample1.json', 'utf8', function (err, fileContents) {
                if (err) throw err;
                form = JSON.parse(fileContents);
                done();
            });
        });
        it('should respond with a big badge: index.html including a map', (done) => {
            request({
                uri: baseURL + '/api/1.0/badge/spatial/extended',
                method: 'POST',
                form: form,
                timeout: requestLoadingTimeout
            }, (err, res, body) => {
                if (err) done(err);
                assert.ifError(err);
                assert.equal(res.statusCode, 200);
                let dom = new JSDOM(res.body);
                assert.isString(res.body);
                assert.equal(dom.window.document.querySelector('title').textContent, 'Badge Spatial Information');
                assert.isNotNull(dom.window.document.querySelector('#mapid'));
                done();
            });
        }).timeout(20000);
    });

    describe('POST /api/1.0/badge/spatial/extended with json missing spatial information', () => {
        before(function (done) {
            fs.readFile('./test/data/spatial/sample2.json', 'utf8', function (err, fileContents) {
                if (err) throw err;
                form = JSON.parse(fileContents);
                done();
            });
        });
        it('should respond with a big badge without a location', (done) => {
            request({
                uri: baseURL + '/api/1.0/badge/spatial/extended',
                method: 'POST',
                form: form,
                timeout: requestLoadingTimeout
            }, (err, res, body) => {
                if (err) done(err);
                assert.ifError(err);
                assert.equal(res.statusCode, 200);
                let dom = new JSDOM(res.body);
                assert.isString(res.body);
                assert.equal(dom.window.document.querySelector('title').textContent, 'Badge Spatial Information');
                assert.equal(dom.window.document.querySelector('h4').textContent, 'No location is available for this research.');
                assert.isNull(dom.window.document.querySelector('#mapid'));
                done();
            });
        }).timeout(20000);
    });

    describe('POST /api/1.0/badge/spatial with json including spatial information', () => {
        before(function (done) {
            fs.readFile('./test/data/spatial/sample1.json', 'utf8', function (err, fileContents) {
                if (err) throw err;
                form = JSON.parse(fileContents);
                done();
            });
        });
        it('should respond with a small badge with a research location', (done) => {
            request({
                uri: baseURL + '/api/1.0/badge/spatial',
                method: 'POST',
                form: form,
                timeout: requestLoadingTimeout,
                followRedirect: false
            }, (err, res, body) => {
                if (err) done(err);
                assert.ifError(err);
                assert.equal(res.statusCode, 302);
                assert.equal(res.headers['location'], 'https://img.shields.io/badge/research%20location-Utrecht%2C%20Netherlands-blue.svg');
                done();
            });
        }).timeout(20000);
    });

    describe('POST /api/1.0/badge/spatial with json without spatial information', () => {
        before(function (done) {
            fs.readFile('./test/data/spatial/sample2.json', 'utf8', function (err, fileContents) {
                if (err) throw err;
                form = JSON.parse(fileContents);
                done();
            });
        });
        it('should respond with a small badge indicating no information', (done) => {
            request({
                uri: baseURL + '/api/1.0/badge/spatial',
                method: 'POST',
                form: form,
                timeout: requestLoadingTimeout,
                followRedirect: false
            }, (err, res, body) => {
                if (err) done(err);
                assert.ifError(err);
                assert.equal(res.statusCode, 302);
                assert.equal(res.headers['location'], 'https://img.shields.io/badge/research%20location-n%2Fa-lightgrey.svg');
                done();
            });
        }).timeout(20000);
    });

    describe('GET /api/1.0/badge/spatial/10.99999%2Funknown', () => {
        it('unassigned doi: should respond with a small badge indicating no information', (done) => {
            request({
                uri: baseURL + '/api/1.0/badge/spatial/' + '10.99999%2Funknown',
                method: 'GET',
                timeout: requestLoadingTimeout,
                followRedirect: false
            }, (err, res, body) => {
                if (err) done(err);
                assert.ifError(err);
                assert.equal(res.statusCode, 302);
                assert.equal(res.headers['location'], 'https://img.shields.io/badge/research%20location-n%2Fa-lightgrey.svg');
                done();
            });
        }).timeout(20000);
    });
});

//todo test the GET controllers with a compendium with spatial information (https://o2r.uni-muenster.de/api/v1/compendium/cUgvE) (> success badge)
// --> cUgvE compendium currently does not have a DOI, which means it can't be found