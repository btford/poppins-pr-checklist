# poppins-pr-checklist

Mary Poppins plugin for responding to new PRs with a checklist of PR guidelines in a Github comment.

![poppins in action](https://raw.github.com/btford/poppins-pr-checklist/master/img/in-action.png)


## Install

`npm install poppins-pr-checklist`


## Configure

To use this plugin, you need to load it in your config file with `couldYouPlease`:

```javascript
// config.js
module.exports = function (poppins) {

  poppins.config = { /*...*/ };

  poppins.couldYouPlease('pr-checklist');

  // pr checklist
  poppins.plugins.prChecklist.greeting = 'Hello';
  poppins.plugins.prChecklist.checks = [
    { message: 'Foo', condition: function (data) { return false; } }
  ];
  poppins.plugins.prChecklist.closing = 'Farewell';
};
```

By default, Mary Poppins will only respond with a greeting and closing.
You have to configure her [checks](https://github.com/btford/poppins-pr-checklist#poppinspluginsprchecklistchecks) to get a list.


### `poppins.plugins.prChecklist.greeting`

String to start the response with.
Defaults to `"Greetings."`.


### `poppins.plugins.prChecklist.closing`

String to start the response with.
Defaults to `"Farewell."`.


### `poppins.plugins.prChecklist.checks`

Array of `{check}` objects.
Defaults to an empty array.

A `{check}` object has two properties:
* `message`: the string that corresponds to the text of the checkbox item.
* `condition`: a function that returns a representing whether or not the checkbox should be checked. It can also return a promise. The function receives one argument, `data`, which is a JSON object representing the PR in question. See the Github API for a description of the object.

Here's an example check:

```javascript
var myCheck = {
  message: 'The PR has an odd number.',
  condition: function (data) { return data; }
};
```


## Checklist Plugins

Because checks are just objects in the `poppins.plugins.prChecklist.checks` array, you can make a plugin that add new checks by appending to that array.

```javascript
// in a new module called `poppins-my-check`
module.exports = function (poppins) {
  poppins.plugins.prChecklist.checks.push({
    message: 'This is my Custom Check', condition: function (data) { return true; }
  });
};
```

Then you can load this module like you would any other:

```javascript
// config.js:
module.exports = function (poppins) {
  poppins.couldYouPlease('pr-checklist');
  poppins.couldYouPlease('my-check');
};
```

It's plugins all the way down!

See [poppins-check-cla](https://github.com/btford/poppins-check-cla) and [poppins-check-commit](https://github.com/btford/poppins-check-commit) for an example.

# License
MIT
