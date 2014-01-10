var through = require('through')
  , ujs = require('uglify-js')

module.exports = uglifyify
function uglifyify(file) {
  var buffer = ''

  if (!/\.js$|\.coffee$|\.eco|\.hbs$/.test(file)) return through()

  return through(function write(chunk) {
    buffer += chunk
  }, function ready() {
    buffer = ujs.minify(buffer, {
        fromString: true
      , compress: true
      , mangle: true
    })

    this.queue(buffer.code)
    this.queue(null)
  })
}
