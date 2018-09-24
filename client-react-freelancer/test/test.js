var http = require('http');
var assert = require('chai').assert;

describe('http tests', function(){
    it('should return if the url is correct', function(done){
        http.get('http://localhost:3001/', function(res,err) {
            if (err)
                done(err);
            assert.equal(200, res.statusCode);
            done();
        })
    });
});

describe('http tests', function(){
    it('should return true if the url is correct', function(done){
        http.get('http://localhost:3001/project', function(res,err) {
            if (err)
                done(err);
            assert.equal(200, res.statusCode);
            done();
        })
    });
});


describe('http tests', function(){
    it('should return the user as Freelancer Projects if the url is correct', function(done){
        http.get('http://localhost:3001/project/userAsFreelancerProjects', function(res,err) {
            if (err)
                done(err);
            assert.equal(200, res.statusCode);
            done();
        })
    });
});

describe('http tests', function(){
    it('should return the bids list if the url is correct', function(done){
        http.get('http://localhost:3001/project/getBids', function(res,err) {
            if (err)
                done(err);
            assert.equal(200, res.statusCode);
            done();
        })
    });
});

describe('http tests', function(){
    it('should return the user bidded projects if the url is correct', function(done){
        http.get('http://localhost:3001/project/userBidedProjects', function(res,err) {
            if (err)
                done(err);
            assert.equal(200, res.statusCode);
            done();
        })
    });
});
