'use strict';
const debug = require('debug')('badger');
const config = require('../config/config');

const fs = require('fs');
const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const request = require('request');
const assert = require('chai').assert;

chai.use(chaiHttp);

let baseURL = config.net.testEndpoint + ':' + config.net.port;
let form;
let requestLoadingTimeout = 10000;

describe('License badge:', function () {

    describe('POST /api/1.0/badge/licence/extended with json including licence information', () => {
        before(function (done) {
            fs.readFile('./test/data/licence/testjson1.json', 'utf8', function (err, fileContents) {
                if (err) throw err;
                form = JSON.parse(fileContents);
                done();
            });
        });
        it('should respond with a big badge: license open', (done) => {
            request({
                uri: baseURL + '/api/1.0/badge/licence/extended',
                method: 'POST',
                form: form,
                timeout: requestLoadingTimeout
            }, (err, res, body) => {
                if (err) done(err);
                assert.ifError(err);
                assert.equal(res.statusCode, 200);
                let rawString = body.replace(/\r?\n|\r|\n/g, ''); //remove newlines
                assert.isTrue(rawString.includes('sodipodi:docname="license_open.svg">'));
                done();
            });
        }).timeout(20000);
    });

    describe('POST /api/1.0/badge/licence/extended with json including licence information', () => {
        before(function (done) {
            fs.readFile('./test/data/licence/testjson13.json', 'utf8', function (err, fileContents) {
                if (err) throw err;
                form = JSON.parse(fileContents);
                done();
            });
        });
        it('should respond with a big badge: license partially open', (done) => {
            request({
                uri: baseURL + '/api/1.0/badge/licence/extended',
                method: 'POST',
                form: form,
                timeout: requestLoadingTimeout
            }, (err, res, body) => {
                if (err) done(err);
                assert.ifError(err);
                assert.equal(res.statusCode, 200);
                let rawString = body.replace(/\r?\n|\r|\n/g, ''); //remove newlines
                assert.isTrue(rawString.includes('sodipodi:docname="license_text.svg">'));
                done();
            });
        }).timeout(20000);
    });

    describe.skip('POST /api/1.0/badge/licence/extended with json including licence information', () => {
        it('should respond with a big badge: license mostly open', (done) => {
        });
    });

    describe.skip('POST /api/1.0/badge/licence/extended with json including licence information', () => {
        it('should respond with a big badge: license closed', (done) => {
        });
    });

    describe.skip('POST /api/1.0/badge/licence/extended with json including licence information', () => {
        it('should respond with a big badge: license unknown', (done) => {
        });
    });

    describe('POST /api/1.0/badge/licence', () => {
        before(function (done) {
            fs.readFile('./test/data/licence/testjson1.json', 'utf8', function (err, fileContents) {
                if (err) throw err;
                form = JSON.parse(fileContents);
                done();
            });
        });
        it('should respond with a small badge: license open', (done) => {
            request({
                uri: baseURL + '/api/1.0/badge/licence',
                method: 'POST',
                form: form,
                timeout: requestLoadingTimeout,
                followRedirect: false
            }, (err, res, body) => {
                if (err) done(err);
                assert.ifError(err);
                assert.equal(res.statusCode, 302);
                assert.equal(res.headers['location'], 'https://img.shields.io/badge/licence-open-44cc11.svg');
                done();
            });
        }).timeout(20000);
    });

    describe.skip('POST /api/1.0/badge/licence with json including licence information', () => {
        it('should respond with a small badge: license mostly open', (done) => {
        });
    });

    describe.skip('POST /api/1.0/badge/licence with json including licence information', () => {
        it('should respond with a small badge: license closed', (done) => {
        });
    });

    describe.skip('POST /api/1.0/badge/licence with json including licence information', () => {
        it('should respond with a small badge: license unknown', (done) => {
        });
    });
});

//todo test the GET controllers with a compendium with licence information (https://o2r.uni-muenster.de/api/v1/compendium/cUgvE) (> success badge)
// --> cUgvE compendium currently does not have a DOI, which means it can't be found