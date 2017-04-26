'use strict';
const debug = require('debug')('badger');
var nodeServer = /*'http://localhost:3003'*/ process.env.NODE_SERVER || "http://192.168.99.100:3003";//-e
debug(nodeServer + " nodeserver");

var assert = require('assert');
var chai = require('chai');
var chaiHttp = require('chai-http');
var md5 = require('js-md5');
var should = chai.should();

chai.use(chaiHttp);

// read the md5 checksums
var md5_1 = 'f9b18013b659aa75e47f8df94ea1811d';
var md5_2 = "1239c3a905a84db1dd29c257b64cb5e6";
var md5_3 = "b55d6d3b2227faf84d262cac74fd5e00";
var md5_4 = "2bfa02f9e941c48645d6edc29afeb835";
var md5_5 = "bb5915e4acdf7183ba49fc75f72097c6";
var md5_6 = "2c1f2d2301d52e4e73dc64184ccf7f6d";
var md5_7 = "c89c38e6add160bac39b7699052634a7";
var md5_8 = "fe2c04f833bc6afbb51bf6d3286eb276";
var md5_9 = "1555130a8108e952e1c0a9a70518db6e";
var md5_10 = "cbcbaf755cf76229aa2c6e7e3102b61f";
var md5_11 = "4833a356fcfcdc0a579d6226cf8cdfb9";
var md5_12 = "80d8c49d9eefe52c8b22fbdb28842f8e";
var md5_13 = "d39ff9bec798523c72340268225e5fb9";
var md5_14 = "25f607664e0f18f8ba2b9cc0ee8f174d";
var md5_15 = "94f3440249ced5b1c5a91a534109ba7b";
var md5_16 = "a07319a5e4edb1315225622ad294ad87";
var md5_17 = "64eda892054bbfe7eb4e216026c4bcd4";
var md5_18 = "b933581b8ad9c51421d23dbfe7d87902";
var md5_19 = "6ff60d89ad26d20b6c251308a2a30831";
var md5_20 = "9cf9cff045aee153e79dfe66fc7167fe";
var md5_21 = "075315671a191883bbff7711f86c921e";
var md5_22 = "1d961b813bb532facc8514c5b19e5540";
var md5_23 = "995050e63b86eb2c106aca9d3702a9a6";
var md5_24 = "30723de3e98193429d0c551972bbc4b5";
var md5_25 = "434854866412eb3e517d947b218a7a3a";
var md5_26 = "d9de9c9f2599195a665f084eee5c178a";
var md5_27 = "0af3d7fd87ed92f05e94d8021cd91280";



