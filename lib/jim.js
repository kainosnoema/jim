/**
 * Module dependencies.
 */

var path = require('path')
  , helper = require('./helper')
  , Hook = require('./hook');

/**
 * Expose `Jim`.
 */

module.exports = Jim;

/**
 * Initialize `Jim` with the given `options`.
 *
 * Options:
 *
 *   - `workingPath` the working path for commands
 *
 * @param {Object} options
 * @api private
 */

function Jim(options) {
  var defaults = {
    workingPath: process.cwd()
  };

  this.options = helper.merge(defaults, options);
  this.workingPath = this.options.workingPath;
  this.hooksPath = path.join(this.workingPath, 'hooks');
}

/**
 * Check with Jim is installed in the current working path.
 *
 * @return {Boolean}
 * @api private
 */

Jim.prototype.installed = function() {
  return path.existsSync(this.hooksPath);
}

/**
 * Install Jim at the current working path, calling `cb` when complete.
 *
 * @param {Function} cb
 * @return {this}
 * @api private
 */

Jim.prototype.install = function(cb) {
  if(this.installed()) {
    throw new Error('Jim already installed.');
  }

  var self =  this;
  helper.mkdir(this.workingPath, function() {
    helper.mkdir(self.hooksPath);
    return cb && cb(null, this);
  });

  return this;
}

/**
 * Return a `Hook` for the given `name`. It may or may not exist.
 *
 *   `name` may contain alpha-numeric, '-' and '_'.
 *
 * @param {String} name
 * @return {this}
 * @api private
 */

Jim.prototype.hook = function(name) {
  this.assertInstalled();
  return new Hook(name, this);
}

/**
 * Get all the hooks in the given current directory.
 *
 * @return {Array}
 * @api private
 */

Jim.prototype.__defineGetter__("hooks", function() {
  return Hook.all(this);
});

/**
 * Create and configure a hook from `options` (see Hook#create),
 * calling `cb` when complete.
 *
 * @param {String} name
 * @return {this}
 * @api private
 */

Jim.prototype.add = function(name, options, cb) {
  return this.hook(name).create(options, cb);
}

/**
 * Remove the hook for the given `name`, calling `cb` when complete.
 *
 * @param {String} name
 * @return {this}
 * @api private
 */

Jim.prototype.remove = function(name, cb) {
  this.hook(name).destroy();
}

/**
 * Runs the hook for the given `name`, calling `cb` when complete.
 *
 * @param {String} name
 * @return {this}
 * @api private
 */

Jim.prototype.run = function(name, envVars, cb) {
  return this.hook(name).run(envVars, cb);
}

/**
 * Assert that jim is installed.
 */

Jim.prototype.assertInstalled = function() {
  if(!this.installed()) {
    throw new Error('Jim not installed at current working path. ' +
                    'Run `jim install .` or change working paths.');
  }
}
