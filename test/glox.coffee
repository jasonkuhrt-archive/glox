glob = require('glob')
_ = require('lodash')
test = require('tap').test
glox = require('../')
bail = (f_base)->
  ->
    throw arguments[0] if (arguments[0])
    f_base.apply(null, _.rest(arguments))



glob_pattern = __dirname + '/fixtures/*'
xre_pattern = '.*/(?<shape>.*)-(?<emotional_state>.*)\.txt'

expected_matches = [
  {input: __dirname + '/fixtures/circle-zen.txt',      shape:'circle',   emotional_state:'zen'}
  {input: __dirname + '/fixtures/square-secure.txt',   shape:'square',   emotional_state:'secure'}
  {input: __dirname + '/fixtures/triangle-angry.txt',  shape:'triangle', emotional_state:'angry'}
]

verify_result = (t, matches)->
  t.plan(9)
  _.each matches, (match, i)->
    assert_match(t, match, expected_matches[i])

assert_match = (t, expected, actual)->
  t.equal(actual.input, expected.input, 'file found')
  t.equal(actual.shape, expected.shape, 'matched shape')
  t.equal(actual.emotional_state, expected.emotional_state, 'matched emotional_state')



test 'glox', (t)->
  glox(glob_pattern, xre_pattern, bail(_.partial(verify_result, t)))

test 'glox.sync', (t)->
  verify_result(t, glox.sync(glob_pattern, xre_pattern))