describe('Licence', function () {
    describe('/GET license_open', function () {
        it('Should return the green badge when id is 1', function (done) {
            chai.request(nodeServer)
                .get('/api/1.0/badge/licence/o2r/1')
                .end(function (err, res) {
                    res.should.have.status(200);
                    res.body.should.not.be.empty;
                    assert.equal(md5(res.body), md5_1);
                    done();

                });

        });
    });
    describe('/GET license_noData_code_text', function () {
        it('Should return the license_noData_code_text badge when the id is 2', function (done) {
            chai.request(nodeServer)
                .get('/api/1.0/badge/licence/o2r/2')
                .end(function (err, res) {
                    res.should.have.status(200);
                    res.body.should.not.be.empty;
                    assert.equal(md5(res.body), md5_2);
                    done();
                });

        });
    });
    describe('/GET license_data_code_noText', function () {
        it('Should return the license_data_code_noText badge when the id is 3', function (done) {
            chai.request(nodeServer)
                .get('/api/1.0/badge/licence/o2r/3')
                .end(function (err, res) {
                    res.should.have.status(200);
                    res.body.should.not.be.empty;
                    assert.equal(md5(res.body), md5_3);
                    done();
                });

        });
    });

    describe('/GET license_data_noCode_text', function () {
        it('Should return the license_data_noCode_text badge when the id is 4', function (done) {
            chai.request(nodeServer)
                .get('/api/1.0/badge/licence/o2r/4')
                .end(function (err, res) {
                    res.should.have.status(200);
                    res.body.should.not.be.empty;
                    assert.equal(md5(res.body), md5_4);
                    done();
                });

        });
    });
    describe('/GET license_data_noCode_noText', function () {
        it('Should return the license_data_noCode_noText badge when the id is 5', function (done) {
            chai.request(nodeServer)
                .get('/api/1.0/badge/licence/o2r/5')
                .end(function (err, res) {
                    res.should.have.status(200);
                    res.body.should.not.be.empty;
                    assert.equal(md5(res.body), md5_5);
                    done();
                });

        });
    });
    describe('/GET license_noData_noCode_text', function () {
        it('Should return the license_noData_noCode_text badge when the id is 6', function (done) {
            chai.request(nodeServer)
                .get('/api/1.0/badge/licence/o2r/6')
                .end(function (err, res) {
                    res.should.have.status(200);
                    res.body.should.not.be.empty;
                    assert.equal(md5(res.body), md5_6);
                    done();
                });

        });
    });
    describe('/GET license_noData_code_noText', function () {
        it('Should return the license_noData_code_noText badge when the id is 7', function (done) {
            chai.request(nodeServer)
                .get('/api/1.0/badge/licence/o2r/7')
                .end(function (err, res) {
                    res.should.have.status(200);
                    res.body.should.not.be.empty;
                    assert.equal(md5(res.body), md5_7);
                    done();
                });

        });
    });
    describe('/GET license_noData_noCode_noText', function () {
        it('Should return the license_noData_noCode_noText badge when the id is 8', function (done) {
            chai.request(nodeServer)
                .get('/api/1.0/badge/licence/o2r/8')
                .end(function (err, res) {
                    res.should.have.status(200);
                    res.body.should.not.be.empty;
                    assert.equal(md5(res.body), md5_8);
                    done();
                });

        });
    });
    describe('/GET license_data_text', function () {
        it('Should return the license_data_text badge when the id is 9', function (done) {
            chai.request(nodeServer)
                .get('/api/1.0/badge/licence/o2r/9')
                .end(function (err, res) {
                    res.should.have.status(200);
                    res.body.should.not.be.empty;
                    assert.equal(md5(res.body), md5_9);
                    done();
                });

        });
    });
    describe('/GET license_data_code', function () {
        it('Should return the license_data_code badge when the id is 10', function (done) {
            chai.request(nodeServer)
                .get('/api/1.0/badge/licence/o2r/10')
                .end(function (err, res) {
                    res.should.have.status(200);
                    res.body.should.not.be.empty;
                    assert.equal(md5(res.body), md5_10);
                    done();
                });

        });
    });
    describe('/GET license_code_text', function () {
        it('Should return the license_code_text badge when the id is 11', function (done) {
            chai.request(nodeServer)
                .get('/api/1.0/badge/licence/o2r/11')
                .end(function (err, res) {
                    res.should.have.status(200);
                    res.body.should.not.be.empty;
                    assert.equal(md5(res.body), md5_11);
                    done();
                });

        });
    });
    describe('/GET license_data', function () {
        it('Should return the license_data badge when the id is 12', function (done) {
            chai.request(nodeServer)
                .get('/api/1.0/badge/licence/o2r/12')
                .end(function (err, res) {
                    res.should.have.status(200);
                    res.body.should.not.be.empty;
                    assert.equal(md5(res.body), md5_12);
                    done();
                });

        });
    });
    describe('/GET license_text', function () {
        it('Should return the license_text badge when the id is 13', function (done) {
            chai.request(nodeServer)
                .get('/api/1.0/badge/licence/o2r/13')
                .end(function (err, res) {
                    res.should.have.status(200);
                    res.body.should.not.be.empty;
                    assert.equal(md5(res.body), md5_13);
                    done();
                });

        });
    });
    describe('/GET license_code', function () {
        it('Should return the license_code badge when the id is 14', function (done) {
            chai.request(nodeServer)
                .get('/api/1.0/badge/licence/o2r/14')
                .end(function (err, res) {
                    res.should.have.status(200);
                    res.body.should.not.be.empty;
                    assert.equal(md5(res.body), md5_14);
                    done();
                });

        });
    });
    describe('/GET license_data_noText', function () {
        it('Should return the license_data_noText badge when the id is 15', function (done) {
            chai.request(nodeServer)
                .get('/api/1.0/badge/licence/o2r/15')
                .end(function (err, res) {
                    res.should.have.status(200);
                    res.body.should.not.be.empty;
                    assert.equal(md5(res.body), md5_15);
                    done();
                });

        });
    });
    describe('/GET license_noData_text', function () {
        it('Should return the license_noData_text badge when the id is 16', function (done) {
            chai.request(nodeServer)
                .get('/api/1.0/badge/licence/o2r/16')
                .end(function (err, res) {
                    res.should.have.status(200);
                    res.body.should.not.be.empty;
                    assert.equal(md5(res.body), md5_16);
                    done();
                });

        });
    });
    describe('/GET license_code_noText', function () {
        it('Should return the license_code_noText badge when the id is 17', function (done) {
            chai.request(nodeServer)
                .get('/api/1.0/badge/licence/o2r/17')
                .end(function (err, res) {
                    res.should.have.status(200);
                    res.body.should.not.be.empty;
                    assert.equal(md5(res.body), md5_17);
                    done();
                });

        });
    });
    describe('/GET license_noCode_text', function () {
        it('Should return the license_noCode_text badge when the id is 18', function (done) {
            chai.request(nodeServer)
                .get('/api/1.0/badge/licence/o2r/18')
                .end(function (err, res) {
                    res.should.have.status(200);
                    res.body.should.not.be.empty;
                    assert.equal(md5(res.body), md5_18);
                    done();
                });

        });
    });
    describe('/GET license_noData_code', function () {
        it('Should return the license_noData_code badge when the id is 19', function (done) {
            chai.request(nodeServer)
                .get('/api/1.0/badge/licence/o2r/19')
                .end(function (err, res) {
                    res.should.have.status(200);
                    res.body.should.not.be.empty;
                    assert.equal(md5(res.body), md5_19);
                    done();
                });

        });
    });
    describe('/GET license_data_noCode', function () {
        it('Should return the license_data_noCode badge when the id is 20', function (done) {
            chai.request(nodeServer)
                .get('/api/1.0/badge/licence/o2r/20')
                .end(function (err, res) {
                    res.should.have.status(200);
                    res.body.should.not.be.empty;
                    assert.equal(md5(res.body), md5_20);
                    done();
                });

        });
    });
    describe('/GET license_noData_noText', function () {
        it('Should return the license_noData_noText badge when the id is 21', function (done) {
            chai.request(nodeServer)
                .get('/api/1.0/badge/licence/o2r/21')
                .end(function (err, res) {
                    res.should.have.status(200);
                    res.body.should.not.be.empty;
                    assert.equal(md5(res.body), md5_21);
                    done();
                });

        });
    });
    describe('/GET license_noData_noCode', function () {
        it('Should return the license_noData_noCode badge when the id is 22', function (done) {
            chai.request(nodeServer)
                .get('/api/1.0/badge/licence/o2r/22')
                .end(function (err, res) {
                    res.should.have.status(200);
                    res.body.should.not.be.empty;
                    assert.equal(md5(res.body), md5_22);
                    done();
                });

        });
    });
    describe('/GET license_noData', function () {
        it('Should return the license_noData badge when the id is 23', function (done) {
            chai.request(nodeServer)
                .get('/api/1.0/badge/licence/o2r/23')
                .end(function (err, res) {
                    res.should.have.status(200);
                    res.body.should.not.be.empty;
                    assert.equal(md5(res.body), md5_23);
                    done();
                });

        });
    });
    describe('/GET license_noCode', function () {
        it('Should return the license_noCode badge when the id is 24', function (done) {
            chai.request(nodeServer)
                .get('/api/1.0/badge/licence/o2r/24')
                .end(function (err, res) {
                    res.should.have.status(200);
                    res.body.should.not.be.empty;
                    assert.equal(md5(res.body), md5_24);
                    done();
                });

        });
    });
    describe('/GET license_noText', function () {
        it('Should return the license_noText badge when the id is 25', function (done) {
            chai.request(nodeServer)
                .get('/api/1.0/badge/licence/o2r/25')
                .end(function (err, res) {
                    res.should.have.status(200);
                    res.body.should.not.be.empty;
                    assert.equal(md5(res.body), md5_25);
                    done();
                });

        });
    });
    describe('/GET license_noCode_noText', function () {
        it('Should return the license_noCode_noText badge when the id is 26', function (done) {
            chai.request(nodeServer)
                .get('/api/1.0/badge/licence/o2r/26')
                .end(function (err, res) {
                    res.should.have.status(200);
                    res.body.should.not.be.empty;
                    assert.equal(md5(res.body), md5_26);
                    done();
                });

        });
    });
    describe('/GET license_noInformation', function () {
        it('Should return the license_noInfromation badge when the id is 27', function (done) {
            chai.request(nodeServer)
                .get('/api/1.0/badge/licence/o2r/27')
                .end(function (err, res) {
                    res.should.have.status(200);
                    res.body.should.not.be.empty;
                    assert.equal(md5(res.body), md5_27);
                    done();
                });

        });
    });
});