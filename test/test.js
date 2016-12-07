//test file with mocha
var server = require('../index');
var chai = require('chai');
var chaiHttp = require('chai-http');
var should = chai.should();
var expect = chai.expect;


chai.use(chaiHttp);


//test the png
describe('Test the get.app method with png and width', function () {
  describe('GET localhost:3000/api/1.0/badge/executable/o2r/id?format=png&width=100', function () {
    it('should return an image', function () {
      chai.request(server)
        .get('/api/1.0/badge/executable/o2r/id?format=png&width=100')
        .end(function (err, res) {
          res.should.have.status(200);
          res.body.should.not.be.empty;
          done();
        });
    });
  });
});

//test the svg
describe('Test the get.app method with svg', function () {
  describe('GET localhost:3000/api/1.0/badge/licence/o2r/id?format=svg', function () {
    it('should return an image', function () {
      chai.request(server)
        .get('/api/1.0/badge/licence/o2r/id?format=svg')
        .end(function (err, res) {
          res.should.have.status(200);
          res.body.should.not.be.empty;
          done();
        });
    });
  });
});



//test the png with width
describe('Test the get.app method with png', function () {
  describe('GET localhost:3000/api/1.0/badge/peerreviewed/o2r/id?format=png', function () {
    it('should return an image', function () {
      chai.request(server)
        .get('/api/1.0/badge/peerreviewed/o2r/id?format=png')
        .end(function (err, res) {
          res.should.have.status(200);
          res.body.should.not.be.empty;
          done();
        });
    });
  });
});
