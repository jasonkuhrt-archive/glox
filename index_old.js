var assert = require('assert');
var path = require('path');
var format = require('util').format;
var _ = require('lodash')
var glob = require('glob');
var xre = require('xregexp').XRegExp;



// @description
// Use @pattern to read files from directory
// AND extract data from file names. For each
// match callback @callback with results.
//
// @param pattern
//   A path and xregexp pattern to match files within path
//   path is relative from executing-file's current directory path
//   eg: '../foo/bar-(?:<bar_type>.*)-bar.coffee'
//
// @param callback
//   A function invoked for each found file
//   callback(file_path, matches)
//   @param file_path
//     The full file_path of matched file
//     eg: for example pattern above
//         /foo/bar/bar-mocha-bar.coffee
//   @param matches
//     The file_name matches
//     eg: For example pattern above
//         {bar_type: 'mocha'}
//
module.exports = function(pattern, callback){
  assert_pattern(pattern);
  assert_callback(callback);

  var pattern_ = parse_pattern(pattern);
  glob(pattern_.glob, do_callback);

  function do_callback(err, file_names){
    if (err) return callback(err);
    if (!file_names.length) return callback(null);
    // Callback 'err' prefilled with null since we
    // return early, once, if there is an error during io
    return callback(null, make_results(file_names, pattern_.xre));
  }
};



module.exports.sync = function(pattern){
  assert_pattern(pattern);

  var pattern_ = parse_pattern(pattern);
  var paths = glob.sync(pattern_.glob);

  return paths.length ? make_results(paths, pattern_.xre) : null ;
}



// Helpers

function make_results(paths, xre_pattern){
  var test = create_test(xre_pattern);

  return _.transform(paths, do_reduce, []);

  function do_reduce(acc, x){
    var matches = test(x);
    if (matches) { acc.push({path:x, matches:matches}) }
  }
}

function assert_pattern(pattern){
  assert(typeof pattern === 'string', format('Argument \'pattern\': Expected type String, but was %s.', typeof pattern));
}

function assert_callback(callback){
  assert(typeof callback === 'function', format('argument \'callback\' Expected type Function, but was %s.', typeof callback));
}

function create_test(xre_pattern){
  return _.partialRight(xre.exec.bind(xre), xre(xre_pattern))
}

// Divide pattern into its glob and xre components
function parse_pattern(pattern){
  return {
    // glob_pattern handles getting files from the correct directory
    glob: path.join(_.initial(pattern.split('/')).join('/'), '/*'),
    // filename_data_pattern handles ensuring the file is relevant and if so extracting data
    xre: '.*/' + _.last(pattern.split('/'))
  };
}



// Functional Helpers

// Pass array item to f if test is
// passed. Test result is also passed
// to f. e.g.:
//   when_pass( datoms, test, function(datom, test_result){...} )
// function when_pass(array, test, f){
//   _.each(array, function(item){
//     var result = test(item);
//     if (result) { f(item, result) }
//   });
// }