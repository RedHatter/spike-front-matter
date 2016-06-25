const _ = require('lodash')
_.mixin({
  /**
   * Removes all properties from the object.
   *
   * @param {object} object - object to remove properties from
   */
  empty: function (object) {
    for (let property in object)
      delete object[property]

    return object
  }
})

module.exports = _
