/**
 * Module dependencies.
 */

var http = require('http')
  , connect = require('connect')
  , helper = require('./helper')
  , Jim = require('./jim');

// setup

var jim = new Jim()
  , app = connect();

// Expose `app`

module.exports = http.createServer(app);

/**
 * Add middleware to `connect` server
 */

app.use(connect.query());
app.use(connect.bodyParser())
app.use(function(req, res) {
  if (req.method != "POST") {
    res.statusCode = 403;
    return res.end();
  }

  /*
   * get hook from route
   */
  var route = req.url.match(/^\/hooks\/([^\/\?\.]*)/)
    , hookName = route && route[1]
    , hook = hookName && jim.hook(hookName);

  if(!hook || !hook.exists()) {
    res.statusCode = 404;
    return res.end('hook not found');
  }

  // run hook

  hook.run(helper.merge(req.body, req.query));

  res.statusCode = 200;
  res.end();
});
