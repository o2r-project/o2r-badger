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

const executable_yes_string = '<ellipse style="opacity:1;fill:#008a00;fill-opacity:1;fill-rule:nonzero;stroke:#003100;stroke-width:14.13867092;stroke-linecap:butt;stroke-linejoin:round;';
const executable_no_string = '<ellipse style="opacity:1;fill:#bf0000;fill-opacity:1;fill-rule:nonzero;stroke:#590000;stroke-width:14.73308754;stroke-linecap:butt;stroke-linejoin:round;';
const executable_running_string = '<ellipse style="opacity:1;fill:#ffe300;fill-opacity:1;fill-rule:nonzero;stroke:#f7aa0f;stroke-width:14.82154179;stroke-linecap:butt;stroke-linejoin:round;';
const executable_na_string = '<ellipse style="opacity:1;fill:#aaaaaa;fill-opacity:1;fill-rule:nonzero;';

describe('executability badge:', function () {

    describe('POST /api/1.0/badge/executable with jobStatus "success"', () => {
        before(function (done) {
            fs.readFile('./test/data/executable/testfile1.json', 'utf8', function (err, fileContents) {
                if (err) throw err;
                form = JSON.parse(fileContents);
                done();
            });
        });
        it('should respond with a small badge with a research executability', (done) => {
            request({
                uri: baseURL + '/api/1.0/badge/executable',
                method: 'POST',
                form: form,
                timeout: requestLoadingTimeout,
                followRedirect: false
            }, (err, res, body) => {
                if (err) done(err);
                assert.ifError(err);
                assert.equal(res.statusCode, 302);
                assert.equal(res.headers['location'], 'https://img.shields.io/badge/executable-yes-44cc11.svg');
                done();
            });
        }).timeout(20000);
    });

    describe('POST /api/1.0/badge/executable with json with jobStatus "failure"', () => {
        before(function (done) {
            fs.readFile('./test/data/executable/testfile2.json', 'utf8', function (err, fileContents) {
                if (err) throw err;
                form = JSON.parse(fileContents);
                done();
            });
        });
        it('should respond with a small red badge: "executable no"', (done) => {
            request({
                uri: baseURL + '/api/1.0/badge/executable',
                method: 'POST',
                form: form,
                timeout: requestLoadingTimeout,
                followRedirect: false
            }, (err, res, body) => {
                if (err) done(err);
                assert.ifError(err);
                assert.equal(res.statusCode, 302);
                assert.equal(res.headers['location'], 'https://img.shields.io/badge/executable-no-ff0000.svg');
                done();
            });
        }).timeout(20000);
    });

    describe('POST /api/1.0/badge/executable with json with jobStatus "running"', () => {
        before(function (done) {
            fs.readFile('./test/data/executable/testfile3.json', 'utf8', function (err, fileContents) {
                if (err) throw err;
                form = JSON.parse(fileContents);
                done();
            });
        });
        it('should respond with a small red badge: "executable no"', (done) => {
            request({
                uri: baseURL + '/api/1.0/badge/executable',
                method: 'POST',
                form: form,
                timeout: requestLoadingTimeout,
                followRedirect: false
            }, (err, res, body) => {
                if (err) done(err);
                assert.ifError(err);
                assert.equal(res.statusCode, 302);
                assert.equal(res.headers['location'], 'https://img.shields.io/badge/executable-running-yellow.svg');
                done();
            });
        }).timeout(20000);
    });

    describe('POST /api/1.0/badge/executable with json without executable information', () => {
        before(function (done) {
            fs.readFile('./test/data/executable/testfile4.json', 'utf8', function (err, fileContents) {
                if (err) throw err;
                form = JSON.parse(fileContents);
                done();
            });
        });
        it('should respond with a small badge indicating no information', (done) => {
            request({
                uri: baseURL + '/api/1.0/badge/executable',
                method: 'POST',
                form: form,
                timeout: requestLoadingTimeout,
                followRedirect: false
            }, (err, res, body) => {
                if (err) done(err);
                assert.ifError(err);
                assert.equal(res.statusCode, 302);
                assert.equal(res.headers['location'], 'https://img.shields.io/badge/executable-n%2Fa-9f9f9f.svg');
                done();
            });
        }).timeout(20000);
    });

    describe('GET /api/1.0/badge/executable/10.99999%2Funknown', () => {
        it('unassigned doi: should respond with a small badge indicating no information', (done) => {
            request({
                uri: baseURL + '/api/1.0/badge/executable/' + '10.99999%2Funknown',
                method: 'GET',
                timeout: requestLoadingTimeout,
                followRedirect: false
            }, (err, res, body) => {
                if (err) done(err);
                assert.ifError(err);
                assert.equal(res.statusCode, 302);
                assert.equal(res.headers['location'], 'https://img.shields.io/badge/executable-n%2Fa-9f9f9f.svg');
                done();
            });
        }).timeout(20000);
    });

    describe('POST /api/1.0/badge/executable/extended with jobStatus "success"', () => {
        before(function (done) {
            fs.readFile('./test/data/executable/testfile1.json', 'utf8', function (err, fileContents) {
                if (err) throw err;
                form = JSON.parse(fileContents);
                done();
            });
        });
        it('should respond with a big badge with positive executability', (done) => {
            request({
                uri: baseURL + '/api/1.0/badge/executable/extended',
                method: 'POST',
                form: form,
                timeout: requestLoadingTimeout,
                followRedirect: false
            }, (err, res, body) => {
                if (err) done(err);
                assert.ifError(err);
                assert.equal(res.statusCode, 200);
                //let rawString = res.body.replace(/\s+/g, ''); //remove whitespace
                let rawString = body.replace(/\r?\n|\r|\n/g, ''); //remove newlines
                assert.isTrue(rawString.includes(executable_yes_string));
                done();
            });
        }).timeout(20000);
    });

    describe('POST /api/1.0/badge/executable/extended with json with jobStatus "failure"', () => {
        before(function (done) {
            fs.readFile('./test/data/executable/testfile2.json', 'utf8', function (err, fileContents) {
                if (err) throw err;
                form = JSON.parse(fileContents);
                done();
            });
        });
        it('should respond with a big red badge: "executable no"', (done) => {
            request({
                uri: baseURL + '/api/1.0/badge/executable/extended',
                method: 'POST',
                form: form,
                timeout: requestLoadingTimeout,
                followRedirect: false
            }, (err, res, body) => {
                if (err) done(err);
                assert.ifError(err);
                assert.equal(res.statusCode, 200);
                let rawString = body.replace(/\r?\n|\r|\n/g, ''); //remove newlines
                assert.isTrue(rawString.includes(executable_no_string));
                done();
            });
        }).timeout(20000);
    });

    describe('POST /api/1.0/badge/executable with json with jobStatus "running"', () => {
        before(function (done) {
            fs.readFile('./test/data/executable/testfile3.json', 'utf8', function (err, fileContents) {
                if (err) throw err;
                form = JSON.parse(fileContents);
                done();
            });
        });
        it('should respond with a big yellow badge: "executable running"', (done) => {
            request({
                uri: baseURL + '/api/1.0/badge/executable/extended',
                method: 'POST',
                form: form,
                timeout: requestLoadingTimeout,
                followRedirect: false
            }, (err, res, body) => {
                if (err) done(err);
                assert.ifError(err);
                assert.equal(res.statusCode, 200);
                let rawString = body.replace(/\r?\n|\r|\n/g, ''); //remove newlines
                assert.isTrue(rawString.includes(executable_running_string));
                done();
            });
        }).timeout(20000);
    });

    describe('POST /api/1.0/badge/executable/extended with json without executable information', () => {
        before(function (done) {
            fs.readFile('./test/data/executable/testfile4.json', 'utf8', function (err, fileContents) {
                if (err) throw err;
                form = JSON.parse(fileContents);
                done();
            });
        });
        it('should respond with a big grey badge indicating no information', (done) => {
            request({
                uri: baseURL + '/api/1.0/badge/executable/extended',
                method: 'POST',
                form: form,
                timeout: requestLoadingTimeout,
                followRedirect: false
            }, (err, res, body) => {
                if (err) done(err);
                assert.ifError(err);
                assert.equal(res.statusCode, 200);
                let rawString = body.replace(/\r?\n|\r|\n/g, ''); //remove newlines
                assert.isTrue(rawString.includes(executable_na_string));
                done();
            });
        }).timeout(20000);
    });


    describe('GET /api/1.0/badge/executable/10.99999%2Funknown', () => {
        it('unassigned doi: should respond with a small badge indicating no information', (done) => {
            request({
                uri: baseURL + '/api/1.0/badge/executable/' + '10.99999%2Funknown',
                method: 'GET',
                timeout: requestLoadingTimeout,
                followRedirect: false
            }, (err, res, body) => {
                if (err) done(err);
                assert.ifError(err);
                assert.equal(res.statusCode, 302);
                assert.equal(res.headers['location'], 'https://img.shields.io/badge/executable-n%2Fa-9f9f9f.svg');
                done();
            });
        }).timeout(20000);
    });

});

//todo test the GET controllers with a compendium with executable information (https://o2r.uni-muenster.de/api/v1/compendium/cUgvE) (> success badge)
// --> cUgvE compendium currently does not have a DOI, which means it can't be found