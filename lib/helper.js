/**
 * Module dependencies.
 */

var fs = require('fs')
  , path = require('path')
  , mkdirp = require('mkdirp')
  , spawn = require('child_process').spawn;

/**
 * Merge object b with object a.
 *
 *     var a = { foo: 'bar', bar: 'bar' }
 *       , b = { bar: 'baz' };
 *
 *     helper.merge(a, b);
 *     // => { foo: 'bar', bar: 'baz' }
 *
 */

exports.merge = function(a, b){
  if (a && b) {
    for (var key in b) {
      a[key] = b[key];
    }
  }
  return a;
}

/**
 * Get path relative to cwd.
 *
 */

exports.relative = function (absPath) {
  return path.relative(process.cwd(), absPath);
}

/**
 * syncronous ls.
 *
 */
exports.lsSync = function(dir, fn) {
  return fs.readdirSync(dir);
}

/**
 * mkdir -p.
 *
 */

exports.mkdir = function(dir, fn) {
  mkdirp(dir, '0755', function(err, made){
    if (err) { throw err; }
    if(made) { exports.log(exports.relative(dir), 'create'); }
    if(fn) { fn(); }
  });
}

/**
 * Write `str` to `file`.
 *
 */

exports.write = function(file, str) {
  fs.writeFileSync(file, str);
  exports.log(exports.relative(file), 'write');
}

/**
 * Execute cmd and gracefully handle err/out.
 *
 */

exports.exec = function(cmd, opts, cb) {
  var child = spawn('bash', ['-c', cmd], opts)
    , stderr = ''
    , stdout = '';

  child.stderr.on('data', function(data) {
    stderr += data;
    exports.log(data.toString(), '>');
  });

  child.stdout.on('data', function(data) {
    stdout += data;
    exports.log(data.toString(), '>');
  });

  child.on('exit', function(code) {
    var err = stderr.toString().replace(/Command failed: |error: /gi, '');
    if(cb) { cb(code === 0 ? null : err, stdout.trim()); }
  });

  return child;
}

exports.clean = function(str) {
  // remove existing ascii escape sequences
  return str.replace(/\x1b\[([0-9]*m|\w{2})/g, '');
}

/**
 * Log `msg` with color based on `action`.
 *
 */

exports.log = function(msg, type) {
  if (type == '>') {
    msg.split(/\n+/).forEach(function(line) {
      line = exports.clean(line.replace(/\W+$/, ''));
      if(!line.length) { return; }
      console.log('      \033[90m> %s\033[0m', line);
    });
    return;
  }

  type = type || 'info';

  var color;
  switch(type) {
    case 'write':
    case 'create':
    case 'success':
    case '\u2713':
      color = 32;
      break;
    case 'warn':
    case 'debug':
    case 'remove':
      color = 33;
      break;
    case 'error':
    case '\u2717':
      color = 31;
    break;
    default:
      color = 34;
  }

  if (color === 31) {
    console.error('   \033[31m%s\033[0m %s', type, msg);
  } else {
    console.log('   \033[%sm%s\033[0m %s', color, type, msg);
  }
}