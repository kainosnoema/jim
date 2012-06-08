/**
 * Module dependencies.
 */

var path = require('path')
  , fse = require('fs-extra')
  , helper = require('./helper');

/**
 * Expose `Hook`.
 */

module.exports = Hook;

/**
 * Initialize `Hook` with the given `name` and `jim` (as parent).
 *
 * @param {String} name
 * @param {Jim} jim
 * @api private
 */

function Hook(name, jim) {
  if(name instanceof Hook) { return name; }

  assertIsJim(jim);

  this.name = parseName(name);

  this.jim = jim;
  this.path = path.join(jim.hooksPath, this.name);
  this.scriptPath = path.join(this.path, 'script.sh');
  this.runsPath = path.join(this.path, 'runs');
  this.process = null;
}

/**
 * Check if the hook (script file) exists.
 *
 * @return {Boolean}
 * @api private
 */

Hook.prototype.exists = function() {
  return path.existsSync(this.scriptPath);
}

/**
 * Create the project with given `options` and attempt to checkout
 * the initial branch. If it fails, we cleanup. Call `cb` when complete.
 *
 * @param {Object} options
 * @param {Function} cb
 * @return {this}
 * @api private
 */

Hook.prototype.create = function(options, cb) {
  if(this.exists()) {
    if(cb) { cb(null, this); }
    return this;
  }

  var scriptFile = options.script;
  if(!scriptFile) {
    return cb && cb(new Error('no script file given'));
  }

  var self = this;
  helper.mkdir(this.path, function(err) {
    if(err) { return cb && cb(err); }

    helper.mkdir(self.runsPath);

    fse.copy(scriptFile, self.scriptPath, function(err) {
      if(err) {
        helper.log('unable to find/copy script file', 'error');
      } else {
        helper.log(scriptFile + ' ~> ' + helper.relative(self.scriptPath), 'copy');
      }
      return cb && cb(err, self);
    });
  });

  return this;
}

Hook.prototype.command = function(params) {
  var env = '';
  if(params) {
    Object.keys(params).forEach(function(key) {
      env += ' JIM_' + key.toString().toUpperCase() + '=' + params[key];
    });
  }
  return env + ' bash ' + this.scriptPath;
}

/**
 * Run the hook script, calling `cb` when complete.
 *
 * @param {Function} cb
 *
 * @return {this}
 * @api private
 */

Hook.prototype.run = function(params, cb) {
  this.assertExists();

  helper.log(JSON.stringify(params), 'params');
  helper.log(this.name, 'running');

  var command = this.command(params)
    , self = this;

  helper.log(command, 'exec');
  this.process = helper.exec(command, { cwd: this.path }, function(err) {
    if (err) { helper.log(err, '>'); }

    if(cb) { cb(null, self); }
  });

  var runLogName = 'run-' + (new Date()).valueOf() + '.log'
    , runLog = fse.createWriteStream(path.join(self.runsPath, runLogName));
  self.process.stdout.pipe(runLog);
  self.process.stderr.pipe(runLog);

  self.process.on('exit', function() {
    self.process = null;
  });

  process.on('SIGINT', function() {
    if(self.process) { self.process.kill(); }
    process.nextTick(function() {
      process.exit(0);
    });
  });

  return this;
}

/**
 * Remove the script file for this hook.
 *
 * @api private
 */

Hook.prototype.destroy = function(cb) {
  this.assertExists();
  var self = this;
  fse.remove(this.path, function(err) {
    if (err) {
      helper.log(err, 'error');
    } else {
      helper.log(helper.relative(self.path), 'remove');
    }
    return cb && cb(err, self);
  });
}

/**
 * Throw an error if this hook's script file doesn't exist.
 *
 * @api private
 */

Hook.prototype.assertExists = function() {
  if(!this.exists()) {
    throw new Error('Hook "' + this.name + '" doesn\'t exist.');
  }
}

/**
 * Get all the hooks in the given `jim` directory.
 *
 * @param {Jim} jim
 * @return {Array}
 * @api private
 */

Hook.all = function(jim) {
  assertIsJim(jim);

  return helper.lsSync(jim.hooksPath).map(function(file) {
    return new Hook(file, jim);
  }).filter(function(hook){
    return hook.exists();
  });
}

/**
 * Parse and normalize hook name.
 *
 */

function parseName(name) {
  name = name.replace(/\.sh$/, '');
  name = name.replace(/[^\w]/, '-');
  return name;
}

/**
 * Make sure we have an instance of Jim.
 * We have to lazy load to avoid circular require issues.
 *
 */

function assertIsJim(instance) {
  if(!(instance instanceof require('./jim'))) {
    throw new Error('Parent must be an instance of Jim');
  }
}

