'use strict';

var _ = require('lodash');
var Q = require('q');

var poppins, prChecklist;

module.exports = function initPlugin (pop) {
  poppins = pop;

  prChecklist = poppins.plugins.prChecklist = _.defaults(poppins.plugins.prChecklist || {}, {

    responseBody: responseBody,

    greeting: 'Thanks for the PR!',
    closing: 'Farewell.',
    checks: [],

    good: 'Thanks for the PR! Looks good.',

    // markdown utils
    checklist: checklist

  });

  poppins.on('pullRequestOpened', respondToPullRequest);
};

function respondToPullRequest (data) {
  var number = data.pull_request.number;

  return prChecklist.responseBody(data).
    then(function (body) {
      return poppins.createComment(number, body);
    }).
    done(function () {
      poppins.emit('plugin:pr:done');
    });
}

function responseBody (data) {
  return prChecklist.checklist(data).then(function (list) {
    function maybeCall (value) {
      return _.isFunction(value) ? value(data) : value;
    }

    var greeting = maybeCall(prChecklist.greeting);
    var closing = maybeCall(prChecklist.closing);
    var good = maybeCall(prChecklist.good);

    return list ? Q.all([greeting, list, closing]) : [good];
  }).
  then(function (paragraphs) {
    return paragraphs.join('\n\n');
  });
}

var EMPTY = '- [ ] ';

function checklist (data) {
  return Q.all(prChecklist.checks.map(function (check) {
      return Q(check.condition(data)).then(function (condition) {
        if (typeof condition !== 'string' || condition.length > 0) {
          return EMPTY + check.message + ' ' + (condition || '');
        }
      });
    })).
    then(function (lines) {
      return lines.filter(identity).join('\n');
    });
}

function identity (x) {
  return x;
}
