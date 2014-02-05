var _ = require('lodash');
var Q = require('q');

var poppins, prChecklist;

module.exports = function initPlugin (pop) {
  poppins = pop;

  prChecklist = poppins.plugins.prChecklist = _.defaults(poppins.plugins.prChecklist || {}, {

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

  return prChecklist.responseBody(data).
    then(function (body) {
      return poppins.createComment(number, body);
    }).
    done(function () {
      poppins.emit('plugin:pr:done');
    });
}

function responseBody (data) {
  return Q.all([
    prChecklist.greeting,
    prChecklist.checklist(data),
    prChecklist.closing
  ]).
  then(function (paragraphs) {
    return paragraphs.join('\n\n');
  });
}

function checklist (data) {
  return Q.all(prChecklist.checks.map(function (check) {
      return check.condition(data).then(function (condition) {
        // if the condition is a string, it explains why the box is unchecked
        // if it's an empty string, the box should be checked
        // if it's bool, true = checked, false = unchecked
        // yay backwards compatibility-driven APIs
        if (typeof condition === 'string') {
          if (condition.length === 0) {
            condition = true;
          } else {
            return prChecklist.checkbox(false) + check.message + ' (' + condition + ')';
          }
        }
        return prChecklist.checkbox(condition) + check.message;
      });
    })).
    then(function (lines) {
      return lines.join('\n');
    });
}


function checkbox (value) {
  return value ? '- [x] ' : '- [ ] ';
}

