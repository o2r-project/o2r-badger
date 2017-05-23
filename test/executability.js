'use strict';
const debug = require('debug')('badger');
const config = require('../config/config');

const fs = require('fs');
const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const request = require('request');

//const request = require('supertest');
const assert = require('chai').assert;

chai.use(chaiHttp);

let baseURL = config.net.endpoint + ':' + config.net.port;
let form;
let requestLoadingTimeout = 10000;

// read the file for the green badge
var md5Green = "2B447B8075D1C171C1D93907090C340C";
var md5Red = "034ED6323FCA0366A097E46658683A0F";
var md5NoInfo = "9D2055F78ABE6A1E7975E555EC8CAEEF";
var md5Running = "FEA50CDE2DB676A66903C30833E9A200";

describe('executability badge:', function () {

    describe('POST /api/1.0/badge/executable/o2r with json including executable information', () => {
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
                assert.equal(res.headers['location'], 'https://img.shields.io/badge/research%20executability-Utrecht%2C%20Netherlands-blue.svg');
                done();
            });
        }).timeout(20000);
    });

    describe('POST /api/1.0/badge/executable/o2r with json without executable information', () => {
        before(function (done) {
            fs.readFile('./test/data/executable/testfile2.json', 'utf8', function (err, fileContents) {
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
                assert.equal(res.headers['location'], 'https://img.shields.io/badge/research%20executability-n%2Fa-lightgrey.svg');
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
                assert.equal(res.headers['location'], 'https://img.shields.io/badge/research%20executability-n%2Fa-lightgrey.svg');
                done();
            });
        }).timeout(20000);
    });
});

//todo test the GET controllers with a compendium with executable information (https://o2r.uni-muenster.de/api/v1/compendium/cUgvE) (> success badge)
// --> cUgvE compendium currently does not have a DOI, which means it can't be found