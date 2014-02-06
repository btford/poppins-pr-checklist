var Q       = require('q');
var plugin  = require('../plugin');
var mock    = require('poppins-mock');


describe('poppins-pr-checklist', function () {
  var poppins, pr;

  beforeEach(function () {
    poppins = mock.poppins();
    plugin(poppins);
    pr = mock.pr();
  });


  it('should work with an unwrapped condition', function (done) {

    poppins.plugins.prChecklist.checks.push({
      message: 'ok',
      condition: function (data) { return true }
    });

    poppins.simulatePrCreated(pr);
    poppins.on('plugin:pr:done', function () {
      expect(poppins.createComment.args[0]).toEqual([pr.number, 'Greetings.\n\n- [x] ok\n\nFarewell.']);
      done();
    });
  });


  it('should work with a condition that returns a promise', function (done) {

    poppins.plugins.prChecklist.checks.push({
      message: 'ok',
      condition: function (data) { return Q('you did it wrong') }
    });

    poppins.simulatePrCreated(pr);
    poppins.on('plugin:pr:done', function () {
      expect(poppins.createComment.args[0]).toEqual([pr.number, 'Greetings.\n\n- [ ] ok (you did it wrong)\n\nFarewell.']);
      done();
    });
  });


});
