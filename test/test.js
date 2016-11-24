//test file with mocha,

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();

chai.use(chaiHttp);

describe('Test the get.app method with png', function() {
  describe('GET http://localhost:3000/api/1.0/badge/doaj/1234?type=png', function() {
    it('returns an image', function() {
      // ...
    });
  });
});

describe('Test the get.app method with svg', function() {
  describe('GET http://localhost:3000/api/1.0/badge/doaj/1234?type=svg', function() {
    it('returns an image', function() {
      // ...
    });
  });
});
