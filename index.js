var through = require('through')
  , jsp = require('uglify-js').parser
  , pro = require('uglify-js').uglify
  , path = require('path')

module.exports = uglifyify
function uglifyify(file) {
  var buffer = ''

  if (path.extname(file) !== '.js') return through()

  return through(function write(chunk) {
    buffer += chunk
  }, function ready() {
    var ast = jsp.parse(buffer)

    ast = pro.ast_mangle(ast)
    ast = pro.ast_squeeze(ast)

    this.queue(pro.gen_code(ast))
    this.queue(null)
  })
}
