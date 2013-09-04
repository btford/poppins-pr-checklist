var _ = require('lodash');
var Q = require('q');

var poppins, prPlugin;

module.exports = function initPlugin (pop) {
  poppins = pop;

  prPlugin = poppins.plugins.pr = _.defaults(poppins.plugins.pr, {

    responseBody: responseBody,

    greeting: 'Greetings.',
    closing: 'Farewell.',
    checks: [],

    // markdown utils
    checklist: checklist,
    checkbox: checkbox

  });

  poppins.on('pullRequestOpened', respondToPullRequest);
};

function respondToPullRequest (data) {
  var number = data.pull_request.number;

  return prPlugin.responseBody(data).
    then(function (body) {
      return poppins.createComment(number, body);
    }).
    done(function () {
      poppins.emit('plugin:pr:done');
    });
}

function responseBody (data) {
  return Q.all([
    prPlugin.greeting,
    prPlugin.checklist(data),
    prPlugin.closing
  ]).
  then(function (paragraphs) {
    return paragraphs.join('\n\n');
  });
}

function checklist (data) {
  return Q.all([
    prPlugin.
      checks.
      map(function (check) {
        return check.condition(data).then(function (condition) {
          return prPlugin.checkbox(condition) + check.message;
        });
      })
    ]).
    then(function (lines) {
      return lines.join('\n');
    });
}


function checkbox (value) {
  return value ? '- [x] ' : '- [ ] ';
}

