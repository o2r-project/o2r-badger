'use strict';
const debug = require('debug')('badger');
const config = require('../config/config');

const fs = require('fs');
const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const request = require('request');
const md5 = require('js-md5');
const assert = require('chai').assert;

chai.use(chaiHttp);

let baseURL = config.net.testEndpoint + ':' + config.net.port;
let form;
let requestLoadingTimeout = 10000;

describe('Scalability of badges:', function () {

    describe('POST /api/1.0/badge/licence/extended with json including licence information', () => {
        before(function (done) {
            fs.readFile('./test/data/licence/testjson1.json', 'utf8', function (err, fileContents) {
                if (err) throw err;
                form = JSON.parse(fileContents);
                done();
            });
        });
        it('should respond with a big badge as PNG (license open)', (done) => {
            request({
                uri: baseURL + '/api/1.0/badge/licence/extended?format=png',
                method: 'POST',
                form: form,
                timeout: requestLoadingTimeout
            }, (err, res, body) => {
                if (err) done(err);
                assert.ifError(err);
                assert.equal(res.statusCode, 200);
                assert.equal(res.headers['content-type'], 'image/png');
                done();
            });
        }).timeout(20000);
    });

    describe('POST /api/1.0/badge/licence/extended with json including licence information', () => {
        before(function (done) {
            fs.readFile('./test/data/licence/testjson1.json', 'utf8', function (err, fileContents) {
                if (err) throw err;
                form = JSON.parse(fileContents);
                done();
            });
        });
        it('should respond with a big badge as PNG in 200x200 (license open)', (done) => {
            request({
                uri: baseURL + '/api/1.0/badge/licence/extended?format=png&width=200',
                method: 'POST',
                form: form,
                timeout: requestLoadingTimeout
            }, (err, res, body) => {
                if (err) done(err);
                assert.ifError(err);
                assert.equal(res.statusCode, 200);
                assert.equal(res.headers['content-type'], 'image/png');
                let rawString = body.replace(/\r?\n|\r|\n/g, ''); //remove newlines
                assert.equal(rawString.length, 8374);
                //assert.equal(res.headers['content-length'], '11226');
                //Todo fix test
                done();
            });
        }).timeout(20000);
    });
});
