var minimatch = require('minimatch').Minimatch
  , convert = require('convert-source-map')
  , through = require('through')
  , path = require('path')
  , ujs = require('uglify-js')
  , extend = require('extend')

module.exports = uglifyify

function uglifyify(file, opts) {
  opts = opts || {}

  if (ignore(file, opts.ignore)) {
    return through()
  }

  var buffer = ''
  var exts = []
    .concat(opts.exts || [])
    .concat(opts.x || [])

  if (
    /\.json$/.test(file) ||
    exts.length &&
    exts.indexOf(path.extname(file)) === -1
  ) {
    return through()
  }

  return through(function write(chunk) {
    buffer += chunk
  }, capture(function ready() {
    opts = extend({}, {
      fromString: true
      , compress: true
      , mangle: true
    }, opts)

    if (typeof opts.compress === 'object') {
      delete opts.compress._
    }

    // Check if incoming source code already has source map comment.
    // If so, send it in to ujs.minify as the inSourceMap parameter
    var sourceMaps = buffer.match(
      /\/\/[#@] ?sourceMappingURL=data:application\/json;base64,([a-zA-Z0-9+\/]+)={0,2}$/
    )

    if(sourceMaps) {
      opts.outSourceMap = 'out.js.map'
      opts.inSourceMap = sourceMaps && convert.fromJSON(
        new Buffer(sourceMaps[1], 'base64').toString()
      ).sourcemap
    }

    var min = ujs.minify(buffer, opts)
    this.queue(min.code)

    if (sourceMaps) {
      var map = convert.fromJSON(min.map)
      map.setProperty('sources', [file])
      map.setProperty('sourcesContent', sourceMaps
        ? opts.inSourceMap.sourcesContent
        : [buffer]
      )

      this.queue('\n')
      this.queue(map.toComment())
    }

    this.queue(null)
  }))

  function capture(fn) {
    return function() {
      try {
        fn.apply(this, arguments)
      } catch(err) {
        return this.emit('error', err)
      }
    }
  }
}

function ignore(file, list) {
  if (!list) return

  list = Array.isArray(list) ? list : [list]

  return list.some(function(pattern) {
    var match = minimatch(pattern)
    return match.match(file)
  })
}
