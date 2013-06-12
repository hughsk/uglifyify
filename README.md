# uglifyify

A [Browserify](http://browserify.org) v2 transform which minifies your code
using [UglifyJS2](https://github.com/mishoo/UglifyJS).

## Installation

``` bash
npm install uglifyify
```

## Motivation/Usage

Ordinarily you'd be fine doing this:

``` bash
browserify index.js | uglifyjs -c > bundle.js
```

But uglifyify gives you the benefit applying Uglify's "squeeze" transform
*before* it's processed by Browserify, meaning you can remove dead code paths
for conditional requires. Here's a contrived example:

``` javascript
if (true) {
  module.exports = require('./browser')
} else {
  module.exports = require('./node')
}
```

`module.exports = require('./node')` will be excluded by Uglify, meaning that
only `./browser` will be bundled and required.

If you combine uglifyify with [envify](http://github.com/hughsk/envify), you
can make this a little more accessible. Take this code:

``` javascript
if (process.env.NODE_ENV === 'development') {
  module.exports = require('./development')
} else {
  module.exports = require('./production')
}
```

And use this to compile:

``` bash
NODE_ENV=development browserify -t envify -t uglifyify index.js -o dev.js &&
NODE_ENV=production browserify -t envify -t uglifyify index.js -o prod.js
```

It should go without saying that you should be hesitant using environment
variables in a Browserify module - this is best suited to your own
applications or modules built with Browserify's `--standalone` tag.
