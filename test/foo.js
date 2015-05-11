var result
var useX = true

if(useX) {
  result = require('./bar')
} else {
  result = require('./baz')
}

module.exports = result
