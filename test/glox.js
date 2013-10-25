var _ = require('lodash');
var test = require('tap').test;
var glox = require('../');

function verify_results(t, results){
  var i = 0;
  var expected_results = [
    {path: __dirname + '/fixtures/circle-zen.txt',      matches:{shape:'circle',   emotional_state:'zen'}},
    {path: __dirname + '/fixtures/square-secure.txt',   matches:{shape:'square',   emotional_state:'secure'}},
    {path: __dirname + '/fixtures/triangle-angry.txt',  matches:{shape:'triangle', emotional_state:'angry'}},
  ];
  _.each(results, function(result){
    var e = expected_results[i];
    t.equal(result.path, e.path, 'file found');
    t.equal(result.matches.shape, e.matches.shape, 'matched shape');
    t.equal(result.matches.emotional_state, e.matches.emotional_state, 'matched emotional_state');
    i += 1;
  });
}

function bail(fn){
  return function(){
    if (_.first(arguments)) throw _.first(arguments);
    fn.apply(null, _.rest(arguments));
  }
}

var pattern = __dirname + '/fixtures/(?<shape>.*)-(?<emotional_state>.*)\.txt'



test('glox', function(t){
  t.plan(9);
  glox(pattern, bail(_.partial(verify_results, t)))
});

test('glox.sync', function(t){
  t.plan(9);
  verify_results(t, glox.sync(pattern))
});