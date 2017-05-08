'use strict';
const debug = require('debug')('badger');
var nodeServer = process.env.NODE_SERVER || "http://192.168.99.100:3001";//-e
debug(nodeServer+ " nodeserver");

var assert = require('assert');
var chai = require('chai');
var chaiHttp = require('chai-http');
var md5 = require('js-md5');
var FileAPI = require('file-api')
  , File = FileAPI.File
  , FileList = FileAPI.FileList
  , FileReader = FileAPI.FileReader;
var should = chai.should();
var expect = chai.expect();

chai.use(chaiHttp);

// read the file for the green badge
var bufferfile;
var fileReader = new FileReader();
var md5Green = "2B447B8075D1C171C1D93907090C340C";
var md5Red = "034ED6323FCA0366A097E46658683A0F";
var md5NoInfo = "9D2055F78ABE6A1E7975E555EC8CAEEF";
var md5Running = "FEA50CDE2DB676A66903C30833E9A200";


describe('Badge', function() {
    describe('/GET GreenBadge', function() {
        it('Should return the green badge when the id is 1', function(done) {
            chai.request(nodeServer)
            .get('/api/1.0/badge/executable/o2r/doi:10.1006%2Fjeem.1994.1031/extended')
            .end(function(err, res) {
                res.should.have.status(200);
                res.body.should.not.be.empty;
                assert.equal(md5(res.body), md5Green.toLowerCase());
                done();

            });

        });
    });
    describe('/GET RedBadge', function() {
        it('Should return the red badge', function(done) {
            chai.request(nodeServer)
                .get('/api/1.0/badge/executable/o2r/doi:10.1115%2F1.2128636/extended')
                .end(function(err, res) {
                    res.should.have.status(200);
                    res.body.should.not.be.empty;
                    assert.equal(md5(res.body), md5Red.toLowerCase());
                    done();
                });

        });
    });
    /*describe('/GET RunningBadge', function() {
        it('Should return the red badge when the id is 3', function(done) {
            chai.request(nodeServer)
                .get('/api/1.0/badge/executable/o2r/3/extended')
                .end(function(err, res) {
                    res.should.have.status(200);
                    res.body.should.not.be.empty;
                    assert.equal(md5(res.body), md5Running.toLowerCase());
                    done();
                });

        });
    });*/
    describe('/GET NoInfoBadge', function() {
        it('Should return the running badge when the id is 4', function(done) {
            chai.request(nodeServer)
                .get('/api/1.0/badge/executable/o2r/4/extended')
                .end(function(err, res) {
                    res.should.have.status(200);
                    res.body.should.not.be.empty;
                    assert.equal(md5(res.body), md5NoInfo.toLowerCase());
                    done();
                });

        });
    });
});