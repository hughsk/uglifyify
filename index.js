var through = require('through')
  , ujs = require('uglify-js')
  , convert = require('convert-source-map')

module.exports = uglifyify
function uglifyify(file) {
  var buffer = '', match, inSourceMap = null

  if (!/\.js$|\.coffee$|\.eco|\.hbs$/.test(file)) return through()

  return through(function write(chunk) {
    buffer += chunk
  }, function ready() {
    // Check if incoming source code already has source map comment.
    // If so, send it in to ujs.minify as the inSourceMap parameter
    match = buffer.match(/\/\/[#@] sourceMappingURL=data:application\/json;base64,([a-zA-Z0-9+/]+)={0,2}$/)
    if (match) {
      inSourceMap = convert.fromJSON(Buffer(match[1], 'base64').toString())['sourcemap']

      buffer = ujs.minify(buffer, {
          fromString: true
        , compress: true
        , mangle: true
        , inSourceMap: inSourceMap
        , outSourceMap: 'out.js.map'
      })

      var map = convert.fromJSON(buffer.map)
      map.setProperty('sources', [file])
      map.setProperty('sourcesContent', inSourceMap.sourcesContent)

      this.queue(buffer.code + '\n' + map.toComment())
      this.queue(null)
    } else {
      buffer = ujs.minify(buffer, {
          fromString: true
        , compress: true
        , mangle: true
      })

      this.queue(buffer.code)
      this.queue(null)
    }
  })
}
