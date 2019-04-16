'use strict'

/*
 * adonis-queue
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const path = require('path')
const _ = require('lodash')
const pluralize = require('pluralize')
const generators = exports = module.exports = {}

generators.job = {
  /**
   * Returns data for the job template
   *
   * @method getData
   * @param  {String} name
   * @param  {Object} flags
   * @return {Object}
   */
  getData (name, { queue }) {
    return {
      name: this.getFileName(name),
      queue: queue,
      commandName: _.snakeCase(this.getFileName(name)).replace(/_/g, ':')
    }
  },

  /**
   * Returns file name for the command file
   *
   * @method getFileName
   * @param  {String} name
   * @return {String}
   */
  getFileName (name) {
    name = name.replace(/job/ig, '')
    return pluralize.singular(_.upperFirst(_.camelCase(name)))
  },

  /**
   * Returns file path for the command file
   *
   * @method getFilePath
   * @param  {String}    name
   * @param  {Object}    options
   * @return {String}
   */
  getFilePath (name, options) {
    return path.join(options.appRoot, options.appDir, options.dirs.jobs, this.getFileName(name)) + '.js'
  }
}
