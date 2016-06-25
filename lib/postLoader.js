/**
 * Catches and stores the compiled content.
 */
module.exports = function (content) {
  let options = this.options.module.postLoaders
    .find(elm => elm.loader === require.resolve('./postLoader.js'))

  if (options.cache[this.resourcePath]) {
    options.cache[this.resourcePath].content = content
  }

  return content
}
