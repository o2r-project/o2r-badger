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

describe('peer review badge (small):', function () {

    describe('POST /api/1.0/badge/peerreview with review-status "blind"', () => {
        before(function (done) {
            fs.readFile('./test/data/review-status/test1.json', 'utf8', function (err, fileContents) {
                if (err) throw err;
                form = JSON.parse(fileContents);
                done();
            });
        });
        it('should respond with a small badge with a research executability', (done) => {
            request({
                uri: baseURL + '/api/1.0/badge/peerreview',
                method: 'POST',
                form: form,
                timeout: requestLoadingTimeout,
                followRedirect: false
            }, (err, res, body) => {
                if (err) done(err);
                assert.ifError(err);
                assert.equal(res.statusCode, 302);
                assert.equal(res.headers['location'], 'https://img.shields.io/badge/Peer%20Review-Blind-green.svg');
                done();
            });
        }).timeout(20000);
    });

    describe('POST /api/1.0/badge/peerreview with json without peerreview information', () => {
        before(function (done) {
            fs.readFile('./test/data/review-status/test2.json', 'utf8', function (err, fileContents) {
                if (err) throw err;
                form = JSON.parse(fileContents);
                done();
            });
        });
        it('should respond with a small badge indicating no information', (done) => {
            request({
                uri: baseURL + '/api/1.0/badge/peerreview',
                method: 'POST',
                form: form,
                timeout: requestLoadingTimeout,
                followRedirect: false
            }, (err, res, body) => {
                if (err) done(err);
                assert.ifError(err);
                assert.equal(res.statusCode, 302);
                assert.equal(res.headers['location'], 'https://img.shields.io/badge/Peer%20Review-n%2Fa-lightgrey.svg');
                done();
            });
        }).timeout(20000);
    });

    describe('GET /api/1.0/badge/peerreview/10.3390%2Frs9030290', () => {
        it('badge via doi: should respond with a small badge indicating peer-review status "blind"', (done) => {
            request({
                uri: baseURL + '/api/1.0/badge/peerreview/' + '10.3390%2Frs9030290',
                method: 'GET',
                timeout: requestLoadingTimeout,
                followRedirect: false
            }, (err, res, body) => {
                if (err) done(err);
                assert.ifError(err);
                assert.equal(res.statusCode, 302);
                assert.equal(res.headers['location'], 'https://img.shields.io/badge/Peer%20Review-Blind-green.svg');
                done();
            });
        }).timeout(20000);
    });

});