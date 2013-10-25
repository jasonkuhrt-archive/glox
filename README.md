# glox
File globbing enhanced with [xregexp](https://github.com/slevithan/xregexp).

Pre-alpha API, see notes.


## Install
    npm install jasonkuhrt/glox

## Use-case
```js
var glox = require('glox');
var bail = require('bail');
var {each, partialRight} = require('lodash');

var commands = require('../commands');



var add_test = function(result)->
  var cmd_name = result.matches.cmd_name.replace(/-/g,'_')
  describe(cmd_name, function(){
    require(result.path)(commands[cmd_name]);
  });

var each_add_test = bail(partialRight(each, add_test));

glox(__dirname + '/cases/command-(?<cmd_name>.*).js', each_add_test);
```

## API
    TODO
#### glox(pattern, callback)
#### glox.sync(pattern)
## Notes
- The current API does not support intermixed globbing and regexp syntax in a path. Instead, everything *before* the last `/` is globbing while everything *after* is [xregexp](https://github.com/slevithan/xregexp). I want to improve this.

  ```
  // Works
  var results = glox.sync(__dirname + '/server/**/command-(?<cmd_name>.*).js');

  // Fails
  var results = glox.sync(__dirname + '/(?<type>.*)/**/command-(?<cmd_name>.*).js');
  ```