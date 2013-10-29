var glob = require('glob');
var _ = require('lodash');
var test = require('tap').test;
var glox = require('../');

var glob_pattern = __dirname + '/fixtures/*';
var xre_pattern = '.*/(?<shape>.*)-(?<emotional_state>.*)\.txt';

var expected_matches = [
  {input: __dirname + '/fixtures/circle-zen.txt',      shape:'circle',   emotional_state:'zen'},
  {input: __dirname + '/fixtures/square-secure.txt',   shape:'square',   emotional_state:'secure'},
  {input: __dirname + '/fixtures/triangle-angry.txt',  shape:'triangle', emotional_state:'angry'},
];



function verify_bridge(t, files, bridge){
  t.plan(9);
  var i = 0;
  _.each(files, bridge(function(matches){
    verify_matches(t, expected_matches[i], matches);
    i += 1;
  }));
}

function verify_sugar(t, f){
  t.plan(9);
  i = 0;
  f(function(matches){
    verify_matches(t, expected_matches[i], matches);
    i += 1;
  });
}

function verify_matches(t, actual, expected){
  t.equal(actual.input, expected.input, 'file found');
  t.equal(actual.shape, expected.shape, 'matched shape');
  t.equal(actual.emotional_state, expected.emotional_state, 'matched emotional_state');
}




test('glox.bridge', function(t){
  verify_bridge(t, glob.sync(glob_pattern), _.partial(glox.bridge, xre_pattern))
});

test('glox', function(t){
  verify_sugar(t, _.partial(glox, glob_pattern, xre_pattern))
});

test('glox.sync', function(t){
  verify_sugar(t, _.partial(glox.sync, glob_pattern, xre_pattern))
});