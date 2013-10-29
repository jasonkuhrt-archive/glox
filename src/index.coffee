_ = require('lodash')
glob = require('glob')
xre = require('xregexp').XRegExp
assert = require('assert-plus')



# glox uses a given glob pattern and given regexp pattern
# to return an array of regexp matches.
#
# Specifically, the given regexp is matched against each path
# found by glob. Paths failing regexp matching are discarded.


# Async glox
#
# @param gpat
# @param xpat
# @param options
# @param callback
#
module.exports = glox = (gpat, xpat, options, callback)->
  assert.string gpat, 'gpat'
  assert.string xpat, 'xpat'
  #TODO handle optional options

  glob gpat, options, (er, paths)->
    return callback(er) if er
    callback(null, find_matches(paths, xpat))



# Sync glox
# See docs for glox
glox.sync = (gpat, xpat, options)->
  assert.string gpat, 'gpat'
  assert.string xpat, 'xpat'
  #TODO handle optional options

  find_matches(glob.sync(gpat, options), xpat)


# Utility that runs a given regexp against
# a given array of strings.
# Returns an array of regexp matches.
find_matches = (strings, xpat)->
  assert.arrayOfString(strings)
  assert.string(xpat)
  matcher = _.partialRight(xre.exec, xre(xpat))
  matches = _.compact(_.map(strings, (str)-> matcher(str)))









glox.convention  = convention = (gpat)->
  do_trans = (acc, v, k)-> acc[k] = _.partial(v, gpat)
  _.transform(glox.convention, do_trans, {})


convention.inject = (gpat, xpat, host_or_factory, manual_trigger)->
  assert.string gpat
  assert.string xpat
  assert.bool _.isFunction(host_or_factory) or _.isPlainObject(host_or_factory)
  assert.optionalFunc manual_trigger

  _.each glox.sync(gpat, xpat, {}), (match)->
    f =
    if _.isFunction(host_or_factory)
    then host_or_factory(match)
    else host_or_factory[match[1]]

    assert.func f, 'inject function'

    do_f = ->
      args = if _.isFunction(host_or_factory) then [f] else [f, host_or_factory]
      require(match.input)(args...)
    do_f.f = f

    if manual_trigger then manual_trigger(do_f, match) else do_f()


convention.mocha = (gpattern, xpat, host_or_factory)->
  glox.convention.inject gpattern, xpat, host_or_factory, (do_inject, match)->
    describe _.rest(match).join(' '), ->
      # TODO ident needs to change, @it ?
      beforeEach -> @cmd = do_inject.f
      do_inject()