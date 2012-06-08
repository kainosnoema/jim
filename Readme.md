# Captain James "Jim" Hook

Simple webhook server, built on [node](http://nodejs.org).

NOTE: In early-stage development.

## Installation

    $ npm install -g jim

## Quick Start

Install server

    $ npm install -g jim
    $ jim install ./jim
    $ cd jim

Add a webhook with a shell command

    $ jim add deploy-project -c "echo 'Prepare to die, Peter Pan!'"

  ... or from an existing script

    $ jim add deploy-project ~/project/deploy.sh

Run the hook directly

    $ jim run deploy-project

Start the webserver

    $ jim server -p 8080 &

Trigger the hook remotely with env vars

    curl -X POST http://localhost:8080/hooks/deploy-project?branch=staging
    # hook script is run with `JIM_BRANCH=staging`

## Features

So far:

  - Easy CLI
  - HTTP API

(in development)

## Todo

  - Authentication
  - Tests

## License

(The MIT License)

Copyright (c) 2012 Evan Owen &lt;kainosnoema@gmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.