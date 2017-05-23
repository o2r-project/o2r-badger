'use strict';
const debug = require('debug')('badger');
const config = require('../config/config');

const fs = require('fs');
const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const request = require('request');
const md5 = require('js-md5');

//const request = require('supertest');
const assert = require('chai').assert;

chai.use(chaiHttp);

let baseURL = config.net.endpoint + ':' + config.net.port;
let form;
let requestLoadingTimeout = 10000;

// read the file for the green badge
const md5Green = "8ccab8ed40e5ba373d38a35d719f7ee6";
const md5Red = "371692e0511a776ab35e8e50a5610be0";
const md5NoInfo = "03ab48bb044a4958cccf2108be2eeccc";
const md5Running = "14e140e5aeade88767e750540add7c98";

describe('executability badge (small):', function () {

    describe('POST /api/1.0/badge/executable/o2r with jobStatus "success"', () => {
        before(function (done) {
            fs.readFile('./test/data/executable/testfile1.json', 'utf8', function (err, fileContents) {
                if (err) throw err;
                form = JSON.parse(fileContents);
                done();
            });
        });
        it('should respond with a small badge with a research executability', (done) => {
            request({
                uri: baseURL + '/api/1.0/badge/executable/o2r',
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

    describe('POST /api/1.0/badge/executable/o2r with json with jobStatus "failure"', () => {
        before(function (done) {
            fs.readFile('./test/data/executable/testfile2.json', 'utf8', function (err, fileContents) {
                if (err) throw err;
                form = JSON.parse(fileContents);
                done();
            });
        });
        it('should respond with a small red badge: "executable no"', (done) => {
            request({
                uri: baseURL + '/api/1.0/badge/executable/o2r',
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

    describe('POST /api/1.0/badge/executable/o2r with json with jobStatus "running"', () => {
        before(function (done) {
            fs.readFile('./test/data/executable/testfile3.json', 'utf8', function (err, fileContents) {
                if (err) throw err;
                form = JSON.parse(fileContents);
                done();
            });
        });
        it('should respond with a small red badge: "executable no"', (done) => {
            request({
                uri: baseURL + '/api/1.0/badge/executable/o2r',
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

    describe('POST /api/1.0/badge/executable/o2r with json without executable information', () => {
        before(function (done) {
            fs.readFile('./test/data/executable/testfile4.json', 'utf8', function (err, fileContents) {
                if (err) throw err;
                form = JSON.parse(fileContents);
                done();
            });
        });
        it('should respond with a small badge indicating no information', (done) => {
            request({
                uri: baseURL + '/api/1.0/badge/executable/o2r',
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



    describe('GET /api/1.0/badge/executable/o2r/doi:10.99999%2Funknown', () => {
        it('unassigned doi: should respond with a small badge indicating no information', (done) => {
            request({
                uri: baseURL + '/api/1.0/badge/executable/o2r/' + 'doi:10.99999%2Funknown',
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

    describe('POST /api/1.0/badge/executable/o2r/extended with jobStatus "success"', () => {
        before(function (done) {
            fs.readFile('./test/data/executable/testfile1.json', 'utf8', function (err, fileContents) {
                if (err) throw err;
                form = JSON.parse(fileContents);
                done();
            });
        });
        it('should respond with a big badge with positive executability', (done) => {
            request({
                uri: baseURL + '/api/1.0/badge/executable/o2r/extended',
                method: 'POST',
                form: form,
                timeout: requestLoadingTimeout,
                followRedirect: false
            }, (err, res, body) => {
                if (err) done(err);
                assert.ifError(err);
                assert.equal(res.statusCode, 200);
                assert.equal(md5(res.body), md5Green.toLowerCase());
                done();
            });
        }).timeout(20000);
    });

    describe('POST /api/1.0/badge/executable/o2r/extended with json with jobStatus "failure"', () => {
        before(function (done) {
            fs.readFile('./test/data/executable/testfile2.json', 'utf8', function (err, fileContents) {
                if (err) throw err;
                form = JSON.parse(fileContents);
                done();
            });
        });
        it('should respond with a big red badge: "executable no"', (done) => {
            request({
                uri: baseURL + '/api/1.0/badge/executable/o2r/extended',
                method: 'POST',
                form: form,
                timeout: requestLoadingTimeout,
                followRedirect: false
            }, (err, res, body) => {
                if (err) done(err);
                assert.ifError(err);
                assert.equal(res.statusCode, 200);
                assert.equal(md5(res.body), md5Red.toLowerCase());
                done();
            });
        }).timeout(20000);
    });

    describe('POST /api/1.0/badge/executable/o2r with json with jobStatus "running"', () => {
        before(function (done) {
            fs.readFile('./test/data/executable/testfile3.json', 'utf8', function (err, fileContents) {
                if (err) throw err;
                form = JSON.parse(fileContents);
                done();
            });
        });
        it('should respond with a big yellow badge: "executable running"', (done) => {
            request({
                uri: baseURL + '/api/1.0/badge/executable/o2r/extended',
                method: 'POST',
                form: form,
                timeout: requestLoadingTimeout,
                followRedirect: false
            }, (err, res, body) => {
                if (err) done(err);
                assert.ifError(err);
                assert.equal(res.statusCode, 200);
                assert.equal(md5(res.body), md5Running.toLowerCase());
                done();
            });
        }).timeout(20000);
    });

    describe('POST /api/1.0/badge/executable/o2r/extended with json without executable information', () => {
        before(function (done) {
            fs.readFile('./test/data/executable/testfile4.json', 'utf8', function (err, fileContents) {
                if (err) throw err;
                form = JSON.parse(fileContents);
                done();
            });
        });
        it('should respond with a big grey badge indicating no information', (done) => {
            request({
                uri: baseURL + '/api/1.0/badge/executable/o2r/extended',
                method: 'POST',
                form: form,
                timeout: requestLoadingTimeout,
                followRedirect: false
            }, (err, res, body) => {
                if (err) done(err);
                assert.ifError(err);
                assert.equal(res.statusCode, 200);
                done();
            });
        }).timeout(20000);
    });


    describe('GET /api/1.0/badge/executable/o2r/doi:10.99999%2Funknown', () => {
        it('unassigned doi: should respond with a small badge indicating no information', (done) => {
            request({
                uri: baseURL + '/api/1.0/badge/executable/o2r/' + 'doi:10.99999%2Funknown',
                method: 'GET',
                timeout: requestLoadingTimeout,
                followRedirect: false
            }, (err, res, body) => {
                if (err) done(err);
                assert.ifError(err);
                assert.equal(res.statusCode, 302);
                assert.equal(md5(res.body), md5NoInfo.toLowerCase());
                done();
            });
        }).timeout(20000);
    });

});

//todo test the GET controllers with a compendium with executable information (https://o2r.uni-muenster.de/api/v1/compendium/cUgvE) (> success badge)
// --> cUgvE compendium currently does not have a DOI, which means it can't be found