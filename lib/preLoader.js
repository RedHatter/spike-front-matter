const _ = require('./lodash.js')

/**
 * Injects the front matter into the page local and remove from content.
 */
module.exports = function (content) {
  let options = this.options.module.preLoaders
    .find(elm => elm.loader === require.resolve('./preLoader.js'))

  _.empty(options.page)
  _.extend(options.page, options.cache[this.resourcePath])

  if (content.substring(0, 3) === '---') {
    content = content.substring(content.indexOf('---', 4) + 3)
  }

  return content
}
