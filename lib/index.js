const readline = require('readline')
const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')
const when = require('when')
const nodefn = require('when/node')
const micromatch = require('micromatch')
const SpikeUtils = require('spike-util')
const _ = require('./lodash.js')

module.exports = class FrontMatter {
  constructor (options) {
    this.site = { 'all': this.all }
    this.page = {}
  }

  apply (compiler) {
    this.util = new SpikeUtils(compiler.options)
    this.root = compiler.context
    this.extensions = compiler.options.spike.matchers
    this.cache = {}

    this.injectLoader(compiler.options)

    compiler.plugin('compilation', compilation => {
      _.empty(this.cache)
      this.walkDir(this.root, compilation.options.spike.ignore)
        .then(files => when.filter(files, this.hasFrontMatter)
          .then(this.processFiles.bind(this)))
    })
  }

  /**
   * Injects the preLoader and postLoader into the compiler.
   *
   * @param {Object} options - compiler options
   */
  injectLoader (options) {
    if (!options.module.preLoaders) options.module.preLoaders = []

    options.module.preLoaders.push({
      'loader': require.resolve('./preLoader.js'),
      'cache': this.cache,
      'page': this.page
    })

    if (!options.module.postLoaders) options.module.postLoaders = []

    options.module.postLoaders.unshift({
      'loader': require.resolve('./postLoader.js'),
      'cache': this.cache
    })
  }

  /**
   * Process front matter from a list of files. Parses the data then passes to
   * pushData.
   *
   * @param {Array[string]} files - array of files to process
   */
  processFiles (files) {
    files.forEach((file) =>
      this.readFrontMatter(file)
        .then((data) => {
          if (!data) data = {}
          let folders = path.dirname(path.relative(this.root, file)).split(path.sep)
          data._categories = _.clone(folders)
          data._url = this.util.getOutputPath(file).relative

          this.pushData(folders, this.site, data)
          this.cache[file] = data
        }))
  }

  /**
   * Recursively push data onto locals at the end of path.
   *
   * @param {Array[strings]} path - path segments
   * @param {Object} locals - the object to push the data onto
   */
  pushData (path, locals, data) {
    if (path.length < 1) {
      locals.push(data)
      locals.all = this.all
      return
    }

    let f = path.shift()
    if (!locals[f]) locals[f] = []

    this.pushData(path, locals[f], data)
  }

  /**
   * Returns an array of all sibling front matter objects and their children.
   */
  all () {
    let values = []
    let recurse = obj => {
      for (let property in obj)
        if (_.isArray(obj[property])) values = values.concat(obj[property])
        else recurse(obj[property])
    }

    recurse(this)
    return values
  }

  /**
   * Check for front matter by reading the first three bytes of the file.
   * If they equal '---' assume the file contains front matter.
   *
   * @param  {string} file - path to the file to check
   * @return {Boolean} promise returning true or false
   */
  hasFrontMatter (file) {
    let deferred = when.defer()
    let res = false

    fs.createReadStream(file, {encoding: 'utf-8', start: 0, end: 2})
      .on('error', deferred.reject)
      .on('end', () => deferred.resolve(res))
      .on('data', (data) => res = (data === '---'))

    return deferred.promise
  }

  /**
   * Read and parse yaml front matter from file.
   *
   * @param  {string} file - path to the file to check
   * @return {Object} promise the data as an object
   */
  readFrontMatter (file) {
    let deferred = when.defer()

    let frontMatter = ''
    let rl = readline.createInterface({input: fs.createReadStream(file, {start: 3})})
      .on('error', deferred.reject)
      .on('line', (line) => {
        if (line === '---') return rl.close()

        frontMatter += line + '\n'
      }).on('close', () =>
        deferred.resolve(yaml.safeLoad(frontMatter)))

    return deferred.promise
  }

  /**
   * Recursively walk a directory gathering all files.
   *
   * @param  {string} dir - directory to process
   * @param  {Array[string]} ignore - array of patterns to ignore
   * @return {Array[string]} promise returning array of file paths
   */
  walkDir (dir, ignore) {
    let deferred = when.defer()

    nodefn.call(fs.readdir, dir).then(contents =>
      when.all(contents.map(file => this.walkFile(`${dir}/${file}`, ignore)))
        .then(files =>
          deferred.resolve(_.flatten(files).filter(file =>
            file !== undefined)),
        err => deferred.reject(err))
    , err => deferred.reject(err))

    return deferred.promise
  }

  walkFile (file, ignore) {
    let deferred = when.defer()

    if (micromatch(file, ignore).length > 0) {
      deferred.resolve([])
      return
    }

    nodefn.call(fs.stat, file).then(info => {
      if (info.isDirectory()) {
        this.walkDir(file, ignore)
          .then(contents => deferred.resolve(contents),
          err => deferred.reject(err))
      } else {
        deferred.resolve(file)
      }
    }, err => deferred.reject(err))

    return deferred.promise
  }
}
