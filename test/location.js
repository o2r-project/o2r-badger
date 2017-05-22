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

const jsdom = require("jsdom");
const { JSDOM } = jsdom;

chai.use(chaiHttp);

let baseURL = config.net.endpoint + ':' + config.net.port;
let form;
let requestLoadingTimeout = 10000;

describe('Sciebo loader', function () {


    describe('POST /api/1.0/badge/spatial/o2r with json including spatial information', () => {
        before(function (done) {
            fs.readFile('./test/data/spatial/sample1.json', 'utf8', function (err, fileContents) {
                if (err) throw err;
                form = JSON.parse(fileContents);
                done();
            });
        });
        it('should respond with a index.html including a map', (done) => {
            request({
                uri: baseURL + '/api/1.0/badge/spatial/o2r/extended',
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

    describe('POST /api/1.0/badge/spatial/o2r with json missing spatial information', () => {
        before(function (done) {
            fs.readFile('./test/data/spatial/sample2.json', 'utf8', function (err, fileContents) {
                if (err) throw err;
                form = JSON.parse(fileContents);
                done();
            });
        });
        it('should respond with a index.html without a map', (done) => {
            request({
                uri: baseURL + '/api/1.0/badge/spatial/o2r/extended',
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
});
