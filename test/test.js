//test file with mocha
var chai = require('chai');
var chaiHttp = require('chai-http');
var should = chai.should();
var expect = chai.expect;


//test the png
describe('Test the get.app method with png', function () {
  describe('GET http://localhost:3000/api/1.0/badge/doaj/1234?type=png', function () {
    it('should return an image', function () {
      chai.request(server)
        .get('/api/1.0/badge/doaj/1234?type=png')
        .end(function (err, res) {
          res.should.have.status(200);
          done();

        });
    });
  });

  //test the svg
  describe('Test the get.app method with svg', function () {
    describe('GET http://localhost:3000/api/1.0/badge/doaj/1234?type=svg', function () {
      it('should return an image', function () {
        chai.request(server)
          .get('/api/1.0/badge/doaj/1234?type=svg')
          .end(function (err, res) {
            res.should.have.status(200);
            done();
          });
      });
    });



    //test the png with width
    describe('Test the get.app method with png and width', function () {
      describe('GET http://localhost:3000/api/1.0/badge/doaj/1234?type=png&width=1000', function () {
        it('should return an image', function () {
          chai.request(server)
            .get('/api/1.0/badge/doaj/1234?type=png&width=1000')
            .end(function (err, res) {
              res.should.have.status(200);
              done();
            });
        });
      });
