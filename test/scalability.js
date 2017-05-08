//test file with mocha
const debug = require('debug')('badger');
var server = require('../index');
var chai = require('chai');
var chaiHttp = require('chai-http');
var sizeOf = require('image-size');
var fs = require('fs');
var StringDecoder = require('string_decoder').StringDecoder;
var decoder = new StringDecoder('utf8');
var should = chai.should();
var expect = chai.expect;
chai.use(chaiHttp);

//test the png
describe('Test the get.app method with png and width', function () {
  describe('GET localhost:3000/api/1.0/badge/executable/o2r/2?format=png&width=100', function () {
    it('should have OK response status', function (done) {
      chai.request(server)
        .get('/api/1.0/badge/executable/o2r/2?format=png&width=100')
        .end(function (err, res) {
          res.should.have.status(200);
          done();
        });
    }).timeout(3000);
    it('should return some content', function (done) {
      chai.request(server)
        .get('/api/1.0/badge/executable/o2r/2?format=png')
        .end(function (err, res) {
          res.body.should.not.be.empty;
          done();
        });
    });
    it('should return the correct image type', function (done) {
      chai.request(server)
        .get('/api/1.0/badge/executable/o2r/3?format=png')
        .end(function (err, res) {
          var dimensions = sizeOf(res.body);
          expect(dimensions.type).to.eql('png');
          res.type.should.eql('image/png');
          res.headers['content-type'].should.eql('image/png');
          done();
        });
    });
    it('should return the correct image size', function (done) {
      chai.request(server)
        .get('/api/1.0/badge/executable/o2r/3?format=png&width=42')
        .end(function (err, res) {
          var dimensions = sizeOf(res.body);
          expect(dimensions.width).to.eql(42);
          done();
        });
    });
  });
});

//test the svg
describe('Test the get.app method with svg', function () {
  describe('GET localhost:3000/api/1.0/badge/executable/o2r/1?format=svg', function () {
    it('should return svg', function (done) {
      chai.request(server)
        .get('/api/1.0/badge/executable/o2r/1?format=svg')
        .end(function (err, res) {
          res.should.have.status(200);
          res.should.not.be.empty;
          var svgstring = decoder.end(res.body);
          svgstring.should.include('<svg');
          done();
        });
    }).timeout(3000);
  });
});

